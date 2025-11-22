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
import Input from '@/shared/Input'
import { Button } from '@/shared/Button'

function CheckoutPageContent() {
  const searchParams = useSearchParams()
  const { currency, convert } = useCurrency()
  const T = useT()
  const Booking = T.Booking as Record<string, string>
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const basePrice = Number(searchParams.get('price') || 0)
  const apartmentId = searchParams.get('apartmentId') || ''

  // State pentru datele selectate
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  
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
  
  // Dacă există un promocode aplicat, folosește prețul din promocode, altfel folosește prețul de bază
  const effectivePricePerNight = promoCodePrice !== null 
    ? convert(promoCodePrice) 
    : convert(basePrice)
  
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
    
    // Verifică dacă codul se potrivește cu discountCode-ul apartamentului
    if (apartmentDiscountCode && promoCode.trim().toUpperCase() === apartmentDiscountCode.toUpperCase()) {
      try {
        // TODO: Aici ar trebui să faci un call la backend pentru a obține prețul pentru promocode
        // Pentru moment, presupun că discountCode conține prețul sau că există o mapare
        // Exemplu: poți face un call la backend: GET /api/apartments/{apartmentId}/promocode/{code}/price
        // Sau poți extrage prețul din discountCode dacă este formatat special
        
        // Pentru moment, voi presupune că discountCode poate conține un preț sau că există o mapare
        // Poți modifica această logică pentru a obține prețul din backend
        const promoPrice = await getPromoCodePrice(apartmentId, promoCode.trim().toUpperCase())
        
        if (promoPrice !== null && promoPrice > 0) {
          setPromoCodePrice(promoPrice)
          setAppliedPromoCode(promoCode.trim().toUpperCase())
          setPromoCodeError(null)
        } else {
          setPromoCodeError('Cod promoțional invalid sau preț indisponibil')
          setPromoCodePrice(null)
          setAppliedPromoCode(null)
        }
      } catch (error) {
        console.error('[Checkout] Error applying promo code:', error)
        setPromoCodeError('Eroare la aplicarea codului promoțional')
        setPromoCodePrice(null)
        setAppliedPromoCode(null)
      }
    } else {
      setPromoCodeError('Cod promoțional invalid')
      setPromoCodePrice(null)
      setAppliedPromoCode(null)
    }
  }
  
  // Funcție helper pentru a obține prețul pentru promocode
  // TODO: Implementează acest endpoint în backend sau modifică logica conform nevoilor tale
  const getPromoCodePrice = async (aptId: string, code: string): Promise<number | null> => {
    try {
      // Pentru moment, returnez null - trebuie implementat endpoint-ul în backend
      // Exemplu de implementare:
      // const response = await apiClient.get(`/api/apartments/${aptId}/promocode/${code}/price`)
      // return response.price
      
      // TEMPORAR: Poți returna un preț fix pentru testare
      // return 250 // Exemplu: preț de 250 RON/noapte pentru promocode
      
      // Sau poți extrage prețul din discountCode dacă este formatat special (ex: "CODE:250")
      // const apartment = await getApartmentById(aptId)
      // if (apartment?.discountCode) {
      //   // Logica pentru extragerea prețului din discountCode
      // }
      
      return 250;
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
    startTransition(async () => {
      try {
        // Salvează datele rezervării în sessionStorage înainte de plată
        const reservationData = {
          apartmentId,
          price: basePrice,
          pricePerNight: effectivePricePerNight,
          nights,
          totalPrice: finalTotalPrice,
          promoCode: appliedPromoCode,
          promoCodePrice: promoCodePrice,
          checkInDate: formData.get('startDate') as string,
          checkOutDate: formData.get('endDate') as string,
          guestAdults: Number(formData.get('guestAdults') || 1),
          guestChildren: Number(formData.get('guestChildren') || 0),
          guestInfants: Number(formData.get('guestInfants') || 0),
          firstName: formData.get('firstName') as string,
          lastName: formData.get('lastName') as string,
          email: formData.get('email') as string,
          phoneNumber: formData.get('phoneNumber') as string,
          customerType: formData.get('customerType') as string,
        }
        
        sessionStorage.setItem('reservationData', JSON.stringify(reservationData))

        const result = await handleCheckoutSubmit(formData)
        if (result.success && result.clientSecret) {
          setClientSecret(result.clientSecret)
        }
      } catch (error) {
        console.error('Error submitting form:', error)
        // TODO: Afișează eroarea utilizatorului
      }
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
            />
            
            {/* Hidden fields pentru datele necesare backend-ului */}
            <input type="hidden" name="apartmentId" value={apartmentId} />
            <input type="hidden" name="totalPrice" value={finalTotalPrice.toString()} />
            {appliedPromoCode && <input type="hidden" name="promoCode" value={appliedPromoCode} />}
            
            <div>
              <ButtonPrimary type="submit" disabled={isPending} className="mt-10 w-full text-base/6!">
                {isPending ? (Booking['Processing'] || 'Se procesează...') : T.Booking['Reserve and pay']}
              </ButtonPrimary>
            </div>
          </Form>
        ) : (
          <div className="flex flex-col gap-y-8 border-neutral-200 px-0 sm:rounded-4xl sm:border sm:p-6 xl:p-8 dark:border-neutral-700">
            <h1 className="text-3xl font-semibold lg:text-4xl">{Booking['Complete payment'] || 'Finalizează plata'}</h1>
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