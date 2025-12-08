/**
 * frontend/src/api/endpoints.ts
 * Constante pentru endpoint-urile API
 */

export const API_ENDPOINTS = {
  APARTMENTS: {
    ALL: '/api/apartment-service/all',
    BY_ID: (id: string) => `/api/apartment-service/${id}`,
    TOP_BOOKED: (limit?: number) => 
      limit ? `/api/apartment-service/top-booked?limit=${limit}` : '/api/apartment-service/top-booked',
  },
  
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    WEBHOOK: '/api/payments/webhook',
  },
  
  RESERVATIONS: {
    CHECK_AVAILABILITY: '/api/reservation-service/check-availability',
  },
  
  DISCOUNT_CODES: {
    ALL: '/api/discount-code-service/all',
    BY_ID: (id: string) => `/api/discount-code-service/${id}`,
    CALCULATE: '/api/discount-code-service/calculate'
  },

} as const

