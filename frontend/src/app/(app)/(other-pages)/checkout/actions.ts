'use server'

import { redirect } from 'next/navigation'

/**
 * Server Action pentru procesarea rezervării și crearea payment intent
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

export async function handleCheckoutSubmit(formData: FormData) {
  try {
    // Extragem datele din formData
    const apartmentId = formData.get('apartmentId') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phoneNumber = formData.get('phoneNumber') as string
    const customerType = formData.get('customerType') as 'individual' | 'company'
    const checkInDate = formData.get('startDate') as string
    const checkOutDate = formData.get('endDate') as string
    const guestAdults = Number(formData.get('guestAdults') || 1)
    const guestChildren = Number(formData.get('guestChildren') || 0)
    const guestsCount = guestAdults + guestChildren
    const totalPrice = Number(formData.get('totalPrice') || 0)

    // Date pentru persoană juridică
    const companyName = formData.get('companyName') as string | null
    const taxId = formData.get('taxId') as string | null
    const registrationNumber = formData.get('registrationNumber') as string | null
    const companyAddress = formData.get('companyAddress') as string | null

    // Validare câmpuri obligatorii
    if (!apartmentId || !firstName || !lastName || !email || !phoneNumber || !checkInDate || !checkOutDate) {
      throw new Error('Toate câmpurile obligatorii trebuie completate')
    }

    if (customerType === 'company') {
      if (!companyName || !taxId) {
        throw new Error('Pentru persoană juridică, numele firmei și CUI-ul sunt obligatorii')
      }
    }

    // Construim numele complet
    const guestName = `${firstName} ${lastName}`

    // Pregătim datele pentru backend
    const requestBody = {
      apartment: apartmentId,
      guestName,
      guestEmail: email,
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      guestsCount,
      amount: totalPrice,
    }

    // Log pentru debugging
    console.log('Sending payment intent request:', {
      url: `${API_BASE_URL}/api/payments/create-intent`,
      body: requestBody,
      hasApiKey: !!API_KEY
    })

    // Creăm payment intent prin backend API
    const paymentIntentResponse = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    if (!paymentIntentResponse.ok) {
      const errorText = await paymentIntentResponse.text()
      let error: any
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Eroare la crearea payment intent' }
      }
      
      // Log detalii pentru debugging
      console.error('Backend error response:', {
        status: paymentIntentResponse.status,
        statusText: paymentIntentResponse.statusText,
        error: error,
        url: `${API_BASE_URL}/api/payments/create-intent`
      })
      
      // NestJS ValidationPipe returnează erori în format diferit
      const errorMessage = error.message || 
                          (Array.isArray(error.message) ? error.message.join(', ') : null) ||
                          error.error ||
                          JSON.stringify(error)
      
      throw new Error(errorMessage || 'Eroare la crearea payment intent')
    }

    const { clientSecret } = await paymentIntentResponse.json()

    if (!clientSecret) {
      throw new Error('Nu s-a primit clientSecret de la backend')
    }

    // Returnăm clientSecret pentru a afișa formularul Stripe
    // Nu redirecționăm direct, ci rămânem pe pagină și afișăm formularul de plată
    return { success: true, clientSecret }
  } catch (error) {
    console.error('Error in handleCheckoutSubmit:', error)
    // Re-throw pentru a fi prins de Next.js error boundary
    throw error
  }
}

