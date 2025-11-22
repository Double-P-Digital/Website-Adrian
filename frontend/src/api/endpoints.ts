/**
 * frontend/src/api/endpoints.ts
 * Constante pentru endpoint-urile API
 */

export const API_ENDPOINTS = {
  // Apartments
  APARTMENTS: {
    ALL: '/api/apartments/all',
    BY_ID: (id: string) => `/api/apartments/${id}`,
    TOP_BOOKED: (limit?: number) => `/api/apartments/top-booked${limit ? `?limit=${limit}` : ''}`,
  },
  
  // Payments
  PAYMENTS: {
    CREATE_INTENT: '/api/payments/create-intent',
    WEBHOOK: '/api/payments/webhook',
  },
  
  // Reservations
  RESERVATIONS: {
    CREATE: '/api/reservation',
    BY_EMAIL: (email: string) => `/api/reservations/by-email/${email}`,
    BY_CODE: (code: string) => `/api/reservations/by-code/${code}`,
    ALL: '/api/reservations',
    BY_ID: (id: string) => `/api/reservations/${id}`,
  },
  
  // Categories (dacă va fi adăugat în viitor)
  CATEGORIES: {
    ALL: '/api/categories',
    BY_HANDLE: (handle: string) => `/api/categories/${handle}`,
  },
} as const

