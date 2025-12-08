'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition, useEffect, useRef } from 'react'
import PayWith from './PayWith'
import YourTrip from './YourTrip'
import ApartmentSummary from './ApartmentSummary'
import StripePaymentForm from './StripePaymentForm'
import StripeProvider from '@/components/StripeProvider'
import { handleCheckoutSubmit } from './actions'
import { getApartmentById } from '@/services/apartments'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import Input from '@/shared/Input'
import { Button } from '@/shared/Button'
import { validateCheckoutForm, sanitizeString } from '@/utils/validation'
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '@/utils/dateUtils'
import { checkRoomAvailability } from '@/services/availability'

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const { currency, convert } = useCurrency()
  const T = useT()
  const Booking = T.Booking as Record<string, string>
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const basePrice = Number(searchParams.get('price') || 0)
  const apartmentId = searchParams.get('apartmentId') || ''
  
  const urlCheckin = searchParams.get('checkin')
  const urlCheckout = searchParams.get('checkout')
  const urlGuestAdults = searchParams.get('guestAdults')
  const urlGuestChildren = searchParams.get('guestChildren')
  const urlGuestRooms = searchParams.get('guestRooms')

  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (urlCheckin) {
      const date = new Date(urlCheckin)
      return isNaN(date.getTime()) ? null : date
    }
    return null
  })
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (urlCheckout) {
      const date = new Date(urlCheckout)
      return isNaN(date.getTime()) ? null : date
    }
    return null
  })
  
  useEffect(() => {
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    
    if (checkin) {
      try {
        const newStart = parseYYYYMMDDToDate(checkin)
        if (!startDate || formatDateToYYYYMMDD(startDate) !== checkin) {
          setStartDate(newStart)
        }
      } catch {
      }
    }
    
    if (checkout) {
      try {
        const newEnd = parseYYYYMMDDToDate(checkout)
        if (!endDate || formatDateToYYYYMMDD(endDate) !== checkout) {
          setEndDate(newEnd)
        }
      } catch {
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  
  const [promoCode, setPromoCode] = useState<string>('')
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)
  const [promoCodePrice, setPromoCodePrice] = useState<number | null>(null)
  const [apartmentDiscountCode, setApartmentDiscountCode] = useState<string | null>(null)
  
  const [availability, setAvailability] = useState<{
    available: boolean | null
    message?: string
  }>({ available: null })
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false)
  const [apartmentData, setApartmentData] = useState<{ hotelId: string; roomId: number } | null>(null)
  
  useEffect(() => {
    const loadApartmentData = async () => {
      if (apartmentId && /^[0-9a-fA-F]{24}$/.test(apartmentId)) {
        try {
          const apartment = await getApartmentById(apartmentId)
          if (apartment) {
            if (apartment.discountCode) {
              setApartmentDiscountCode(apartment.discountCode)
            }
            if (apartment.hotelId && apartment.roomId) {
              setApartmentData({
                hotelId: apartment.hotelId,
                roomId: apartment.roomId,
              })
            }
          }
        } catch (error) {
          console.error('[Checkout] Error loading apartment data:', error)
        }
      }
    }
    loadApartmentData()
  }, [apartmentId])
  
  const availabilityControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!startDate || !endDate) {
      if (availabilityControllerRef.current) {
        availabilityControllerRef.current.abort()
        availabilityControllerRef.current = null
      }
      setAvailability({ available: null })
      return
    }
    
    if (!apartmentData) {
      return
    }
    
    if (availabilityControllerRef.current) {
      availabilityControllerRef.current.abort()
    }
    
    const controller = new AbortController()
    availabilityControllerRef.current = controller
    
    const timeoutId = setTimeout(async () => {
      if (controller.signal.aborted) {
        return
      }

      setIsCheckingAvailability(true)
      try {
        const checkInDate = formatDateToYYYYMMDD(startDate)
        const checkOutDate = formatDateToYYYYMMDD(endDate)
        
        const result = await checkRoomAvailability({
          hotelId: Number(apartmentData.hotelId),
          roomId: apartmentData.roomId,
          checkInDate,
          checkOutDate,
          currency: currency.toUpperCase(),
        }, controller.signal)
        
        if (!controller.signal.aborted) {
          setAvailability(result)
        }
      } catch (error: any) {
        if (error?.message === 'Request anulat' || controller.signal.aborted) {
          return
        }
        
        console.warn('[Checkout] Error checking availability:', error)
        if (!controller.signal.aborted) {
          setAvailability({
            available: false,
            message: 'Eroare la verificarea disponibilității. Vă rugăm să încercați din nou.',
          })
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsCheckingAvailability(false)
        }
        if (availabilityControllerRef.current === controller) {
          availabilityControllerRef.current = null
        }
      }
    }, 500)
    
    return () => {
      clearTimeout(timeoutId)
      if (availabilityControllerRef.current) {
        availabilityControllerRef.current.abort()
        availabilityControllerRef.current = null
      }
    }
  }, [startDate, endDate, apartmentData, currency])

  const calculateNights = (start: Date | null, end: Date | null): number => {
    if (!start || !end) {
      return Number(searchParams.get('nights') || 1)
    }
    
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays >= 1 ? diffDays : 1
  }

  const nights = calculateNights(startDate, endDate)
  
  const effectivePricePerNight = promoCodePrice !== null 
    ? convert(promoCodePrice, 'RON', currency) 
    : convert(basePrice, 'RON', currency)
  
  const subtotal = effectivePricePerNight * nights
  const finalTotalPrice = subtotal

  const serviceCharge = 0
  const fee = 0
  const tax = 0
  
  const handleApplyPromoCode = async () => {
    setPromoCodeError(null)
    
    if (!promoCode.trim()) {
      setPromoCodeError('Introduceți un cod promoțional')
      return
    }
    
    try {
      const promoPrice = await getPromoCodePrice(apartmentId, promoCode.trim().toUpperCase())
      
      if (promoPrice !== null && promoPrice > 0) {
        setPromoCodePrice(promoPrice)
        setAppliedPromoCode(promoCode.trim().toUpperCase())
        setPromoCodeError(null)
      } else {
        setPromoCodeError('Cod promoțional invalid, expirat sau neaplicabil pentru acest apartament')
        setPromoCodePrice(null)
        setAppliedPromoCode(null)
      }
    } catch (error) {
      console.error('[Checkout] Error applying promo code:', error)
      setPromoCodeError('Eroare la aplicarea codului promoțional')
      setPromoCodePrice(null)
      setAppliedPromoCode(null)
    }
  }
  
  const getPromoCodePrice = async (aptId: string, code: string): Promise<number | null> => {
    try {
      const discountCodes = await apiClient.get<Array<{
        _id?: string
        id?: string
        code: string
        price?: number
        discount?: number
        value?: number
        discountType?: 'fixed' | 'percentage' | 'FIXED' | 'PERCENTAGE'
        expirationDate: string
        apartmentIds?: string[] | any[]
      }>>(API_ENDPOINTS.DISCOUNT_CODES.ALL)
      
      const discountCode = discountCodes.find(
        (dc) => dc.code.toUpperCase() === code.toUpperCase()
      )
      
      if (!discountCode) {
        return null
      }
      
      const expirationDate = new Date(discountCode.expirationDate)
      const now = new Date()
      
      if (expirationDate < now) {
        return null
      }
      
      if (discountCode.apartmentIds && discountCode.apartmentIds.length > 0) {
        const apartmentIdStrings = discountCode.apartmentIds.map((id: any) => {
          if (typeof id === 'object' && id.toString) {
            return id.toString()
          }
          return String(id)
        })
        
        const isApplicable = apartmentIdStrings.includes(aptId)
        if (!isApplicable) {
          return null
        }
      }
      
      const rawDiscountType = discountCode.discountType || (discountCode.value || discountCode.price ? 'fixed' : 'percentage')
      const discountType = rawDiscountType.toLowerCase() as 'fixed' | 'percentage'
      
      const discountValue = discountCode.discount || discountCode.value
      
      const nights = calculateNights(startDate, endDate)
      const totalPrice = basePrice * nights
      
      if (discountType === 'fixed' && discountValue && discountValue > 0) {
        return discountValue / nights
      }
      
      if (discountType === 'percentage' && discountValue && discountValue > 0) {
        const response = await apiClient.post<{
          originalPrice: number
          discountAmount: number
          finalPrice: number
          discountCode: {
            code: string
            discountType: string
            value: number
          }
        }>(
          API_ENDPOINTS.DISCOUNT_CODES.CALCULATE,
          {
            apartmentId: aptId,
            discountCode: code,
            originalPrice: totalPrice,
            nights: nights,
          }
        )
        
        const finalPrice = response?.finalPrice
        
        if (typeof finalPrice !== 'number' || isNaN(finalPrice) || finalPrice <= 0) {
          console.error('[Checkout] Invalid finalPrice returned from backend:', finalPrice)
          throw new Error('Backend-ul nu a returnat un preț valid')
        }
        
        return finalPrice / nights
      }
      
      return null
    } catch (error) {
      console.error('[Checkout] Error getting promo code price:', error)
      return null
    }
  }
  
  const handleRemovePromoCode = () => {
    setPromoCode('')
    setAppliedPromoCode(null)
    setPromoCodePrice(null)
    setPromoCodeError(null)
  }

  async function handleFormSubmit(formData: FormData) {
    if (isPending) {
      return
    }
    
    if (availability.available === false) {
      setValidationErrors({
        _general: availability.message || 'Camera nu este disponibilă pentru datele selectate. Vă rugăm să selectați alte date.',
      })
      return
    }
    
    if (availability.available === null) {
      setValidationErrors({
        _general: 'Te rugăm să aștepți până se verifică disponibilitatea.',
      })
      return
    }
    
    
    startTransition(() => {
      ;(async () => {
        try {
        const firstName = sanitizeString(formData.get('firstName') as string || '')
        const lastName = sanitizeString(formData.get('lastName') as string || '')
        const email = sanitizeString(formData.get('email') as string || '')
        const countryCode = formData.get('countryCode') as string || '+40'
        const phoneNumberRaw = sanitizeString(formData.get('phoneNumber') as string || '')
        const phoneNumber = countryCode + phoneNumberRaw.replace(/\s+/g, '')
        let checkInDate = formData.get('startDate') as string || ''
        let checkOutDate = formData.get('endDate') as string || ''
        
        if (!checkInDate && startDate) {
          checkInDate = startDate.toISOString()
        }
        if (!checkOutDate && endDate) {
          checkOutDate = endDate.toISOString()
        }
        
        if (checkInDate) {
          try {
            const date = new Date(checkInDate)
            if (!isNaN(date.getTime())) {
              checkInDate = formatDateToYYYYMMDD(date)
            }
          } catch (e) {
          }
        }
        if (checkOutDate) {
          try {
            const date = new Date(checkOutDate)
            if (!isNaN(date.getTime())) {
              checkOutDate = formatDateToYYYYMMDD(date)
            }
          } catch (e) {
          }
        }
        
        const validation = validateCheckoutForm({
          firstName,
          lastName,
          email,
          phoneNumber,
          apartmentId,
          checkInDate,
          checkOutDate,
          totalPrice: finalTotalPrice,
        })
        
        if (!validation.isValid) {
          setValidationErrors(validation.errors)
          const firstErrorField = Object.keys(validation.errors)[0]
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(errorElement as HTMLElement).focus()
          }
          return
        }
        
        setValidationErrors({})
        
        const apartment = await getApartmentById(apartmentId)
        if (!apartment) {
          throw new Error('Apartamentul nu a fost găsit')
        }
        if (!apartment.hotelId) {
          throw new Error('Apartamentul nu are hotelId configurat')
        }
        if (!apartment.roomId) {
          throw new Error('Apartamentul nu are roomId configurat')
        }

        const pricePerNightInRON = promoCodePrice !== null ? promoCodePrice : basePrice
        const totalPriceInRON = pricePerNightInRON * nights
        
        const reservationData: {
          apartmentId: string
          hotelId: string
          roomId: number
          price: number
          pricePerNight: number
          nights: number
          totalPrice: number
          promoCode: string | null
          promoCodePrice: number | null
          checkInDate: string
          checkOutDate: string
          guestAdults: number
          guestChildren: number
          guestRooms: number
          firstName: string
          lastName: string
          email: string
          phoneNumber: string
          currency: string
        } = {
          apartmentId,
          hotelId: apartment.hotelId, // ID-ul proprietății
          roomId: apartment.roomId, // ID-ul apartamentului din Pynbooking
          price: basePrice, // Prețul original în RON
          pricePerNight: pricePerNightInRON, // Prețul pe noapte în RON (cu sau fără promocode)
          nights,
          totalPrice: totalPriceInRON, // Prețul total în RON
          promoCode: appliedPromoCode,
          promoCodePrice: promoCodePrice, // Prețul din promocode în RON
          checkInDate,
          checkOutDate,
          guestAdults: Number(formData.get('guestAdults') || 1),
          guestChildren: Number(formData.get('guestChildren') || 0),
          guestRooms: Number(formData.get('guestRooms') || 1),
          firstName,
          lastName,
          email,
          phoneNumber,
          currency: currency, // Currency-ul selectat pentru afișare
        }
        
        sessionStorage.setItem('reservationData', JSON.stringify(reservationData))
        
        formData.set('totalPrice', finalTotalPrice.toString())

        const result = await handleCheckoutSubmit(formData)
        if (result?.success && result?.clientSecret) {
          setClientSecret(result.clientSecret)
        } else {
          console.error('[Checkout] Failed to get clientSecret:', result)
          setValidationErrors({
            _general: 'Nu s-a putut inițializa procesarea plății. Vă rugăm să încercați din nou.',
          })
        }
      } catch (error) {
        console.error('[Checkout] Error submitting form:', error)
        setValidationErrors({
          _general: error instanceof Error ? error.message : 'A apărut o eroare. Vă rugăm să încercați din nou.',
        })
      }
      })() // IIFE pentru async
    })
  }

  return (
    <main className="container mt-10 mb-24 flex flex-col gap-14 lg:mb-32 lg:flex-row lg:gap-10">
      <div className="w-full lg:w-3/5 xl:w-2/3">
        {!clientSecret ? (
          <Form
            action={handleFormSubmit}
            className="flex flex-col gap-y-8 border-neutral-200 px-0 sm:rounded-4xl sm:border sm:p-6 xl:p-8 dark:border-neutral-700"
          >
            <h1 className="text-3xl font-semibold lg:text-4xl">{T.Booking['Reserve and pay']}</h1>
            <Divider />
            <YourTrip 
              onDatesChange={(start, end) => {
                setStartDate(start)
                setEndDate(end)
              }}
            />
            <Divider />
            
            <PayWith
              apartmentId={apartmentId}
              pricePerNight={effectivePricePerNight}
              nights={nights}
              totalPrice={finalTotalPrice}
              serviceCharge={serviceCharge}
              fee={fee}
              tax={tax}
              currency={currency}
              validationErrors={validationErrors}
            />
            
            {/* Hidden fields pentru datele necesare backend-ului */}
            <input type="hidden" name="apartmentId" value={apartmentId} />
            <input type="hidden" name="totalPrice" value={finalTotalPrice.toString()} />
            <input type="hidden" name="currency" value={currency} />
            {appliedPromoCode && <input type="hidden" name="promoCode" value={appliedPromoCode} />}
            
            {validationErrors._general && (
              <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                {validationErrors._general}
              </div>
            )}
            
            {/* Availability Status */}
            {startDate && endDate && (
              <div className="mb-6">
                {isCheckingAvailability ? (
                  <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 dark:border-neutral-700 dark:bg-neutral-800/50">
                    <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>{Booking['Checking availability'] || 'Se verifică disponibilitatea...'}</span>
                    </div>
                  </div>
                ) : availability.available === false ? (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-sm font-medium text-red-800 dark:text-red-200">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span>{availability.message || (Booking['Room is not available'] || 'Camera nu este disponibilă pentru datele selectate')}</span>
                      </div>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
            
            {/* Promocode Section - Mobile (deasupra butonului) */}
            <div className="mb-6 lg:hidden">
              <label className="mb-2 block text-sm font-medium text-neutral-950 dark:text-white">
                {Booking['Promo Code'] || 'Cod promoțional'}
              </label>
              {!appliedPromoCode ? (
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={promoCode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setPromoCode(e.target.value)
                      setPromoCodeError(null)
                    }}
                    placeholder={Booking['Enter promo code'] || 'Introduceți codul'}
                    className="flex-1"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleApplyPromoCode()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    onClick={handleApplyPromoCode}
                    className="shrink-0"
                  >
                    {Booking['Apply'] || 'Aplica'}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      ✓ {appliedPromoCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemovePromoCode}
                    className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
                  >
                    {Booking['Remove'] || 'Elimină'}
                  </button>
                </div>
              )}
              {promoCodeError && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{promoCodeError}</p>
              )}
            </div>
            
            <div>
              <ButtonPrimary 
                type="submit" 
                disabled={isPending || isCheckingAvailability || availability.available === false || availability.available === null}
                className="mt-10 w-full text-base/6!"
              >
                {isPending ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {Booking['Processing'] || 'Se procesează...'}
                  </span>
                ) : (
                  T.Booking['Reserve and pay']
                )}
              </ButtonPrimary>
            </div>
          </Form>
        ) : (
          <div className="flex flex-col gap-y-8 border-neutral-200 px-0 sm:rounded-4xl sm:border sm:p-6 xl:p-8 dark:border-neutral-700">
            <h1 className="text-3xl font-semibold lg:text-4xl">{T.Booking['Complete payment']}</h1>
            <Divider />
            <StripeProvider clientSecret={clientSecret}>
              <StripePaymentForm />
            </StripeProvider>
          </div>
        )}
      </div>

      <Divider className="block lg:hidden" />

      {/* Summary pentru desktop - afișat în sidebar */}
      <div className="hidden lg:flex grow flex-col gap-y-6 border-neutral-200 px-0 sm:gap-y-8 sm:rounded-4xl sm:p-6 lg:border xl:p-8 dark:border-neutral-700">
        {/* Afișare apartament selectat */}
        {apartmentId && <ApartmentSummary apartmentId={apartmentId} />}
        
        {/* Promocode Section */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-neutral-950 dark:text-white">
            {Booking['Promo Code'] || 'Cod promoțional'}
          </label>
          {!appliedPromoCode ? (
            <div className="flex gap-2">
              <Input
                type="text"
                value={promoCode}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setPromoCode(e.target.value)
                  setPromoCodeError(null)
                }}
                placeholder={Booking['Enter promo code'] || 'Introduceți codul'}
                className="flex-1"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleApplyPromoCode()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleApplyPromoCode}
                className="shrink-0"
              >
                {Booking['Apply'] || 'Aplica'}
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-3 dark:border-green-800 dark:bg-green-900/20">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  ✓ {appliedPromoCode}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemovePromoCode}
                className="text-sm text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-200"
              >
                {Booking['Remove'] || 'Elimină'}
              </button>
            </div>
          )}
          {promoCodeError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{promoCodeError}</p>
          )}
        </div>
        
        <DescriptionList>
          <DescriptionTerm>
            {T.Booking['per_night_x_nights']
              .replace('{price}', effectivePricePerNight.toFixed(2))
              .replace('{currency}', currency)
              .replace('{nights}', String(nights))}
          </DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${subtotal.toFixed(2)} ${currency}`}</DescriptionDetails>

          {appliedPromoCode && promoCodePrice !== null && (
            <>
              <DescriptionTerm className="text-sm text-neutral-500 dark:text-neutral-400">
                {Booking['Promo Code Applied'] || 'Cod promoțional aplicat'}: {appliedPromoCode}
              </DescriptionTerm>
              <DescriptionDetails className="text-sm text-neutral-500 dark:text-neutral-400 sm:text-right">
                {Booking['Price per night'] || 'Preț/noapte'}: {effectivePricePerNight.toFixed(2)} {currency}
              </DescriptionDetails>
            </>
          )}

          <DescriptionTerm>{T.Booking['Service charge']}</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${serviceCharge.toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm>{T.Booking['Fee']}</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${fee.toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm>{T.Booking['Tax']}</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${tax.toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm className="font-semibold text-neutral-900">{T.Booking['Total']}</DescriptionTerm>
          <DescriptionDetails className="font-semibold sm:text-right">{`${finalTotalPrice.toFixed(2)} ${currency}`}</DescriptionDetails>
        </DescriptionList>
      </div>
    </main>
  )
}

const CheckoutPage = () => {
  return (
    <Suspense fallback={
      <div className="container mt-10 mb-24">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading checkout...</div>
          </div>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}

export default CheckoutPage