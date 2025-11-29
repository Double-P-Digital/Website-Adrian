'use server'

import { redirect } from 'next/navigation'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

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
    const checkInDate = formData.get('startDate') as string
    const checkOutDate = formData.get('endDate') as string
    const guestAdults = Number(formData.get('guestAdults') || 1)
    const guestChildren = Number(formData.get('guestChildren') || 0)
    const guestRooms = Number(formData.get('guestRooms') || 1)
    const guestsCount = guestAdults + guestChildren // Rooms are not included in total guests
    const totalPrice = Number(formData.get('totalPrice') || 0)
    const currency = (formData.get('currency') as string) || 'RON' // Default RON


    // Validare câmpuri obligatorii
    if (!apartmentId || !firstName || !lastName || !email || !phoneNumber || !checkInDate || !checkOutDate) {
      throw new Error('Toate câmpurile obligatorii trebuie completate')
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

    // Pregătim datele pentru backend pentru payment intent
    // IMPORTANT: Payment Intent conține doar datele de bază (fără rooms)
    // rooms se va trimite doar în rezervare, după plata reușită
    const paymentIntentRequest: {
      apartment: string
      guestName: string
      guestEmail: string
      checkInDate: string
      checkOutDate: string
      guestsCount: number
      amount: number
    } = {
      apartment: apartmentId,
      guestName,
      guestEmail: email,
      checkInDate: new Date(checkInDate).toISOString(),
      checkOutDate: new Date(checkOutDate).toISOString(),
      guestsCount,
      amount: totalPrice,
    }


    try {
      // Creăm payment intent prin API client
      const response = await apiClient.post<{ clientSecret: string; paymentIntentId?: string }>(
        API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
        paymentIntentRequest
      )
      

      const { clientSecret, paymentIntentId } = response

      if (!clientSecret) {
        throw new Error('Nu s-a primit clientSecret de la backend')
      }

      // IMPORTANT: Rezervarea NU se salvează aici!
      // Rezervarea se va crea DUPĂ plata reușită în StripePaymentForm.tsx
      // cu status "confirmed" și cu toate datele, inclusiv rooms

      // Returnăm clientSecret pentru a afișa formularul Stripe
      return { success: true, clientSecret }
    } catch (error: any) {
      console.error('[Checkout] Error creating payment intent:', error)
      
      // Parse error message from response
      let errorMessage = 'Eroare la procesarea plății'
      if (error?.message) {
        if (Array.isArray(error.message)) {
          errorMessage = error.message.join(', ')
        } else {
          errorMessage = error.message
        }
      }
      
      throw new Error(errorMessage)
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