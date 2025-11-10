'use server'

import { redirect } from 'next/navigation'

/**
 * Server Action pentru procesarea rezervării și crearea payment intent
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
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

    console.log('=== CHECKOUT SUBMISSION ===')
    console.log('Apartment ID:', apartmentId)
    console.log('Guest:', `${firstName} ${lastName}`)
    console.log('Email:', email)
    console.log('Check-in:', checkInDate)
    console.log('Check-out:', checkOutDate)
    console.log('Guests:', guestsCount)
    console.log('Total Price:', totalPrice)

    // Validare câmpuri obligatorii
    if (!apartmentId || !firstName || !lastName || !email || !phoneNumber || !checkInDate || !checkOutDate) {
      throw new Error('Toate câmpurile obligatorii trebuie completate')
    }

    // Validare pentru persoană juridică
    if (customerType === 'company') {
      const companyName = formData.get('companyName') as string | null
      const taxId = formData.get('taxId') as string | null
      
      if (!companyName || !taxId) {
        throw new Error('Pentru persoană juridică, numele firmei și CUI-ul sunt obligatorii')
      }
    }

    // Validare apartmentId - verificăm dacă este MongoDB ObjectId valid
    if (!/^[0-9a-fA-F]{24}$/.test(apartmentId)) {
      console.error('Invalid apartment ID format:', apartmentId)
      throw new Error('ID-ul apartamentului este invalid. Vă rugăm să selectați un apartament valid.')
    }

    // Validare prețuri
    if (totalPrice <= 0) {
      throw new Error('Prețul total trebuie să fie mai mare decât 0')
    }

    // Construim numele complet
    const guestName = `${firstName} ${lastName}`

    // Pregătim datele pentru backend - conform cu CreatePaymentIntentDto
    const requestBody = {
      apartment: apartmentId,
      guestName,
      guestEmail: email,
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      guestsCount,
      amount: totalPrice,
    }

    console.log('=== SENDING TO BACKEND ===')
    console.log('URL:', `${API_BASE_URL}/api/payments/create-intent`)
    console.log('Body:', JSON.stringify(requestBody, null, 2))
    console.log('API Key present:', !!API_KEY)

    // Creăm payment intent prin backend API
    const paymentIntentResponse = await fetch(`${API_BASE_URL}/api/payments/create-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
      },
      body: JSON.stringify(requestBody),
    })

    console.log('=== BACKEND RESPONSE ===')
    console.log('Status:', paymentIntentResponse.status)
    console.log('Status Text:', paymentIntentResponse.statusText)

    if (!paymentIntentResponse.ok) {
      const errorText = await paymentIntentResponse.text()
      console.error('Backend error response:', errorText)
      
      let error: any
      try {
        error = JSON.parse(errorText)
      } catch {
        error = { message: errorText || 'Eroare la crearea payment intent' }
      }
      
      // NestJS ValidationPipe returnează erori în format diferit
      let errorMessage = 'Eroare la procesarea plății'
      
      if (error.message) {
        if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ')
        } else {
          errorMessage = error.message
        }
      } else if (error.error) {
        errorMessage = error.error
      }
      
      console.error('Error message:', errorMessage)
      throw new Error(errorMessage)
    }

    const responseData = await paymentIntentResponse.json()
    console.log('=== SUCCESS ===')
    console.log('Response:', responseData)

    const { clientSecret } = responseData

    if (!clientSecret) {
      throw new Error('Nu s-a primit clientSecret de la backend')
    }

    // Returnăm clientSecret pentru a afișa formularul Stripe
    return { success: true, clientSecret }
  } catch (error) {
    console.error('=== ERROR IN CHECKOUT ===')
    console.error('Error:', error)
    
    // Re-throw cu mesaj user-friendly
    if (error instanceof Error) {
      throw new Error(error.message)
    }
    
    throw new Error('A apărut o eroare neașteptată. Vă rugăm să încercați din nou.')
  }
}