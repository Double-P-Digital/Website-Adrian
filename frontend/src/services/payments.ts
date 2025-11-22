/**
 * Payments Service
 * Business logic for payments
 */

import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

export interface CreatePaymentIntentRequest {
  apartment: string
  guestName: string
  guestEmail: string
  checkInDate: string
  checkOutDate: string
  guestsCount: number
  amount: number
  phoneNumber: string
  customerType?: 'individual' | 'company'
  companyName?: string
  taxId?: string
  registrationNumber?: string
  companyAddress?: string
}

export interface CreatePaymentIntentResponse {
  clientSecret: string
}

/**
 * Create payment intent
 */
export async function createPaymentIntent(
  request: CreatePaymentIntentRequest
): Promise<CreatePaymentIntentResponse> {
  try {
    return await apiClient.post<CreatePaymentIntentResponse>(
      API_ENDPOINTS.PAYMENTS.CREATE_INTENT,
      request
    )
  } catch (error: any) {
    console.error('[Payments Service] Error creating payment intent:', error)
    
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
}

