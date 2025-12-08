/**
 * Reservations Service
 * Business logic for reservations
 */

import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

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


