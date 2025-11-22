/**
 * Apartments Service
 * Business logic for apartments
 * Handles data fetching and business rules
 */

import { apiClient } from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

/**
 * Apartment domain model
 */
export interface Apartment {
  id: string
  name: string
  price: number
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  address: string
  city?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  description?: string // Backend returns this field
  descriptionEn?: string
  descriptionRo?: string
  amenities: string[]
  images: string[]
  discountCode?: string
  status?: string
}

/**
 * Get all apartments
 */
export async function getAllApartments(): Promise<Apartment[]> {
  try {
    return await apiClient.get<Apartment[]>(API_ENDPOINTS.APARTMENTS.ALL, {
      next: { revalidate: 3600 }, // Revalidate every hour
    })
  } catch (error) {
    console.error('[Apartments Service] Error fetching all apartments:', error)
    return []
  }
}

/**
 * Get apartment by ID
 */
export async function getApartmentById(id: string): Promise<Apartment | null> {
  try {
    return await apiClient.get<Apartment>(API_ENDPOINTS.APARTMENTS.BY_ID(id), {
      next: { revalidate: 3600 },
    })
  } catch (error) {
    console.error(`[Apartments Service] Error fetching apartment ${id}:`, error)
    return null
  }
}

/**
 * Get top booked apartments
 * TODO: Când backend-ul va avea acest endpoint, deblochează funcția
 */
export async function getTopBookedApartments(limit: number = 5): Promise<Apartment[]> {
  try {
    // Temporar: returnează toate apartamentele și taie primele N
    // Când backend-ul va avea endpoint-ul, folosește:
    // return await apiClient.get<Apartment[]>(API_ENDPOINTS.APARTMENTS.TOP_BOOKED(limit))
    
    const allApartments = await getAllApartments()
    return allApartments.slice(0, limit)
  } catch (error) {
    console.error('[Apartments Service] Error fetching top booked apartments:', error)
    return []
  }
}

/**
 * Get apartment for checkout (simplified version)
 * Returns minimal data needed for checkout
 */
export interface ApartmentForCheckout {
  id: string
  name: string
  address: string
  price: number
  images: string[]
  handle: string
}

/**
 * Generate handle from apartment name and ID
 */
function generateHandle(name: string, id: string): string {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

  return slug || id
}

export async function getApartmentForCheckout(id: string): Promise<ApartmentForCheckout | null> {
  try {
    const apartment = await getApartmentById(id)
    if (!apartment) {
      return null
    }

    return {
      id: apartment.id,
      name: apartment.name,
      address: apartment.address || '',
      price: apartment.price || 0,
      images: apartment.images || [],
      handle: generateHandle(apartment.name, apartment.id),
    }
  } catch (error) {
    console.error(`[Apartments Service] Error fetching apartment for checkout ${id}:`, error)
    return null
  }
}

