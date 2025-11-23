/**
 * Listings Service
 * Business logic for listings (UI representation of apartments)
 * Handles transformation from apartments to listings format
 */

import { getAllApartments, getApartmentById, type Apartment } from './apartments'

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
  description: string
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

/**
 * Extract category handle from city or address
 */
function extractCategoryHandle(apartment: Apartment): string {
  if (apartment.city) {
    return apartment.city.toLowerCase().replace(/\s+/g, '-')
  }

  // Fallback to extracting from address
  if (!apartment.address) return 'all'

  const city = apartment.address.split(',')[0]?.trim().toLowerCase()
  if (!city) return 'all'

  return city.replace(/\s+/g, '-')
}

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

  const categoryHandle = extractCategoryHandle(apartment)
  return cityCoords[categoryHandle] || { lat: 0, lng: 0 }
}

/**
 * Map apartment to listing format
 */
function mapApartmentToListing(apartment: Apartment): Listing {
  const featuredImg = apartment.images?.[0] || '/images/placeholder.jpg'
  const galleryImgs = apartment.images && apartment.images.length > 0 ? apartment.images : [featuredImg]
  const categoryHandle = extractCategoryHandle(apartment)
  const handle = generateHandle(apartment.name, apartment.id)

  // Use descriptionEn as default, fallback to descriptionRo, then description, then empty string
  const description = apartment.descriptionEn || apartment.descriptionRo || apartment.description || ''

  return {
    id: apartment.id,
    title: apartment.name,
    handle: handle,
    address: apartment.address || '',
    city: apartment.city, 
    price: `${apartment.price} RON`,
    featuredImage: featuredImg,
    galleryImgs: galleryImgs,
    description: description,
    amenities: apartment.amenities || [],
    maxGuests: apartment.maxGuests || 4,
    bedrooms: apartment.bedrooms || 2,
    bathrooms: apartment.bathrooms || 1,
    beds: apartment.bedrooms || 2, 
    categoryHandle: categoryHandle,
    listingCategory: 'Entire apartment',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    discountCode: apartment.discountCode, 
    status: apartment.status, 
    map: getCoordinates(apartment),
  }
}

/**
 * Get all listings
 */
