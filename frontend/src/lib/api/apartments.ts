/**
 * frontend/src/lib/api/apartments.ts
 * API functions DOAR pentru checkout/ApartmentSummary
 * Restul aplicației folosește frontend/src/data/listings.ts
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

export interface ApartmentForCheckout {
  id: string
  name: string
  address: string
  price: number
  images: string[]
  handle: string
}

/**
 * Fetch single apartment by ID (pentru checkout)
 * Folosit doar în ApartmentSummary.tsx
 */
export async function fetchApartmentById(id: string): Promise<ApartmentForCheckout | null> {
  try {
    console.log('[API] Fetching apartment by ID:', id)
    
    const response = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      headers: {
        'x-api-key': API_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[API] Failed to fetch apartment:', response.status, response.statusText)
      return null
    }

    const data = await response.json()
    
    return {
      id: data.id,
      name: data.name,
      address: data.address || '',
      price: data.price || 0,
      images: data.images || [],
      handle: data.id,
    }
  } catch (error) {
    console.error('[API] Error fetching apartment:', error)
    return null
  }
}