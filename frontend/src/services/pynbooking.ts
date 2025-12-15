/**
 * frontend/src/services/pynbooking.ts
 * Servicii pentru interacțiunea cu PynBooking API
 */

import { getPynBookingApiKey } from '@/config/env'
import { parseYYYYMMDDToDate } from '@/utils/dateUtils'

const PYNBOOKING_API_URL = 'https://api.pynbooking.com'

/**
 * Interfață pentru rezervarea PynBooking
 */
export interface PynBookingReservation {
  id: string
  checkInDate: string // Format: YYYY-MM-DD
  checkOutDate: string // Format: YYYY-MM-DD
  reservationType: string | number
  roomName: string // Numele camerei (ex: "104", "401")
  status: string // Status rezervare (ex: "Confirmata")
  checkIn: boolean
  guestId: string
  guestName: string
  guestPhone: string
  guests: Array<{
    guestId: string
    guestName: string
    guestPhone: string
  }>
}

/**
 * Parametrii pentru căutarea rezervărilor
 */
export interface SearchReservationsParams {
  date: string // Format: YYYY-MM-DD - data de start pentru căutare
  days?: number // Număr de zile în viitor (maxim 31, opțional)
  roomNo?: string | number // Numărul camerei (opțional)
}

/**
 * Obține toate rezervările active pentru o dată viitoare specificată
 * 
 * @param params - Parametrii pentru căutarea rezervărilor
 * @returns Promise cu array-ul de rezervări
 */
export async function searchReservations(
  params: SearchReservationsParams
): Promise<PynBookingReservation[]> {
  const apiKey = getPynBookingApiKey()
  
  if (!apiKey) {
    throw new Error('PynBooking API key nu este configurată. Adaugă NEXT_PUBLIC_PYNBOOKING_API_KEY în .env.local')
  }

  try {
    // Construiește body-ul pentru request (application/x-www-form-urlencoded)
    const formData = new URLSearchParams()
    formData.append('date', params.date)
    
    if (params.days !== undefined) {
      formData.append('days', params.days.toString())
    }
    
    if (params.roomNo !== undefined) {
      formData.append('roomNo', params.roomNo.toString())
    }

    const response = await fetch(`${PYNBOOKING_API_URL}/reservation/search/`, {
      method: 'POST',
      headers: {
        'Api-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      throw new Error(`PynBooking API Error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const reservations: PynBookingReservation[] = await response.json()
    return reservations
  } catch (error: any) {
    throw error
  }
}

/**
 * Verifică dacă o cameră este disponibilă pentru un interval de date
 * 
 * @param roomName - Numele camerei (ex: "104", "401")
 * @param checkInDate - Data de check-in (Format: YYYY-MM-DD)
 * @param checkOutDate - Data de check-out (Format: YYYY-MM-DD)
 * @returns Promise<boolean> - true dacă camera este disponibilă, false dacă este ocupată
 */
export async function isRoomAvailable(
  roomName: string,
  checkInDate: string,
  checkOutDate: string
): Promise<boolean> {
  try {
    // Obține toate rezervările care încep de la checkInDate sau înainte
    // și se termină după checkInDate sau mai târziu
    // Folosim days pentru a acoperi intervalul complet
    const checkIn = parseYYYYMMDDToDate(checkInDate)
    const checkOut = parseYYYYMMDDToDate(checkOutDate)
    const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const days = Math.min(daysDiff + 1, 31) // Maxim 31 zile conform API

    const reservations = await searchReservations({
      date: checkInDate,
      days: days,
      roomNo: roomName,
    })

    // Verifică dacă există rezervări care se suprapun cu intervalul dorit
    const hasOverlap = reservations.some(reservation => {
      const resCheckIn = parseYYYYMMDDToDate(reservation.checkInDate)
      const resCheckOut = parseYYYYMMDDToDate(reservation.checkOutDate)
      
      // Verifică suprapunerea: rezervarea existentă se suprapune dacă:
      // - checkInDate este înainte de resCheckOut ȘI
      // - checkOutDate este după resCheckIn
      const overlaps = 
        checkIn < resCheckOut && 
        checkOut > resCheckIn &&
        reservation.roomName === roomName &&
        reservation.status === 'Confirmata' // Doar rezervările confirmate blochează camera
      
      return overlaps
    })

    // Camera este disponibilă dacă nu există suprapuneri
    return !hasOverlap
  } catch (error: any) {
    // În caz de eroare, considerăm că camera nu este disponibilă (fail-safe)
    return false
  }
}

/**
 * Obține toate rezervările pentru multiple camere într-un interval de date
 * 
 * @param roomNames - Array cu numele camerelor
 * @param checkInDate - Data de check-in (Format: YYYY-MM-DD)
 * @param checkOutDate - Data de check-out (Format: YYYY-MM-DD)
 * @returns Promise cu un map de roomName -> boolean (disponibil sau nu)
 */
export async function checkMultipleRoomsAvailability(
  roomNames: string[],
  checkInDate: string,
  checkOutDate: string
): Promise<Record<string, boolean>> {
  try {
    // Calculează numărul de zile
    const checkIn = parseYYYYMMDDToDate(checkInDate)
    const checkOut = parseYYYYMMDDToDate(checkOutDate)
    const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24))
    const days = Math.min(daysDiff + 1, 31)

    // Obține toate rezervările pentru intervalul specificat
    const reservations = await searchReservations({
      date: checkInDate,
      days: days,
    })

    // Creează un map cu disponibilitatea pentru fiecare cameră
    const availabilityMap: Record<string, boolean> = {}
    
    // Inițializează toate camerele ca disponibile
    roomNames.forEach(roomName => {
      availabilityMap[roomName] = true
    })

    // Verifică fiecare rezervare
    reservations.forEach(reservation => {
      if (reservation.status !== 'Confirmata') {
        return // Ignoră rezervările neconfirmate
      }

      const roomName = reservation.roomName
      if (!roomNames.includes(roomName)) {
        return // Ignoră camerele care nu sunt în lista noastră
      }

      const resCheckIn = parseYYYYMMDDToDate(reservation.checkInDate)
      const resCheckOut = parseYYYYMMDDToDate(reservation.checkOutDate)
      
      // Verifică suprapunerea
      const overlaps = checkIn < resCheckOut && checkOut > resCheckIn
      
      if (overlaps) {
        availabilityMap[roomName] = false
      }
    })

    return availabilityMap
  } catch (error: any) {
    // În caz de eroare, considerăm că toate camerele nu sunt disponibile (fail-safe)
    const availabilityMap: Record<string, boolean> = {}
    roomNames.forEach(roomName => {
      availabilityMap[roomName] = false
    })
    return availabilityMap
  }
}