export async function getAllListings(): Promise<Listing[]> {
  try {
    const apartments = await getAllApartments()
    console.log('[Listings Service] Fetched apartments:', apartments.length)
    if (apartments.length > 0) {
      console.log('[Listings Service] First apartment:', JSON.stringify(apartments[0], null, 2))
    }
    const listings = apartments.map(mapApartmentToListing)
    console.log('[Listings Service] Mapped to listings:', listings.length)
    if (listings.length > 0) {
      console.log('[Listings Service] First listing mapped:', JSON.stringify(listings[0], null, 2))
    }
    return listings
  } catch (error) {
    console.error('[Listings Service] Error fetching listings:', error)
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
    console.log('[Listings Service] Applying filters:', filters)
    const initialCount = listings.length
    
    // Filter by city
    if (filters.city) {
      const cityLower = filters.city.toLowerCase().trim()
      // Normalize city name: remove special chars and normalize spaces/hyphens
      const normalizeCityName = (name: string) => {
        return name.toLowerCase().trim().replace(/[-\s]+/g, '-').replace(/[^a-z0-9-]/g, '')
      }
      const cityNormalized = normalizeCityName(cityLower)
      const cityHandle = cityLower.replace(/\s+/g, '-')
      
      console.log('[Listings Service] Filtering by city:', {
        original: filters.city,
        lower: cityLower,
        normalized: cityNormalized,
        handle: cityHandle,
      })
      
      listings = listings.filter((listing) => {
        // Check if listing has city field and it matches
        if (listing.city) {
          const listingCityLower = listing.city.toLowerCase().trim()
          const listingCityNormalized = normalizeCityName(listingCityLower)
          
          // Exact match
          if (listingCityLower === cityLower) {
            console.log('[Listings Service] City match (exact):', listing.city, '===', filters.city)
            return true
          }
          
          // Normalized match (handles "Cluj-Napoca" vs "Cluj Napoca")
          if (listingCityNormalized === cityNormalized) {
            console.log('[Listings Service] City match (normalized):', listing.city, '===', filters.city)
            return true
          }
          
          // Partial match (contains)
          if (listingCityLower.includes(cityLower) || cityLower.includes(listingCityLower)) {
            console.log('[Listings Service] City match (partial):', listing.city, 'contains', filters.city)
            return true
          }
        }
        
        // Check address (first part before comma)
        const listingCityFromAddress = listing.address.split(',')[0]?.trim().toLowerCase()
        if (listingCityFromAddress) {
          const addressCityNormalized = normalizeCityName(listingCityFromAddress)
          
          if (listingCityFromAddress === cityLower || addressCityNormalized === cityNormalized) {
            console.log('[Listings Service] City match (from address):', listingCityFromAddress, '===', filters.city)
            return true
          }
        }
        
        // Check categoryHandle (city name as handle, e.g., "cluj-napoca")
        if (listing.categoryHandle === cityHandle || listing.categoryHandle === cityNormalized) {
          console.log('[Listings Service] City match (categoryHandle):', listing.categoryHandle, '===', cityHandle)
          return true
        }
        
        return false
      })
      
      console.log('[Listings Service] After city filter:', listings.length, 'listings (was', initialCount, ')')
    }

    // Filter by guests (maxGuests must be >= requested guests)
    // Total guests = adults + children + infants
    // Apartamentul trebuie să poată găzdui cel puțin numărul total de oaspeți
    if (filters.guests && filters.guests > 0) {
      const beforeGuestsFilter = listings.length
      const requestedGuests = filters.guests
      
      console.log('[Listings Service] Filtering by guests:', {
        requestedTotalGuests: requestedGuests,
        filterLogic: 'maxGuests >= requestedGuests',
      })
      
      listings = listings.filter((listing) => {
        const canAccommodate = listing.maxGuests >= requestedGuests
        if (!canAccommodate) {
          console.log('[Listings Service] Listing filtered out:', {
            listingId: listing.id,
            listingTitle: listing.title,
            maxGuests: listing.maxGuests,
            requestedGuests: requestedGuests,
            reason: 'maxGuests < requestedGuests',
          })
        }
        return canAccommodate
      })
      
      console.log('[Listings Service] After guests filter:', {
        remainingListings: listings.length,
        beforeFilter: beforeGuestsFilter,
        requestedGuests: requestedGuests,
        removed: beforeGuestsFilter - listings.length,
      })
    }

    // Filter by price range
    if (filters.priceMin !== undefined || filters.priceMax !== undefined) {
      const beforePriceFilter = listings.length
      const priceMin = filters.priceMin ?? 0
      const priceMax = filters.priceMax ?? Infinity
      
      console.log('[Listings Service] Filtering by price:', {
        priceMin,
        priceMax: priceMax === Infinity ? 'no limit' : priceMax,
        filterLogic: 'priceMin <= listing.price <= priceMax',
      })
      
      listings = listings.filter((listing) => {
        // Extract numeric price from "60 RON" format
        const numericPrice = Number(listing.price.replace(/[^0-9.-]+/g, ''))
        
        const inRange = numericPrice >= priceMin && numericPrice <= priceMax
        if (!inRange) {
          console.log('[Listings Service] Listing filtered out by price:', {
            listingId: listing.id,
            listingTitle: listing.title,
            listingPrice: listing.price,
            numericPrice: numericPrice,
            priceMin: priceMin,
            priceMax: priceMax === Infinity ? 'no limit' : priceMax,
            reason: 'price out of range',
          })
        }
        return inRange
      })
      
      console.log('[Listings Service] After price filter:', {
        remainingListings: listings.length,
        beforeFilter: beforePriceFilter,
        priceMin: priceMin,
        priceMax: priceMax === Infinity ? 'no limit' : priceMax,
        removed: beforePriceFilter - listings.length,
      })
    }

    // Note: checkin/checkout filtering would require availability data from backend
    // For now, we filter by city, guests, and price
    // TODO: Implement availability checking when backend endpoint is available
    
    console.log('[Listings Service] Final filtered listings count:', listings.length)
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
    console.log('[Listings Service] Listing not found, returning first available')
    return listings[0] || null
  } catch (error) {
    console.error('[Listings Service] Error fetching by handle:', error)
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
        { name: 'Beds', max: 10 },
        { name: 'Bedrooms', max: 10 },
        { name: 'Bathrooms', max: 10 },
      ],
    },
  ]
}

