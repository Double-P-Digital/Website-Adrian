'use client'

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useState, FormEvent } from 'react'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { useT } from '@/hooks/useT'

export default function StripePaymentForm() {
  const stripe = useStripe()
  const elements = useElements()
  const T = useT()
  const Booking = T.Booking as Record<string, string>
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/pay-done`,
        },
        redirect: 'if_required',
      })

      if (error) {
        setErrorMessage(error.message || 'A apărut o eroare la procesarea plății')
        setIsProcessing(false)
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Plata a reușit, redirecționăm către pagina de success
        window.location.href = `/pay-done?payment_intent=${paymentIntent.id}&payment_intent_client_secret=${paymentIntent.client_secret}`
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
      <PaymentElement />
      
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

