'use server'

import { redirect } from 'next/navigation'
import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'
import { getApartmentById } from '@/services/apartments'
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '@/utils/dateUtils'
import { checkRoomAvailability } from '@/services/availability'
import { getUserFriendlyError } from '@/utils/errorMessages'

/**
 * Server Action pentru procesarea rezervării și crearea payment intent
 */

export async function handleCheckoutSubmit(formData: FormData): Promise<{ success: boolean; clientSecret?: string; error?: string }> {
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
    const guestsCount = guestAdults + guestChildren 
    const totalPrice = Number(formData.get('totalPrice') || 0)
    const currency = (formData.get('currency') as string) || 'RON'
    const guestAddress = formData.get('guestAddress') as string || ''
    const guestName = `${firstName} ${lastName}`
    // Folosim parseYYYYMMDDToDate pentru a evita probleme de timezone
    const checkIn = parseYYYYMMDDToDate(checkInDate)
    const checkOut = parseYYYYMMDDToDate(checkOutDate)
    const diffTime = checkOut.getTime() - checkIn.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    const nights = diffDays >= 1 ? diffDays : 1
    const pricePerNight = totalPrice / nights
    const pricePerDay = Array(nights).fill(pricePerNight)
    const formattedCheckIn = formatDateToYYYYMMDD(checkIn)
    const formattedCheckOut = formatDateToYYYYMMDD(checkOut)
    const currencyLower = currency.toLowerCase()

    // Validare câmpuri obligatorii
    if (!apartmentId || !firstName || !lastName || !email || !phoneNumber || !checkInDate || !checkOutDate || !guestAddress) {
      return { success: false, error: 'Toate câmpurile obligatorii trebuie completate' }
    }

    // Validare apartmentId - verificăm dacă este MongoDB ObjectId valid
    if (!/^[0-9a-fA-F]{24}$/.test(apartmentId)) {
      return { success: false, error: 'ID-ul apartamentului este invalid. Vă rugăm să selectați un apartament valid.' }
    }

    if (totalPrice <= 0) {
      return { success: false, error: 'Prețul total trebuie să fie mai mare decât 0' }
    }

    const apartment = await getApartmentById(apartmentId)
    if (!apartment) {
      return { success: false, error: 'Apartamentul nu a fost găsit' }
    }

    if (!apartment.roomType && !apartment.roomId) {
      return { success: false, error: 'Apartamentul nu are roomType configurat' }
    }

    // Verifică disponibilitatea înainte de a crea PaymentIntent
    const availabilityCheck = await checkRoomAvailability({
      hotelId: apartment.hotelId ? Number(apartment.hotelId) : undefined,
      roomType: apartment.roomType ?? apartment.roomId?.toString() ?? '',
      checkInDate: formattedCheckIn,
      checkOutDate: formattedCheckOut,
      currency: currency.toUpperCase(),
    })

    if (!availabilityCheck.available) {
      return { 
        success: false, 
        error: availabilityCheck.message || 'Camera nu este disponibilă pentru datele selectate. Vă rugăm să selectați alte date.' 
      }
    }

    // Pregătim datele pentru backend pentru payment intent
    const roomsArray = [
      {
        roomId: apartment.roomId, 
        planId: 1,
        quantity: 1,
        price: totalPrice,
        pricePerDay: pricePerDay, 
        noGuests: guestsCount,
      },
    ]

    const paymentIntentRequest: {
      apartment: string
      hotelId: string
      guestName: string
      guestEmail: string
      guestPhone: string
      guestAddress: string
      checkInDate: string
      checkOutDate: string
      guestsCount: number
      amount: number
      currency: string
      rooms: string // Backend așteaptă rooms ca JSON string
      metadata: {
        apartment: string
        hotelId: string
        guestName: string
        guestEmail: string
        guestPhone: string
        guestAddress: string
        checkInDate: string
        checkOutDate: string
        guestsCount: string
        totalPrice: string
        planId: string
      }
    } = {
      apartment: apartmentId,
      hotelId: apartment.hotelId,
      guestName,
      guestEmail: email,
      guestPhone: phoneNumber,
      guestAddress,
      checkInDate: formattedCheckIn, 
      checkOutDate: formattedCheckOut, 
      guestsCount,
      amount: totalPrice,
      currency: currencyLower, 
      rooms: JSON.stringify(roomsArray), // Convertim array-ul la JSON string
      metadata: {
        apartment: apartmentId,
        hotelId: apartment.hotelId,
        guestName,
        guestEmail: email,
        guestPhone: phoneNumber,
        guestAddress,
        checkInDate: formattedCheckIn,
        checkOutDate: formattedCheckOut,
        guestsCount: guestsCount.toString(),
        totalPrice: totalPrice.toString(),
        planId: "1",
      },
    }


    try {
      const response = await apiClient.post<{ clientSecret: string; paymentIntentId?: string }>(
        API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
        paymentIntentRequest
      )

      const { clientSecret, paymentIntentId } = response

      if (!clientSecret) {
        return { success: false, error: 'Nu s-a primit clientSecret de la backend' }
      }

      return { success: true, clientSecret }
    } catch (error: any) {
      // Folosește mesaje user-friendly pentru erori
      return { success: false, error: getUserFriendlyError(error, 'Eroare la procesarea plății. Vă rugăm să încercați din nou.') }
    }
  } catch (error: any) {
    // Catch-all pentru erori neașteptate - mesaj user-friendly
    return { success: false, error: getUserFriendlyError(error) }
  }
}