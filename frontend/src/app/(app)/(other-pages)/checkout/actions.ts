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

    // Folosim prețurile per noapte din override-uri dacă există
    const nightlyPricesRaw = formData.get('nightlyPrices') as string | null
    let pricePerDay: number[]
    if (nightlyPricesRaw) {
      try {
        const nightlyPrices: { date: string; price: number; currency: string }[] = JSON.parse(nightlyPricesRaw)
        // Prețurile vin deja în moneda backend-ului (valuta apartamentului)
        // Le convertim în RON dacă e necesar (totalPrice este deja în RON)
        pricePerDay = nightlyPrices.map(n => n.price)
        // Ajustăm dacă totalul per-night nu se potrivește cu totalPrice (din cauza rotunjirilor)
        if (pricePerDay.length !== nights) {
          pricePerDay = Array(nights).fill(pricePerNight)
        }
      } catch {
        pricePerDay = Array(nights).fill(pricePerNight)
      }
    } else {
      pricePerDay = Array(nights).fill(pricePerNight)
    }
    const formattedCheckIn = formatDateToYYYYMMDD(checkIn)
    const formattedCheckOut = formatDateToYYYYMMDD(checkOut)
    const currencyLower = currency.toLowerCase()

    // Validare câmpuri obligatorii
    const missingFields = {
      apartmentId: !apartmentId,
      firstName: !firstName,
      lastName: !lastName,
      email: !email,
      phoneNumber: !phoneNumber,
      checkInDate: !checkInDate,
      checkOutDate: !checkOutDate,
      guestAddress: !guestAddress,
    }
    const missing = Object.entries(missingFields).filter(([, v]) => v).map(([k]) => k)
    if (missing.length > 0) {
      return { success: false, error: `Câmpuri lipsă: ${missing.join(', ')}` }
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

    // Re-validare preț cu overrides actuale (protecție împotriva modificărilor de preț în timpul checkout)
    try {
      const { calculatePriceWithOverrides } = await import('@/services/apartments')
      const priceCalc = await calculatePriceWithOverrides(apartmentId, formattedCheckIn, formattedCheckOut)
      
      if (priceCalc && priceCalc.totalPrice > 0) {
        const priceDiff = Math.abs(priceCalc.totalPrice - totalPrice)
        const tolerance = priceCalc.totalPrice * 0.01 // 1% toleranță pentru rotunjiri
        
        if (priceDiff > tolerance) {
          return {
            success: false,
            error: `Prețul s-a modificat între timp. Prețul actual este ${priceCalc.totalPrice.toFixed(2)} ${priceCalc.currency}. Vă rugăm să reîncărcați pagina.`,
          }
        }
      }
    } catch {
      // Dacă nu putem verifica prețul, continuăm cu prețul existent (nu blocăm checkout-ul)
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
      return { success: false, error: getUserFriendlyError(error, 'Eroare la procesarea plății. Vă rugăm să încercați din nou.') }
    }
  } catch (error: any) {
    return { success: false, error: getUserFriendlyError(error) }
  }
}