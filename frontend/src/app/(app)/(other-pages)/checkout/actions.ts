'use server'

import { redirect } from 'next/navigation'
import { createPaymentIntent, type CreatePaymentIntentRequest } from '@/services/payments'

/**
 * Server Action pentru procesarea rezervării și crearea payment intent
 */

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

    // Pregătim datele pentru backend - conform cu CreatePaymentIntentRequest
    const requestBody: CreatePaymentIntentRequest = {
      apartment: apartmentId,
      guestName,
      guestEmail: email,
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      guestsCount,
      amount: totalPrice,
      phoneNumber,
      customerType: customerType || 'individual',
      ...(customerType === 'company' && {
        companyName: formData.get('companyName') as string,
        taxId: formData.get('taxId') as string,
        registrationNumber: formData.get('registrationNumber') as string | undefined,
        companyAddress: formData.get('companyAddress') as string | undefined,
      }),
    }

    console.log('=== SENDING TO BACKEND ===')
    console.log('Request:', JSON.stringify(requestBody, null, 2))

    try {
      // Creăm payment intent prin API client
      const response = await createPaymentIntent(requestBody)
      
      console.log('=== SUCCESS ===')
      console.log('Response:', response)

      const { clientSecret } = response

      if (!clientSecret) {
        throw new Error('Nu s-a primit clientSecret de la backend')
      }

      // Salvează datele rezervării pentru pagina de mulțumire
      // (se va salva în sessionStorage din componentă)

      // Returnăm clientSecret pentru a afișa formularul Stripe
      return { success: true, clientSecret }
    } catch (error: any) {
      // Error handling este făcut în payments.ts
      throw error
    }
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