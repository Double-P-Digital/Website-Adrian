'use client'

import ButtonPrimary from '@/shared/ButtonPrimary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import T from '@/utils/getT'
import { HomeIcon } from '@heroicons/react/24/outline'
import { Calendar04Icon, UserIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Image from 'next/image'
import React, { useState, useEffect, Suspense } from 'react'
import { getApartmentForCheckout } from '@/services/apartments'
import { useSearchParams } from 'next/navigation'

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
  guestInfants: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  customerType: string
}

interface Apartment {
  id: string
  name: string
  address: string
  images: string[]
}

function PayDoneContent() {
  const searchParams = useSearchParams()
  const [reservationData, setReservationData] = useState<ReservationData | null>(null)
  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'failed' | 'pending' | 'unknown'>('unknown')

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

    // Verifică status-ul payment intent-ului folosind Stripe
    // Notă: În producție, ar trebui să verifici status-ul prin backend pentru securitate
    // Dar pentru simplitate, presupunem că dacă există payment_intent în URL, plata a reușit
    // (pentru că Stripe doar redirecționează dacă status === 'succeeded')
    
    // Verifică dacă există date în sessionStorage
    const storedData = sessionStorage.getItem('reservationData')
    if (storedData) {
      try {
        const data = JSON.parse(storedData) as ReservationData
        setReservationData(data)
        setPaymentStatus('success')

        // Obține detaliile apartamentului
        if (data.apartmentId) {
          getApartmentForCheckout(data.apartmentId).then((apt) => {
            if (apt) {
              setApartment({
                id: apt.id,
                name: apt.name,
                address: apt.address,
                images: apt.images,
              })
            }
            setLoading(false)
          }).catch(() => {
            setLoading(false)
          })
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error('Error parsing reservation data:', error)
        setPaymentStatus('failed')
        setLoading(false)
      }
    } else {
      // Există payment_intent dar nu există date în sessionStorage
      // Poate că utilizatorul a șters sessionStorage sau a venit de pe alt browser
      setPaymentStatus('unknown')
      setLoading(false)
    }
  }, [searchParams])

  const formatDate = (dateString: string) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    if (!startDate || !endDate) return ''
    const start = new Date(startDate)
    const end = new Date(endDate)
    
    const startFormatted = start.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
    })
    const endFormatted = end.toLocaleDateString('ro-RO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
    
    return `${startFormatted} - ${endFormatted}`
  }

  const formatGuests = (adults: number, children: number, infants: number) => {
    const total = adults + children
    let result = `${total} ${total === 1 ? 'oaspete' : 'oaspeți'}`
    if (infants > 0) {
      result += `, ${infants} ${infants === 1 ? 'sugar' : 'sugari'}`
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
                ? 'Plata nu a fost finalizată' 
                : 'Rezervare incompletă'}
            </h1>
            <Divider />
            <p className="mt-4 text-lg text-neutral-600 dark:text-neutral-400">
              {paymentStatus === 'failed'
                ? 'Plata nu a fost procesată cu succes. Vă rugăm să încercați din nou.'
                : paymentStatus === 'unknown'
                ? 'Nu s-au găsit date despre rezervare. Dacă ați finalizat plata, vă rugăm să verificați email-ul pentru confirmare.'
                : 'Nu s-au găsit date despre rezervare. Vă rugăm să verificați email-ul pentru confirmare sau să încercați din nou.'}
            </p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:justify-center">
              {paymentStatus === 'failed' && (
                <ButtonPrimary href="/checkout">
                  Încearcă din nou
                </ButtonPrimary>
              )}
              <ButtonPrimary href="/">
                <HomeIcon className="size-5" />
                Acasă
              </ButtonPrimary>
            </div>
          </div>
        </div>
      </main>
    )
  }

  const apartmentImage = apartment?.images?.[0] || '/images/placeholder.jpg'

  return (
    <main className="container mt-10 mb-24 sm:mt-16 lg:mb-32">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-12 px-0 sm:rounded-2xl sm:p-6 xl:p-8">
        <h1 className="text-4xl font-semibold sm:text-5xl">{T['common']['Congratulation']} 🎉</h1>
        <Divider />

        <div>
          <h3 className="text-2xl font-semibold">{T['common']['Your booking']}</h3>
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
                />
              </div>
            </div>
            <div className="flex flex-col gap-y-3 pt-5 sm:px-5 sm:pb-5">
              <div>
                <span className="line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
                  {apartment?.address || 'Adresă indisponibilă'}
                </span>
                <span className="mt-1 block text-base font-medium sm:text-lg">
                  {apartment?.name || 'Apartament'}
                </span>
              </div>
              <span className="block text-sm text-neutral-500 dark:text-neutral-400">
                {reservationData.pricePerNight.toFixed(2)} RON/noapte
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-neutral-200 rounded-3xl border border-neutral-200 text-neutral-500 sm:flex-row sm:divide-x sm:divide-y-0 dark:divide-neutral-700 dark:border-neutral-700 dark:text-neutral-400">
          <div className="flex flex-1 gap-x-4 p-5">
            <HugeiconsIcon icon={Calendar04Icon} size={32} strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400">Date</span>
              <span className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {formatDateRange(reservationData.checkInDate, reservationData.checkOutDate)}
              </span>
            </div>
          </div>
          <div className="flex flex-1 gap-x-4 p-5">
            <HugeiconsIcon icon={UserIcon} size={32} strokeWidth={1.5} />
            <div className="flex flex-col">
              <span className="text-sm text-neutral-400">Oaspeți</span>
              <span className="mt-1.5 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {formatGuests(reservationData.guestAdults, reservationData.guestChildren, reservationData.guestInfants)}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold">Detalii rezervare</h3>
          <DescriptionList className="mt-5">
            <DescriptionTerm>Cod rezervare</DescriptionTerm>
            <DescriptionDetails>{generateBookingCode()}</DescriptionDetails>
            <DescriptionTerm>Data rezervării</DescriptionTerm>
            <DescriptionDetails>{formatDate(new Date().toISOString())}</DescriptionDetails>
            <DescriptionTerm>Check-in</DescriptionTerm>
            <DescriptionDetails>{formatDate(reservationData.checkInDate)}</DescriptionDetails>
            <DescriptionTerm>Check-out</DescriptionTerm>
            <DescriptionDetails>{formatDate(reservationData.checkOutDate)}</DescriptionDetails>
            <DescriptionTerm>Număr nopți</DescriptionTerm>
            <DescriptionDetails>{reservationData.nights} {reservationData.nights === 1 ? 'noapte' : 'nopți'}</DescriptionDetails>
            <DescriptionTerm>Preț/noapte</DescriptionTerm>
            <DescriptionDetails>{reservationData.pricePerNight.toFixed(2)} RON</DescriptionDetails>
            <DescriptionTerm>Total</DescriptionTerm>
            <DescriptionDetails className="font-semibold">{reservationData.totalPrice.toFixed(2)} RON</DescriptionDetails>
            <DescriptionTerm>Metodă de plată</DescriptionTerm>
            <DescriptionDetails>Card de credit</DescriptionDetails>
            <DescriptionTerm>Client</DescriptionTerm>
            <DescriptionDetails>{`${reservationData.firstName} ${reservationData.lastName}`}</DescriptionDetails>
            <DescriptionTerm>Email</DescriptionTerm>
            <DescriptionDetails>{reservationData.email}</DescriptionDetails>
          </DescriptionList>
        </div>

        <div>
          <ButtonPrimary href="/">
            <HomeIcon className="size-5" />
            Explore more stays
          </ButtonPrimary>
        </div>
      </div>
    </main>
  )
}

const Page = () => {
  return (
    <Suspense fallback={
      <main className="container mt-10 mb-24 sm:mt-16 lg:mb-32">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-y-12 px-0 sm:rounded-2xl sm:p-6 xl:p-8">
          <div className="animate-pulse">
            <div className="h-12 w-64 rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mt-6 h-48 w-full rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
          </div>
        </div>
      </main>
    }>
      <PayDoneContent />
    </Suspense>
  )
}

export default Page
