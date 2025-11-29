/**
 * frontend/src/api/endpoints.ts
 * Constante pentru endpoint-urile API
 */

export const API_ENDPOINTS = {
  APARTMENTS: {
    ALL: '/api/apartment-service/all',
    BY_ID: (id: string) => `/api/apartment-service/${id}`,
    BY_CITY: (city: string) => `/api/apartment-service/city/${city}`,
  },
  
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    WEBHOOK: '/api/payments/webhook',
  },
  
  RESERVATIONS: {
    CREATE: '/api/reservation-service',
  },
  
  DISCOUNT_CODES: {
    ALL: '/api/discount-code-service/all',
    BY_ID: (id: string) => `/api/discount-code-service/${id}`,
  },

} as const

