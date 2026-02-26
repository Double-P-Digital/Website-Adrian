import {apiClient} from '@/api/client'
import { API_ENDPOINTS } from '@/api/endpoints'

export interface Apartment {
  id: string 
  hotelId: string
  roomId: number
  roomType?: string
  name: string
  price?: number
  currency?: string
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
    // Error fetching apartments - return empty array
    return []
  }
}

export async function getApartmentById(id: string): Promise<Apartment | null> {
  try {
    return await apiClient.get<Apartment>(API_ENDPOINTS.APARTMENTS.BY_ID(id), {
      next: { revalidate: 3600 },
    })
  } catch (error: any) {
    // Error fetching apartment - return null
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
    
    try {
      const allApartments = await getAllApartments()
      return allApartments.slice(0, limit)
    } catch (fallbackError) {
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
    return null
  }
}

// Check if date range is blocked
export interface BlockedDateCheck {
  isBlocked: boolean
  message?: string
  blockedDates?: Array<{
    startDate: string
    endDate: string
    reason?: string
  }>
}

export async function checkIfBlocked(
  apartmentId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<BlockedDateCheck> {
  try {
    return await apiClient.get<BlockedDateCheck>(
      `${API_ENDPOINTS.APARTMENTS.BY_ID(apartmentId)}/check-blocked?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
      {
        cache: 'no-store',
      }
    )
  } catch (error) {
    return { isBlocked: false }
  }
}

// Calculate price with overrides
export interface PriceCalculation {
  totalPrice: number
  nightlyPrices: Array<{ date: string; price: number; currency: string }>
  averagePrice: number
  hasOverrides: boolean
  currency: string
}

export async function calculatePriceWithOverrides(
  apartmentId: string,
  checkInDate: string,
  checkOutDate: string
): Promise<PriceCalculation | null> {
  try {
    return await apiClient.get<PriceCalculation>(
      `${API_ENDPOINTS.APARTMENTS.BY_ID(apartmentId)}/calculate-price?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`,
      {
        cache: 'no-store',
      }
    )
  } catch (error) {
    return null
  }
}
