/**
 * Listings Service
 * Business logic for listings (UI representation of apartments)
 * Handles transformation from apartments to listings format
 */

import { getAllApartments, getApartmentById, type Apartment } from './apartments'
import { extractCategoryHandleFromApartment } from '@/utils/extractCategoryHandle'
import { sanitizeImageUrl, sanitizeImageUrls } from '@/utils/imageUtils'

/**
 * Listing domain model
 * Maps to Apartment model from backend
 */
export interface Listing {
  id: string
  title: string
  handle: string
  address: string
  city?: string // City from apartment
  price: string
  featuredImage: string
  galleryImgs: string[]
  description: string // Fallback description (ro by default)
  descriptionRo?: string // Description in Romanian
  descriptionEn?: string // Description in English
  amenities: string[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
  beds: number
  categoryHandle: string
  listingCategory: string
  date: string
  discountCode?: string 
  status?: string 
  hotelId?: string // ID-ul hotelului (necesar pentru verificare disponibilitate)
  roomId?: number // ID-ul camerei din PynBooking (legacy)
  roomType?: string // nou: tipul camerei folosit pentru disponibilitate
  map: {
    lat: number
    lng: number
  }
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

// extractCategoryHandle moved to utils/extractCategoryHandle.ts

/**
 * Get coordinates from apartment
 */
function getCoordinates(apartment: Apartment): { lat: number; lng: number } {
  // Prefer coordinates from apartment if available
  if (apartment.coordinates) {
    return {
      lat: apartment.coordinates.latitude,
      lng: apartment.coordinates.longitude,
    }
  }

  // Fallback to city coordinates
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'cluj-napoca': { lat: 46.7712, lng: 23.6236 },
    'baia-mare': { lat: 47.6567, lng: 23.5683 },
    'oradea': { lat: 47.0465, lng: 21.9189 },
  }

  const categoryHandle = extractCategoryHandleFromApartment(apartment)
  return cityCoords[categoryHandle] || { lat: 0, lng: 0 }
}

/**
 * Map apartment to listing format
 * @param apartment - Apartment data from backend
 * @param language - Optional language preference ('en' | 'ro'). If not provided, uses descriptionEn as fallback
 */
export function mapApartmentToListing(apartment: Apartment, language?: 'en' | 'ro'): Listing {
  const featuredImg = sanitizeImageUrl(apartment.images?.[0])
  const galleryImgs = apartment.images && apartment.images.length > 0 
    ? sanitizeImageUrls(apartment.images) 
    : [featuredImg]
  const categoryHandle = extractCategoryHandleFromApartment(apartment)
  const handle = generateHandle(apartment.name, apartment.id)

  // Verifică dacă apartamentul are hotelId și roomId (necesare pentru verificare disponibilitate)
  
  return {
    id: apartment.id,
    title: apartment.name,
    handle: handle,
    address: apartment.address || '',
    city: apartment.city, 
    price: `${apartment.price} RON`,
    featuredImage: featuredImg,
    galleryImgs: galleryImgs,
    description: apartment.descriptionRo || apartment.descriptionEn || '', // Fallback pentru compatibilitate
    descriptionRo: apartment.descriptionRo,
    descriptionEn: apartment.descriptionEn,
    amenities: apartment.amenities || [],
    maxGuests: apartment.maxGuests || 4,
    bedrooms: apartment.bedrooms || 2,
    bathrooms: apartment.bathrooms || 1,
    beds: apartment.bedrooms || 2, 
    categoryHandle: categoryHandle,
    listingCategory: 'Entire apartment',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    discountCode: apartment.discountCode ?? undefined, // Convert null to undefined
    status: apartment.status,
    hotelId: apartment.hotelId, // Păstrăm hotelId pentru verificare disponibilitate
    roomId: apartment.roomId, // Legacy
    roomType: apartment.roomType, // Nou pentru verificare disponibilitate
    map: getCoordinates(apartment),
  }
}

/**
 * Get all listings
 */
export async function getAllListings(): Promise<Listing[]> {
  try {
    // Force no-cache pentru development
    const apartments = await getAllApartments()
    const listings = apartments.map((apartment) => mapApartmentToListing(apartment))
    return listings
  } catch (error) {
    return []
  }
}

/**
 * Filter options for listings
 */
export interface ListingFilterOptions {
  city?: string
  checkin?: string
  checkout?: string
  guests?: number
  priceMin?: number
  priceMax?: number
  bedrooms?: number
  bathrooms?: number
  query?: string // Search query for name, address, description
}

/**
 * Get listings by category with optional filters
 */
export async function getListingsByCategory(
  categoryHandle?: string,
  filters?: ListingFilterOptions
): Promise<Listing[]> {
  let listings = await getAllListings()

  // Filter by category
  if (categoryHandle && categoryHandle !== 'all') {
    listings = listings.filter((listing) => listing.categoryHandle === categoryHandle)
  }

  // Apply additional filters
  if (filters) {
    // Filter by search query (name, address, description)
    if (filters.query && filters.query.trim()) {
      const queryLower = filters.query.toLowerCase().trim()
      listings = listings.filter((listing) => {
        // Search in title
        const titleMatch = listing.title.toLowerCase().includes(queryLower)
        
        // Search in address
        const addressMatch = listing.address.toLowerCase().includes(queryLower)
        
        // Search in city
        const cityMatch = listing.city?.toLowerCase().includes(queryLower) || false
        
        // Search in descriptions (if available)
        const descriptionRoMatch = listing.descriptionRo?.toLowerCase().includes(queryLower) || false
        const descriptionEnMatch = listing.descriptionEn?.toLowerCase().includes(queryLower) || false
        const descriptionMatch = descriptionRoMatch || descriptionEnMatch
        
        return titleMatch || addressMatch || cityMatch || descriptionMatch
      })
    }
    
    // Filter by city
    if (filters.city) {
      const cityLower = filters.city.toLowerCase().trim()
      // Normalize city name: remove special chars and normalize spaces/hyphens
      const normalizeCityName = (name: string) => {
        return name.toLowerCase().trim().replace(/[-\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      const cityNormalized = normalizeCityName(cityLower)
      const cityHandle = cityLower.replace(/\s+/g, '-')
      
      // Extract city from address (more flexible - looks for city in the address string)
      const extractCityFromAddress = (address: string): string[] => {
        if (!address) return []
        const addressLower = address.toLowerCase()
        const parts = address.split(',').map(p => p.trim().toLowerCase())
        // Return all parts as potential city names
        return parts
      }
      
      listings = listings.filter((listing) => {
        // Check if listing has city field and it matches
        if (listing.city) {
          const listingCityLower = listing.city.toLowerCase().trim()
          const listingCityNormalized = normalizeCityName(listingCityLower)
          
          // Exact match
          if (listingCityLower === cityLower) {
            return true
          }
          
          // Normalized match (handles "Cluj-Napoca" vs "Cluj Napoca")
          if (listingCityNormalized === cityNormalized) {
            return true
          }
          
          // Partial match (contains) - more flexible
          if (listingCityLower.includes(cityLower) || cityLower.includes(listingCityLower)) {
            return true
          }
          
          // Word match - check if any word from search matches any word in city
          const searchWords = cityLower.split(/[\s-]+/).filter(w => w.length > 2)
          const cityWords = listingCityLower.split(/[\s-]+/).filter(w => w.length > 2)
          if (searchWords.some(sw => cityWords.some(cw => cw.includes(sw) || sw.includes(cw)))) {
            return true
          }
        }
        
        // Check address - more flexible search
        if (listing.address) {
          const addressLower = listing.address.toLowerCase()
          
          // Check if search term appears anywhere in address
          if (addressLower.includes(cityLower)) {
            return true
          }
          
          // Extract potential city names from address
          const addressParts = extractCityFromAddress(listing.address)
          for (const part of addressParts) {
            const partNormalized = normalizeCityName(part)
            if (part === cityLower || partNormalized === cityNormalized) {
              return true
            }
            // Partial match in address parts
            if (part.includes(cityLower) || cityLower.includes(part)) {
              return true
            }
          }
          
          // Word match in address
          const searchWords = cityLower.split(/[\s-]+/).filter(w => w.length > 2)
          const addressWords = addressLower.split(/[\s,.-]+/).filter(w => w.length > 2)
          if (searchWords.some(sw => addressWords.some(aw => aw.includes(sw) || sw.includes(aw)))) {
            return true
          }
        }
        
        // Check categoryHandle (city name as handle, e.g., "cluj-napoca")
        if (listing.categoryHandle === cityHandle || listing.categoryHandle === cityNormalized) {
          return true
        }
        
        // Check if categoryHandle contains search term
        if (listing.categoryHandle && listing.categoryHandle.includes(cityNormalized)) {
          return true
        }
        
        return false
      })
    }

    // Filter by guests (maxGuests must be >= requested guests)
    // Total guests = adults + children + infants
    // Apartamentul trebuie să poată găzdui cel puțin numărul total de oaspeți
    if (filters.guests && filters.guests > 0) {
      const requestedGuests = filters.guests
      
      listings = listings.filter((listing) => {
        return listing.maxGuests >= requestedGuests
      })
    }

    // Filter by price range
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const minPrice = filters.priceMin ?? 0
      const maxPrice = filters.priceMax ?? Infinity
      
      listings = listings.filter((listing) => {
        // Extract numeric price from string like "500 RON"
        const numericPrice = Number(listing.price.replace(/[^0-9.-]+/g, ''))
        return numericPrice >= minPrice && numericPrice <= maxPrice
      })
    }

    // Filter by bedrooms
    if (filters.bedrooms && filters.bedrooms > 0) {
      listings = listings.filter((listing) => {
        return listing.bedrooms >= filters.bedrooms!
      })
    }

    // Filter by bathrooms
    if (filters.bathrooms && filters.bathrooms > 0) {
      listings = listings.filter((listing) => {
        return listing.bathrooms >= filters.bathrooms!
      })
    }

    // Filter by date (checkin/checkout) - verifică disponibilitatea folosind endpoint-ul existent
    if (filters.checkin && filters.checkout) {
      try {
        // Importăm funcția pentru verificare disponibilitate multiplă
        const { checkMultipleRoomAvailability } = await import('./availability')
        const { formatDateToYYYYMMDD, parseYYYYMMDDToDate } = await import('@/utils/dateUtils')
        
        // Normalizează datele în format YYYY-MM-DD
        // Datele din URL pot fi în formate diferite, trebuie să le convertim
        let checkInDate: string
        let checkOutDate: string
        
        try {
          // Încearcă să parseze datele folosind funcția robustă
          const checkIn = parseYYYYMMDDToDate(filters.checkin)
          const checkOut = parseYYYYMMDDToDate(filters.checkout)
          
          // Verifică dacă datele sunt valide
          if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
            throw new Error('Date invalide')
          }
          
          checkInDate = formatDateToYYYYMMDD(checkIn)
          checkOutDate = formatDateToYYYYMMDD(checkOut)
        } catch (dateError) {
          // Dacă datele sunt deja în format YYYY-MM-DD, le folosim direct
          if (filters.checkin.match(/^\d{4}-\d{2}-\d{2}$/) && filters.checkout.match(/^\d{4}-\d{2}-\d{2}$/)) {
            checkInDate = filters.checkin
            checkOutDate = filters.checkout
          } else {
            throw new Error('Format date invalid')
          }
        }
        
        // Verifică câte apartamente au roomType (sau roomId ca fallback)
        const listingsWithIds = listings.filter(listing => (listing.roomType || listing.roomId))
        
        // Pregătește request-urile pentru apartamentele care au roomType/roomId
        const availabilityRequests = listingsWithIds.map(listing => ({
          apartmentId: listing.id,
          roomType: listing.roomType ?? listing.roomId?.toString() ?? '',
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          currency: 'RON',
        }))
        
        // Verifică disponibilitatea pentru toate apartamentele în paralel
        if (availabilityRequests.length > 0) {
          const availabilityResults = await checkMultipleRoomAvailability(availabilityRequests)
          
          // Creează un map pentru a accesa rapid disponibilitatea după apartmentId
          const availabilityMap: Record<string, boolean> = {}
          availabilityRequests.forEach((request, index) => {
            const result = availabilityResults[index]
            availabilityMap[request.apartmentId] = result?.available === true
          })
          
          // Filtrează doar apartamentele disponibile
          listings = listings.filter(listing => {
            // Dacă listing-ul nu are roomType/roomId, îl păstrăm (nu putem verifica disponibilitatea)
            if (!listing.roomType && !listing.roomId) {
              return true
            }
            
            // Verifică disponibilitatea din map
            return availabilityMap[listing.id] === true
          })
        }
      } catch (error) {
        // În caz de eroare, nu filtrează după dată (afișează toate apartamentele)
      }
    }
  }

  return listings
}

/**
 * Get single listing by handle
 */
export async function getListingByHandle(handle: string): Promise<Listing | null> {
  try {
    // Get all listings and find by handle
    const listings = await getAllListings()
    const found = listings.find((listing) => listing.handle === handle)

    if (found) {
      return found
    }

    // Try by ID if it looks like MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(handle)) {
      const apartment = await getApartmentById(handle)
      if (apartment) {
        return mapApartmentToListing(apartment)
      }
    }

    // Fallback - return first listing if nothing found
    return listings[0] || null
  } catch (error) {
    return null
  }
}

/**
 * Get listing filter options
 */
export async function getListingFilterOptions() {
  return [
    {
      label: 'Price range',
      name: 'priceRange',
      tabUIType: 'price-range',
      min: 0,
      max: 1000,
    },
    {
      label: 'Rooms & Beds',
      name: 'roomsAndBeds',
      tabUIType: 'select-number',
      options: [
        { name: 'Bedrooms', max: 10 },
        { name: 'Bathrooms', max: 10 },
      ],
    },
  ]
}

