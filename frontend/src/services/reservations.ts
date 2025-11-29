/**
 * Reservations Service
 * Business logic for reservations
 */

import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

/**
 * @deprecated Product structure for reservation - nu mai este folosită în noua structură simplificată
 * Păstrată pentru backwards compatibility sau pentru viitor
 */
export interface CreateReservationProductDto {
  productId: number 
  name: string 
  quantity: number 
  price: number 
  unitPrice?: number 
  persons?: number 
  nights?: number 
}

/**
 * @deprecated Room structure for reservation - nu mai este folosită în noua structură simplificată
 * Păstrată pentru backwards compatibility sau pentru viitor
 */
export interface CreateReservationRoomDto {
  roomId: number 
  planId: number 
  offerId?: number 
  quantity: number 
  price: number 
  pricePerDay: number[] 
  noGuests: number 
  voucherCode?: string 
  voucherDiscount?: number 
  products?: CreateReservationProductDto[] 
}

/**
 * Reservation structure
 * IMPORTANT: Rezervarea se creează DUPĂ plata reușită, cu status "confirmed"
 */
export interface Reservation {
  id?: string 
  apartment: string 
  guestName: string 
  guestEmail: string 
  checkInDate: string | Date 
  checkOutDate: string | Date 
  guestsCount: number 
  totalPrice: number 
  currency: string 
  paymentIntentId: string 
  status: 'pending' | 'confirmed' | 'cancelled' 
  externalBookingId?: string 
  syncFailed?: boolean 
  syncError?: string 
  createdAt?: Date 
  updatedAt?: Date 
}

/**
 * Reservation request structure for creating a new reservation
 * Se folosește pentru a crea o rezervare după plata reușită
 */
export interface CreateReservationRequest {
  apartment: string 
  guestName: string 
  guestEmail: string 
  checkInDate: string 
  checkOutDate: string 
  guestsCount: number 
  totalPrice: number 
  currency: string 
  paymentIntentId: string 
  status?: 'pending' | 'confirmed' | 'cancelled' 
  externalBookingId?: string 
  syncFailed?: boolean 
  syncError?: string 
}

export interface CreateReservationResponse {
  id: string
  bookingCode?: string
  message?: string
}

/**
 * Create reservation after successful payment
 */
export async function createReservation(
  request: CreateReservationRequest
): Promise<CreateReservationResponse> {
  try {
    return await apiClient.post<CreateReservationResponse>(
      API_ENDPOINTS.RESERVATIONS.CREATE,
      request
    )
  } catch (error: any) {
    console.error('[Reservations Service] Error creating reservation:', error)
    
    // Parse error message from response
    let errorMessage = 'Eroare la salvarea rezervării'
    if (error?.message) {
      if (Array.isArray(error.message)) {
        errorMessage = error.message.join(', ')
      } else {
        errorMessage = error.message
      }
    }
    
    throw new Error(errorMessage)
  }
}

