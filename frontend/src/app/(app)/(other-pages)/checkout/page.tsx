'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, useTransition, useEffect } from 'react'
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
  
  // Citește datele din URL
  const urlCheckin = searchParams.get('checkin')
  const urlCheckout = searchParams.get('checkout')
  const urlGuestAdults = searchParams.get('guestAdults')
  const urlGuestChildren = searchParams.get('guestChildren')
  const urlGuestRooms = searchParams.get('guestRooms')

  // State pentru datele selectate - inițializează din URL
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
  
  // Sincronizează cu URL când se schimbă
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
        // Ignoră date invalide
      }
    }
    
    if (checkout) {
      try {
        const newEnd = parseYYYYMMDDToDate(checkout)
        if (!endDate || formatDateToYYYYMMDD(endDate) !== checkout) {
          setEndDate(newEnd)
        }
      } catch {
        // Ignoră date invalide
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])
  
  // State pentru promocode
  const [promoCode, setPromoCode] = useState<string>('')
  const [appliedPromoCode, setAppliedPromoCode] = useState<string | null>(null)
  const [promoCodeError, setPromoCodeError] = useState<string | null>(null)
  const [promoCodePrice, setPromoCodePrice] = useState<number | null>(null) // Prețul setat de promocode
  const [apartmentDiscountCode, setApartmentDiscountCode] = useState<string | null>(null)
  
  // Încarcă discountCode-ul apartamentului
  useEffect(() => {
    const loadApartmentDiscountCode = async () => {
      if (apartmentId && /^[0-9a-fA-F]{24}$/.test(apartmentId)) {
        try {
          const apartment = await getApartmentById(apartmentId)
          if (apartment?.discountCode) {
            setApartmentDiscountCode(apartment.discountCode)
          }
        } catch (error) {
          console.error('[Checkout] Error loading apartment discount code:', error)
        }
      }
    }
    loadApartmentDiscountCode()
  }, [apartmentId])

  // Calculează numărul de nopți din datele selectate
  const calculateNights = (start: Date | null, end: Date | null): number => {
    if (!start || !end) {
      // Dacă nu sunt date selectate, folosește valoarea din URL sau default 1
      return Number(searchParams.get('nights') || 1)
    }
    
    // Calculează diferența în zile (fără ore/min/sec)
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const endDate = new Date(end.getFullYear(), end.getMonth(), end.getDate())
    
    const diffTime = endDate.getTime() - startDate.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    // Asigură-te că există minim 1 noapte
    return diffDays >= 1 ? diffDays : 1
  }

  const nights = calculateNights(startDate, endDate)
  
  // basePrice este prețul pe noapte în RON (original)
  // Convertim în currency-ul selectat și calculăm totalul
  // Dacă există un promocode aplicat, folosește prețul din promocode, altfel folosește prețul de bază
  const effectivePricePerNight = promoCodePrice !== null 
    ? convert(promoCodePrice, 'RON', currency) 
    : convert(basePrice, 'RON', currency) // Convertim prețul din RON în currency-ul selectat
  
  const subtotal = effectivePricePerNight * nights
  const finalTotalPrice = subtotal

  const serviceCharge = 0
  const fee = 0
  const tax = 0
  
  // Funcție pentru aplicarea codului promoțional
  const handleApplyPromoCode = async () => {
    setPromoCodeError(null)
    
    if (!promoCode.trim()) {
      setPromoCodeError('Introduceți un cod promoțional')
      return
    }
    
    try {
      // Verifică direct în backend dacă codul există și este valid
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
  
  // Funcție helper pentru a obține prețul pentru promocode
  const getPromoCodePrice = async (aptId: string, code: string): Promise<number | null> => {
    try {
      // Obține toate codurile promoționale
      const discountCodes = await apiClient.get<Array<{
        _id?: string
        id?: string
        code: string
        price: number
        expirationDate: string
        apartmentIds?: string[] | any[] // Array de ID-uri ale apartamentelor la care funcționează codul
      }>>(API_ENDPOINTS.DISCOUNT_CODES.ALL)
      
      console.log('[Checkout] All discount codes:', discountCodes)
      console.log('[Checkout] Searching for code:', code, 'for apartment:', aptId)
      
      // Găsește codul după code (case-insensitive)
      const discountCode = discountCodes.find(
        (dc) => dc.code.toUpperCase() === code.toUpperCase()
      )
      
      if (!discountCode) {
        console.log('[Checkout] Discount code not found:', code)
        return null // Codul nu există
      }
      
      console.log('[Checkout] Found discount code:', discountCode)
      
      // Verifică dacă codul nu a expirat
      const expirationDate = new Date(discountCode.expirationDate)
      const now = new Date()
      
      if (expirationDate < now) {
        console.log('[Checkout] Discount code expired:', expirationDate)
        return null // Cod expirat
      }
      
      // Verifică dacă codul este aplicabil pentru acest apartament
      // Dacă apartmentIds există și nu este gol, verifică dacă aptId este în listă
      // Dacă apartmentIds este gol sau nu există, codul este aplicabil pentru toate apartamentele
      if (discountCode.apartmentIds && discountCode.apartmentIds.length > 0) {
        // Convertim toate ID-urile la string pentru comparație
        const apartmentIdStrings = discountCode.apartmentIds.map((id: any) => {
          // Dacă este ObjectId, convertim la string
          if (typeof id === 'object' && id.toString) {
            return id.toString()
          }
          return String(id)
        })
        
        console.log('[Checkout] Apartment IDs in discount code:', apartmentIdStrings)
        console.log('[Checkout] Current apartment ID:', aptId)
        
        const isApplicable = apartmentIdStrings.includes(aptId)
        if (!isApplicable) {
          console.log('[Checkout] Discount code not applicable for this apartment')
          return null // Codul nu este aplicabil pentru acest apartament
        }
      }
      
      console.log('[Checkout] Discount code is valid, price:', discountCode.price)
      // Returnează prețul redus
      return discountCode.price
    } catch (error) {
      console.error('[Checkout] Error getting promo code price:', error)
      return null
    }
  }
  
  // Funcție pentru eliminarea codului promoțional
  const handleRemovePromoCode = () => {
    setPromoCode('')
    setAppliedPromoCode(null)
    setPromoCodePrice(null)
    setPromoCodeError(null)
  }

  async function handleFormSubmit(formData: FormData) {
    startTransition(() => {
      // Folosim IIFE pentru a permite async/await în startTransition
      ;(async () => {
        try {
        // Extrage și sanitizează datele din formular
        const firstName = sanitizeString(formData.get('firstName') as string || '')
        const lastName = sanitizeString(formData.get('lastName') as string || '')
        const email = sanitizeString(formData.get('email') as string || '')
        const phoneNumber = sanitizeString(formData.get('phoneNumber') as string || '')
        // Extrage datele din formData sau folosește datele din state
        let checkInDate = formData.get('startDate') as string || ''
        let checkOutDate = formData.get('endDate') as string || ''
        
        // Dacă datele nu sunt în formData, folosește datele din state
        if (!checkInDate && startDate) {
          checkInDate = startDate.toISOString()
        }
        if (!checkOutDate && endDate) {
          checkOutDate = endDate.toISOString()
        }
        
        // Convertim datele în format YYYY-MM-DD pentru validare (dacă sunt în format ISO)
        // Validarea așteaptă format YYYY-MM-DD, nu ISO string
        if (checkInDate) {
          try {
            const date = new Date(checkInDate)
            if (!isNaN(date.getTime())) {
              checkInDate = formatDateToYYYYMMDD(date)
            }
          } catch (e) {
            // Dacă nu poate fi convertit, lasă-l așa (poate e deja în format YYYY-MM-DD)
          }
        }
        if (checkOutDate) {
          try {
            const date = new Date(checkOutDate)
            if (!isNaN(date.getTime())) {
              checkOutDate = formatDateToYYYYMMDD(date)
            }
          } catch (e) {
            // Dacă nu poate fi convertit, lasă-l așa (poate e deja în format YYYY-MM-DD)
          }
        }
        
        // Validare pe client înainte de trimitere
        console.log('[Checkout] Validating form data:', {
          firstName,
          lastName,
          email,
          phoneNumber,
          apartmentId,
          checkInDate,
          checkOutDate,
          totalPrice: finalTotalPrice,
        })
        
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
        
        console.log('[Checkout] Validation result:', validation)
        
        if (!validation.isValid) {
          console.error('[Checkout] Validation failed:', validation.errors)
          setValidationErrors(validation.errors)
          // Scroll la primul câmp cu eroare
          const firstErrorField = Object.keys(validation.errors)[0]
          const errorElement = document.querySelector(`[name="${firstErrorField}"]`)
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
            ;(errorElement as HTMLElement).focus()
          }
          return
        }
        
        console.log('[Checkout] Validation passed, proceeding with payment...')
        
        // Șterge erorile de validare dacă totul este valid
        setValidationErrors({})
        
        // Salvează datele rezervării în sessionStorage înainte de plată
        // IMPORTANT: Salvăm prețurile în RON (original) pentru a face conversia corectă în pay-done
        const pricePerNightInRON = promoCodePrice !== null ? promoCodePrice : basePrice
        const totalPriceInRON = pricePerNightInRON * nights
        
        const reservationData: {
          apartmentId: string
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
        
        // Trimite la backend prețul convertit în currency-ul selectat (pentru Stripe)
        // Actualizează formData cu prețul convertit
        formData.set('totalPrice', finalTotalPrice.toString())

        // Debug: verifică datele trimise
        console.log('[Checkout] Submitting form with data:', {
          checkInDate,
          checkOutDate,
          apartmentId,
          totalPrice: finalTotalPrice,
        })

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
              <ButtonPrimary type="submit" disabled={isPending} className="mt-10 w-full text-base/6!">
                {isPending ? (Booking['Processing'] || 'Se procesează...') : T.Booking['Reserve and pay']}
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