import {apiClient} from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

export interface Apartment {
  id: string 
  hotelId: string
  roomId: number
  name: string
  price?: number
  maxGuests?: number
  bedrooms?: number
  bathrooms?: number
  address?: string
  city?: string
  coordinates: {
    latitude: number
    longitude: number
  }
  descriptionEn?: string
  descriptionRo?: string
  amenities?: string[]
  images?: string[]
  discountCode?: string | null
  status?: string
  stripeAccountId?: string
}

export interface TopBookedApartmentResponse extends Apartment {
  bookingCount?: number
}

export async function getAllApartments(): Promise<Apartment[]> {
  try {
    return await apiClient.get<Apartment[]>(API_ENDPOINTS.APARTMENTS.ALL, {
      next: { revalidate: 60 }, 
    })
  } catch (error: any) {
    if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      console.warn('[Apartments Service] Backend not accessible, returning empty array')
    } else {
      console.warn('[Apartments Service] Error fetching all apartments:', error?.message || error)
    }
    return []
  }
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  try {
    return await apiClient.get<Apartment>(API_ENDPOINTS.APARTMENTS.BY_ID(id), {
      next: { revalidate: 3600 },
    })
  } catch (error: any) {
    if (error?.status === 404) {
      console.warn(`[Apartments Service] Apartment ${id} not found (404)`)
    } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
      console.warn(`[Apartments Service] Backend not accessible for apartment ${id}`)
    } else {
      console.warn(`[Apartments Service] Error fetching apartment ${id}:`, error?.message || error)
    }
    return null
  }
}

export async function getTopBookedApartments(limit: number = 10): Promise<Apartment[]> {
  try {
    const response = await apiClient.get<TopBookedApartmentResponse[]>(
      API_ENDPOINTS.APARTMENTS.TOP_BOOKED(limit),
      {
        next: { revalidate: 300 },
      }
    )
    
    const apartmentsWithBookings = response.filter(apt => 
      apt.bookingCount === undefined || apt.bookingCount > 0
    )
    
    return apartmentsWithBookings.slice(0, limit)
  } catch (error) {
    console.warn('[Apartments Service] Top booked apartments endpoint error, using fallback:', error)
    
    try {
      const allApartments = await getAllApartments()
      return allApartments.slice(0, limit)
    } catch (fallbackError) {
      console.error('[Apartments Service] Error in fallback for top booked apartments:', fallbackError)
      return []
    }
  }
}

export interface ApartmentForCheckout {
  id: string
  name: string
  address: string
  price: number
  images: string[]
  handle: string
}

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

