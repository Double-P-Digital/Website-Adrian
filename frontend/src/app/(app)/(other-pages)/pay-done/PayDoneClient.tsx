'use client'

import ButtonPrimary from '@/shared/ButtonPrimary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { useT } from '@/hooks/useT'
import { HomeIcon } from '@heroicons/react/24/outline'
import { Calendar04Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { getApartmentForCheckout } from '@/services/apartments'
import { useSearchParams } from 'next/navigation'
import { sanitizeImageUrl } from '@/utils/imageUtils'
import { useRouter } from 'next/navigation'
import { parseYYYYMMDDToDate } from '@/utils/dateUtils'

interface ReservationData {
  apartmentId: string
  price: number
  pricePerNight: number
  nights: number
  totalPrice: number
  checkInDate: string
  checkOutDate: string
  guestAdults: number
  guestChildren: number
  guestRooms: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  customerType: string
  companyName?: string
  taxId?: string
  registrationNumber?: string
  companyAddress?: string
}

interface Apartment {
  id: string
  name: string
  address: string
  images: string[]
}

interface PayDoneClientProps {
  initialTranslations: unknown // Acceptăm orice tip pentru backwards compatibility
}

function PayDoneClient({ initialTranslations }: PayDoneClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { currency, convert } = useCurrency()
  const { language } = useLanguage()
  const T = useT() // Folosim hook-ul care funcționează corect
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | 'unknown'>('unknown')

  // Traducerile se actualizează automat prin useT() hook când se schimbă limba

  useEffect(() => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'instant',
    })

    const paymentIntent = searchParams.get('payment_intent')
    const paymentIntentClientSecret = searchParams.get('payment_intent_client_secret')

    // Verifică dacă există payment_intent în URL (indică că utilizatorul a venit de la Stripe)
    if (!paymentIntent) {
      // Nu există payment_intent - utilizatorul a accesat pagina direct sau plata nu a reușit
      setPaymentStatus('failed')
      setLoading(false)
      return
    }

    // Verifică dacă există date în sessionStorage
    const storedData = sessionStorage.getItem('reservationData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as ReservationData
        setReservationData(data)
        setPaymentStatus('success')

        // Obține detaliile apartamentului
        if (data.apartmentId) {
          getApartmentForCheckout(data.apartmentId)
            .then((apt) => {
              if (apt) {
                setApartment({
                  id: apt.id,
                  name: apt.name,
                  address: apt.address,
                  images: apt.images,
                })
              }
              setLoading(false)
            })
            .catch(() => {
              setLoading(false)
            })
        } else {
          setLoading(false)
        }
      } catch (error) {
        setPaymentStatus('failed')
        setLoading(false)
      }
    } else {
      // Există payment_intent dar nu există date în sessionStorage
      setPaymentStatus('unknown')
      setLoading(false)
    }
  }, [searchParams])

  // Auto-redirect to homepage after 5 minutes (regardless of status)
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/')
    }, 5 * 60 * 1000) // 5 minutes
    return () => clearTimeout(timer)
  }, [router])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = parseYYYYMMDDToDate(dateString)
    const locale = language === 'ro' ? 'ro-RO' : 'en-US'
    return date.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return ''
    const start = parseYYYYMMDDToDate(startDate)
    const end = parseYYYYMMDDToDate(endDate)
    const locale = language === 'ro' ? 'ro-RO' : 'en-US'
    
    const startFormatted = start.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
    })
    const endFormatted = end.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    
    return `${startFormatted} - ${endFormatted}`
  }

  const formatDateRangeFull = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return ''
    const start = parseYYYYMMDDToDate(startDate)
    const end = parseYYYYMMDDToDate(endDate)
    const locale = language === 'ro' ? 'ro-RO' : 'en-US'
    
    const startFormatted = start.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    const endFormatted = end.toLocaleDateString(locale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    
    return `${startFormatted} - ${endFormatted}`
  }

  const formatGuests = (adults: number, children: number, rooms: number) => {
    const total = adults + children
    const guestLabel = total === 1 
      ? (language === 'ro' ? 'oaspete' : 'guest')
      : (language === 'ro' ? 'oaspeți' : 'guests')
    let result = `${total} ${guestLabel}`
    if (rooms > 0) {
      const roomLabel = rooms === 1
        ? (language === 'ro' ? 'cameră' : 'room')
        : (language === 'ro' ? 'camere' : 'rooms')
      result += `, ${rooms} ${roomLabel}`
    }
    return result
  }

  const generateBookingCode = () => {
    // Generează un cod de rezervare simplu
    const paymentIntent = searchParams.get('payment_intent')
    if (paymentIntent) {
      return `#${paymentIntent.slice(-8).toUpperCase()}`
    }
    return `#${Date.now().toString().slice(-8)}`
  }

  if (loading) {
    return (
      <main className="container mt-10 mb-24 sm:mt-16 lg:mb-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-12 px-0 sm:rounded-2xl sm:p-6 xl:p-8">
          <div className="animate-pulse">
            <div className="h-12 w-64 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mt-6 h-48 w-full rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>
      </main>
    )
  }

  // Dacă plata nu a reușit sau nu există date
  if (paymentStatus === 'failed' || paymentStatus === 'unknown' || !reservationData) {
    return (
      <main className="container mt-10 mb-24 sm:mt-16 lg:mb-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-12 px-0 sm:rounded-2xl sm:p-6 xl:p-8">
          <div className="text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <svg
                className="h-10 w-10 text-red-600 dark:text-red-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h1 className="text-4xl font-semibold sm:text-5xl">
              {paymentStatus === 'failed' 
                ? (language === 'ro' ? 'Plata nu a fost finalizată' : 'Payment failed')
                : (language === 'ro' ? 'Rezervare incompletă' : 'Incomplete reservation')}
            </h1>
            <Divider />
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              {paymentStatus === 'failed'
                ? (language === 'ro' ? 'Plata nu a fost procesată cu succes. Vă rugăm să încercați din nou.' : 'Payment was not processed successfully. Please try again.')
                : paymentStatus === 'unknown'
                ? (language === 'ro' ? 'Nu s-au găsit date despre rezervare. Dacă ați finalizat plata, vă rugăm să verificați email-ul pentru confirmare.' : 'No reservation data found. If you completed the payment, please check your email for confirmation.')
                : (language === 'ro' ? 'Nu s-au găsit date despre rezervare. Vă rugăm să verificați email-ul pentru confirmare sau să încercați din nou.' : 'No reservation data found. Please check your email for confirmation or try again.')}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {paymentStatus === 'failed' && (
                <ButtonPrimary href="/checkout">
                  {language === 'ro' ? 'Încearcă din nou' : 'Try again'}
                </ButtonPrimary>
              )}
              <ButtonPrimary href="/">
                <HomeIcon className="size-5" />
                {language === 'ro' ? 'Acasă' : 'Home'}
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const apartmentImage = apartment?.images?.[0] ? sanitizeImageUrl(apartment.images[0]) : '/images/placeholder.jpg'
  const convertedPricePerNight = convert(reservationData.pricePerNight, 'RON', currency)
  const convertedTotalPrice = convert(reservationData.totalPrice, 'RON', currency)

  return (
    <main className="container mt-10 mb-24 sm:mt-16 lg:mb-32">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-12 px-0 sm:rounded-2xl sm:p-6 xl:p-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">{T.common?.Congratulation || (language === 'ro' ? 'Felicitări' : 'Congratulation')} 🎉</h1>
        <Divider />

        <div>
          <h3 className="text-2xl font-semibold">{T.common?.['Your booking'] || (language === 'ro' ? 'Rezervarea ta' : 'Your booking')}</h3>
          <div className="mt-5 flex flex-col sm:flex-row sm:items-center">
            <div className="w-full shrink-0 sm:w-40">
              <div className="aspect-w-4 overflow-hidden rounded-2xl aspect-h-3 sm:aspect-h-4">
                <Image
                  fill
                  alt={apartment?.name || 'Apartment'}
                  className="object-cover"
                  src={apartmentImage}
                  sizes="200px"
                  priority
                  unoptimized={true}
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-3 pt-5 sm:px-5 sm:pb-5">
              <div>
                <span className="line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {apartment?.address || (language === 'ro' ? 'Adresă indisponibilă' : 'Address unavailable')}
                </span>
                <span className="mt-1 block text-base font-medium sm:text-lg">
                  {apartment?.name || (language === 'ro' ? 'Apartament' : 'Apartment')}
                </span>
              </div>
              <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                {convertedPricePerNight.toFixed(2)} {currency}/{T.common?.night || (language === 'ro' ? 'noapte' : 'night')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-neutral-200 rounded-3xl border border-neutral-200 text-neutral-500 sm:flex-row sm:divide-x sm:divide-y-0 dark:divide-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
          <div className="flex flex-1 gap-x-4 p-5">
            <HugeiconsIcon icon={Calendar04Icon} size={32} strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400">{T.HeroSearchForm?.['Date range'] || (language === 'ro' ? 'Date' : 'Date')}</span>
              <span className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {formatDateRange(reservationData.checkInDate, reservationData.checkOutDate)}
              </span>
            </div>
          </div>
          <div className="flex flex-1 gap-x-4 p-5">
            <HugeiconsIcon icon={UserIcon} size={32} strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400">{T.HeroSearchForm?.['Guests'] || (language === 'ro' ? 'Oaspeți' : 'Guests')}</span>
              <span className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {formatGuests(reservationData.guestAdults, reservationData.guestChildren, reservationData.guestRooms)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold">{language === 'ro' ? 'Detalii rezervare' : 'Reservation details'}</h3>
          <DescriptionList className="mt-5">
            <DescriptionTerm>{language === 'ro' ? 'Cod rezervare' : 'Reservation code'}</DescriptionTerm>
            <DescriptionDetails>{generateBookingCode()}</DescriptionDetails>
            <DescriptionTerm>{language === 'ro' ? 'Data rezervării' : 'Reservation date'}</DescriptionTerm>
            <DescriptionDetails>{formatDateRangeFull(reservationData.checkInDate, reservationData.checkOutDate)}</DescriptionDetails>
            <DescriptionTerm>{language === 'ro' ? 'Număr nopți' : 'Number of nights'}</DescriptionTerm>
            <DescriptionDetails>
              {reservationData.nights} {reservationData.nights === 1 
                ? (T.common?.night || (language === 'ro' ? 'noapte' : 'night'))
                : (language === 'ro' ? 'nopți' : 'nights')}
            </DescriptionDetails>
            <DescriptionTerm>{language === 'ro' ? 'Preț/noapte' : 'Price per night'}</DescriptionTerm>
            <DescriptionDetails>{convertedPricePerNight.toFixed(2)} {currency}</DescriptionDetails>
            <DescriptionTerm className="font-semibold text-neutral-900 dark:text-neutral-100">{T.Booking?.Total || (language === 'ro' ? 'Total' : 'Total')}</DescriptionTerm>
            <DescriptionDetails className="font-semibold sm:text-right dark:text-neutral-100">
              {convertedTotalPrice.toFixed(2)} {currency}
            </DescriptionDetails>
            <DescriptionTerm>{language === 'ro' ? 'Metodă de plată' : 'Payment method'}</DescriptionTerm>
            <DescriptionDetails>{T.PayWith?.['Credit card'] || (language === 'ro' ? 'Card de credit' : 'Credit card')}</DescriptionDetails>
            <DescriptionTerm>{language === 'ro' ? 'Client' : 'Client'}</DescriptionTerm>
            <DescriptionDetails>{`${reservationData.firstName} ${reservationData.lastName}`}</DescriptionDetails>
            <DescriptionTerm>{T.Booking?.Email || (language === 'ro' ? 'Email' : 'Email')}</DescriptionTerm>
            <DescriptionDetails>{reservationData.email}</DescriptionDetails>
          </DescriptionList>
        </div>

        <div>
          <ButtonPrimary href="/">
            <HomeIcon className="size-5" />
            {language === 'ro' ? 'Explorează mai multe cazări' : 'Explore more stays'}
          </ButtonPrimary>
        </div>
      </div>
    </main>
  )
}

export default PayDoneClient

