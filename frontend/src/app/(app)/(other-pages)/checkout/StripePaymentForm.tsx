'use client'

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState, FormEvent, useEffect } from 'react'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { useT } from '@/hooks/useT'
import { createReservation, type CreateReservationRequest } from '@/services/reservations'

export default function StripePaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const T = useT()
  const Booking = T.Booking as Record<string, string>
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [customerEmail, setCustomerEmail] = useState<string | null>(null)
  const [customerName, setCustomerName] = useState<string | null>(null)
  const [customerPhone, setCustomerPhone] = useState<string | null>(null)

  // Obține datele clientului din sessionStorage
  useEffect(() => {
    try {
      const reservationData = sessionStorage.getItem('reservationData')
      if (reservationData) {
        const data = JSON.parse(reservationData)
        if (data.email) {
          setCustomerEmail(data.email)
        }
        // Construiește numele complet din firstName și lastName
        if (data.firstName && data.lastName) {
          setCustomerName(`${data.firstName} ${data.lastName}`)
        } else if (data.firstName) {
          setCustomerName(data.firstName)
        }
        if (data.phoneNumber) {
          setCustomerPhone(data.phoneNumber)
        }
      }
    } catch (error) {
      console.error('[StripePaymentForm] Error reading reservation data:', error)
    }
  }, [])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      // Obține datele rezervării pentru metadata Stripe
      const reservationData = sessionStorage.getItem('reservationData')
      let checkInDate: string | null = null
      let checkOutDate: string | null = null
      
      if (reservationData) {
        try {
          const data = JSON.parse(reservationData)
          checkInDate = data.startDate || null
          checkOutDate = data.endDate || null
        } catch (e) {
          console.error('[StripePaymentForm] Error parsing reservation data:', e)
        }
      }

      const confirmParams: {
        return_url: string
        payment_method_data?: {
          billing_details?: {
            email?: string
            name?: string
            phone?: string
            address?: any
          }
        }
        metadata?: Record<string, string>
      } = {
        return_url: `${window.location.origin}/pay-done`,
      }

      // Adaugă billing_details dacă avem email, name sau phone
      if (customerEmail || customerName || customerPhone) {
        confirmParams.payment_method_data = {
          billing_details: {},
        }
        
        if (customerEmail) {
          confirmParams.payment_method_data.billing_details!.email = customerEmail
        }
        
        if (customerName) {
          confirmParams.payment_method_data.billing_details!.name = customerName
        }
        
        if (customerPhone) {
          confirmParams.payment_method_data.billing_details!.phone = customerPhone
        }
      }

      // Adaugă metadata cu datele de rezervare pentru Stripe Dashboard
      if (checkInDate || checkOutDate) {
        confirmParams.metadata = {}
        if (checkInDate) {
          confirmParams.metadata.check_in_date = checkInDate
        }
        if (checkOutDate) {
          confirmParams.metadata.check_out_date = checkOutDate
        }
        // Adaugă range-ul de date pentru ușurință în dashboard
        if (checkInDate && checkOutDate) {
          const checkIn = new Date(checkInDate).toLocaleDateString('ro-RO')
          const checkOut = new Date(checkOutDate).toLocaleDateString('ro-RO')
          confirmParams.metadata.reservation_period = `${checkIn} - ${checkOut}`
        }
      }

      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams,
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'A apărut o eroare la procesarea plății')
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // ========== PASUL 3: Creează rezervarea după plata reușită ==========
        try {
          // Obține datele din sessionStorage
          const reservationData = sessionStorage.getItem('reservationData')
          if (!reservationData) {
            throw new Error('Datele rezervării nu au fost găsite')
          }

          const data = JSON.parse(reservationData)
          const guestName = data.firstName && data.lastName 
            ? `${data.firstName} ${data.lastName}` 
            : data.firstName || 'Guest'

          // Creează rezervarea conform noii structuri
          const reservationRequest: CreateReservationRequest = {
            apartment: data.apartmentId, // REQUIRED - MongoDB ObjectId către Apartment
            guestName, // REQUIRED - Numele oaspelui
            guestEmail: data.email, // REQUIRED - Email oaspete
            checkInDate: new Date(data.checkInDate || data.startDate).toISOString(), // REQUIRED - Data check-in (ISO date string)
            checkOutDate: new Date(data.checkOutDate || data.endDate).toISOString(), // REQUIRED - Data check-out (ISO date string)
            guestsCount: data.guestAdults + data.guestChildren, // REQUIRED - Număr oaspeți
            totalPrice: data.totalPrice, // REQUIRED - Prețul total
            currency: data.currency || 'RON', // REQUIRED - Moneda (ex: "RON", "EUR")
            paymentIntentId: paymentIntent.id, // REQUIRED - ID Stripe PaymentIntent (UNIC)
            status: 'confirmed', // OPTIONAL - Status (default: 'pending', dar 'confirmed' după plata reușită)
          }

          await createReservation(reservationRequest)

          // Redirecționează către pagina de success
          window.location.href = `/pay-done?payment_intent=${paymentIntent.id}&payment_intent_client_secret=${paymentIntent.client_secret}`
        } catch (reservationError: any) {
          console.error('[StripePaymentForm] Error creating reservation:', reservationError)
          // Chiar dacă rezervarea eșuează, plata a reușit, deci redirecționăm
          // Backend-ul poate crea rezervarea prin webhook
          window.location.href = `/pay-done?payment_intent=${paymentIntent.id}&payment_intent_client_secret=${paymentIntent.client_secret}`
        }
      } else {
        setIsProcessing(false)
      }
    } catch (err) {
      setErrorMessage('A apărut o eroare neașteptată. Vă rugăm să încercați din nou.')
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6">
      <PaymentElement 
        options={{
          wallets: {
            applePay: 'auto', 
            googlePay: 'auto', 
          },
          fields: {
            billingDetails: {
              name: 'auto', 
              email: 'auto', 
              phone: 'auto', 
              address: 'auto', 
            },
          },
        }}
      />
      
      {errorMessage && (
        <div className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      <ButtonPrimary
        type="submit"
        disabled={!stripe || isProcessing}
        className="mt-6 w-full"
      >
        {isProcessing
          ? Booking['Processing'] || 'Se procesează...'
          : Booking['Pay now'] || 'Plătește acum'}
      </ButtonPrimary>
    </form>
  )
}

