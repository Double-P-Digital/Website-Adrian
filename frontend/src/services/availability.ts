/**
 * frontend/src/services/availability.ts
 * Servicii pentru verificarea disponibilității camerelor folosind Backend API
 */

import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

// Cache pentru request-uri identice (prevenire race conditions)
const requestCache = new Map<string, {
  promise: Promise<AvailabilityCheckResponse>
  timestamp: number
}>()

const CACHE_DURATION_MS = 5000 // 5 secunde cache pentru request-uri identice

// AbortController-uri active pentru a anula request-uri vechi
const activeControllers = new Map<string, AbortController>()

/**
 * Interfață pentru request-ul de verificare disponibilitate
 */
export interface AvailabilityCheckRequest {
  hotelId?: number
  apartmentId?: string // ID-ul apartamentului pentru verificare date blocate
  roomType: string // nou: identifică tipul camerei (ex: Deluxe, 104, etc.)
  checkInDate: string // Format: YYYY-MM-DD
  checkOutDate: string // Format: YYYY-MM-DD
  currency: string // Format: RON, EUR, USD, etc. (nu este folosit pentru PynBooking, dar păstrat pentru compatibilitate)
}

/**
 * Interfață pentru răspunsul de verificare disponibilitate
 */
export interface AvailabilityCheckResponse {
  available: boolean
  message?: string
  price?: number
  pricePerDay?: number[]
}

/**
 * Verifică disponibilitatea unei camere pentru datele specificate folosind Backend API
 * Implementează cache și request deduplication pentru a preveni race conditions
 * 
 * @param request - Datele pentru verificarea disponibilității
 * @param signal - AbortSignal opțional pentru a anula request-ul
 * @returns Promise cu rezultatul verificării disponibilității
 */
export async function checkRoomAvailability(
  request: AvailabilityCheckRequest,
  signal?: AbortSignal
): Promise<AvailabilityCheckResponse> {
  // Creează cheia de cache pentru request-uri identice
  const cacheKey = `${request.roomType}-${request.checkInDate}-${request.checkOutDate}`
  
  // Verifică dacă există un request activ pentru aceleași date
  const existingController = activeControllers.get(cacheKey)
  if (existingController) {
    // Anulează request-ul vechi
    existingController.abort()
  }
  
  // Creează un nou AbortController pentru acest request
  const controller = new AbortController()
  activeControllers.set(cacheKey, controller)
  
  // Combină signal-urile dacă ambele există
  const combinedSignal = signal 
    ? (() => {
        const combined = new AbortController()
        signal.addEventListener('abort', () => combined.abort())
        controller.signal.addEventListener('abort', () => combined.abort())
        return combined.signal
      })()
    : controller.signal

  try {
    // Verifică cache-ul pentru request-uri identice recente
    const cached = requestCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      // Returnează rezultatul din cache
      return await cached.promise
    }

    // Creează promise-ul pentru request
    const requestPromise = (async () => {
      try {
        // Apelează backend-ul pentru verificare disponibilitate
        const response = await apiClient.get<AvailabilityCheckResponse>(
          `${API_ENDPOINTS.RESERVATIONS.CHECK_AVAILABILITY}?` +
          (request.hotelId !== undefined ? `hotelId=${request.hotelId}&` : '') +
          (request.apartmentId ? `apartmentId=${request.apartmentId}&` : '') +
          `roomType=${encodeURIComponent(request.roomType)}&` +
          `checkInDate=${request.checkInDate}&` +
          `checkOutDate=${request.checkOutDate}&` +
          `currency=${request.currency}`,
          {
            cache: 'no-store', // Nu cache în Next.js pentru request-uri dinamice
            signal: combinedSignal, // AbortSignal pentru request cancellation
          }
        )

        return response
      } catch (error: any) {
        // Verifică dacă request-ul a fost anulat
        if (combinedSignal?.aborted || error?.name === 'AbortError') {
          throw new Error('Request anulat')
        }

        // Gestionare erori
        let errorMessage = 'Eroare la verificarea disponibilității'
        
        if (error?.message) {
          if (typeof error.message === 'string') {
            errorMessage = error.message
          } else if (Array.isArray(error.message)) {
            errorMessage = error.message.join(', ')
          }
        }
        
        // Pentru erori de network/backend, returnează fail-safe
        if (error?.message?.includes('Failed to fetch') || 
            error?.message?.includes('NetworkError') || 
            error?.status === 500 ||
            error?.status === 404) {
          // Returnează disponibil pentru a nu bloca utilizatorul (fail-safe)
          return {
            available: true,
            message: 'Nu s-a putut verifica disponibilitatea. Vă rugăm să continuați cu rezervarea.',
          }
        }

        return {
          available: false,
          message: errorMessage,
        }
      } finally {
        // Curăță controller-ul după ce request-ul este complet
        activeControllers.delete(cacheKey)
      }
    })()

    // Salvează în cache
    requestCache.set(cacheKey, {
      promise: requestPromise,
      timestamp: Date.now(),
    })

    // Curăță cache-ul vechi periodic
    if (requestCache.size > 50) {
      const now = Date.now()
      for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION_MS) {
          requestCache.delete(key)
        }
      }
    }

    return await requestPromise
  } catch (error: any) {
    // Dacă request-ul a fost anulat, nu logăm eroarea
    if (combinedSignal?.aborted || error?.message === 'Request anulat') {
      throw error // Re-throw pentru a fi gestionat de caller
    }
    
    // Curăță controller-ul în caz de eroare
    activeControllers.delete(cacheKey)
    
    throw error
  }
}

/**
 * Verifică disponibilitatea pentru multiple camere în paralel folosind Backend API
 * Implementează request deduplication pentru a preveni race conditions
 * 
 * @param requests - Array de request-uri pentru verificarea disponibilității
 * @returns Promise cu rezultatele pentru fiecare cameră
 */
export async function checkMultipleRoomAvailability(
  requests: AvailabilityCheckRequest[]
): Promise<AvailabilityCheckResponse[]> {
  try {
    if (requests.length === 0) {
      return []
    }

    // Verifică dacă toate request-urile au aceleași date
    const checkInDate = requests[0].checkInDate
    const checkOutDate = requests[0].checkOutDate
    const allSameDates = requests.every(
      req => req.checkInDate === checkInDate && req.checkOutDate === checkOutDate
    )

    if (!allSameDates) {
      // Dacă datele sunt diferite, verificăm fiecare cameră separat
      // Folosim Promise.allSettled pentru a nu opri la prima eroare
      const results = await Promise.allSettled(
        requests.map(request => checkRoomAvailability(request))
      )
      
      return results.map((result, index) => {
        if (result.status === 'fulfilled') {
          return result.value
        } else {
          return {
            available: false,
            message: 'Eroare la verificarea disponibilității',
          }
        }
      })
    }

    // Dacă toate au aceleași date, verificăm fiecare cameră în paralel
    // Folosim Promise.allSettled pentru a gestiona erorile individual
    const results = await Promise.allSettled(
      requests.map(request => checkRoomAvailability(request))
    )

    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value
      } else {
        return {
          available: false,
          message: 'Eroare la verificarea disponibilității',
        }
      }
    })
  } catch (error: any) {
    
    // Returnează răspunsuri cu eroare pentru toate camerele
    return requests.map(() => ({
      available: false,
      message: 'Eroare la verificarea disponibilității',
    }))
  }
}

