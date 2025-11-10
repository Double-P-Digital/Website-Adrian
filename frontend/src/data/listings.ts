/**
 * frontend/src/data/listings.ts
 * Cu amenities inclus în TStayListing
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

// ============ TYPES ============

interface BackendApartment {
  id: string
  name: string
  address: string
  price: number
  description: string
  amenities: string[]
  images: string[]
  status?: string
}

export interface TStayListing {
  id: string
  title: string
  handle: string
  address: string
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
  reviewStart: number
  reviewCount: number
  listingCategory: string
  date: string
  like: boolean
  isAds: null
  saleOff: null
  map: {
    lat: number
    lng: number
  }
}

// ============ HELPER FUNCTIONS ============

/**
 * Generate handle from apartment name
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
 * Extract category handle from address
 */
function extractCategoryHandleFromAddress(address: string): string {
  if (!address) return 'all'
  
  const city = address.split(',')[0]?.trim().toLowerCase()
  if (!city) return 'all'
  
  return city.replace(/\s+/g, '-')
}

/**
 * Get coordinates from city name
 */
function getCoordinatesFromAddress(address: string): { lat: number; lng: number } {
  const cityCoords: { [key: string]: { lat: number; lng: number } } = {
    'cluj-napoca': { lat: 46.7712, lng: 23.6236 },
    'baia-mare': { lat: 47.6567, lng: 23.5683 },
    'oradea': { lat: 47.0465, lng: 21.9189 },
  }
  
  const categoryHandle = extractCategoryHandleFromAddress(address)
  return cityCoords[categoryHandle] || { lat: 0, lng: 0 }
}

/**
 * Maps backend apartment to frontend listing format
 */
function mapBackendToFrontend(apt: BackendApartment): TStayListing {
  const featuredImg = apt.images?.[0] || '/images/placeholder.jpg'
  const galleryImgs = apt.images && apt.images.length > 0 ? apt.images : [featuredImg]
  const categoryHandle = extractCategoryHandleFromAddress(apt.address)
  const handle = generateHandle(apt.name, apt.id)
  
  return {
    id: apt.id,
    title: apt.name,
    handle: handle,
    address: apt.address || '',
    price: `${apt.price} RON`,
    featuredImage: featuredImg,
    galleryImgs: galleryImgs,
    description: apt.description || '',
    amenities: apt.amenities || [],  // ✅ ADĂUGAT - din backend
    maxGuests: 4,
    bedrooms: 2,
    bathrooms: 1,
    beds: 2,
    categoryHandle: categoryHandle,
    reviewStart: 4.5,
    reviewCount: 0,
    listingCategory: 'Entire apartment',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    like: false,
    isAds: null,
    saleOff: null,
    map: getCoordinatesFromAddress(apt.address),
  }
}

// ============ API FUNCTIONS ============

/**
 * Fetch all apartments from backend
 */
async function fetchFromBackend(): Promise<TStayListing[]> {
  try {
    console.log('[Listings] Fetching from backend:', `${API_BASE_URL}/api/apartments/all`)
    
    const response = await fetch(`${API_BASE_URL}/api/apartments/all`, {
      headers: {
        'x-api-key': API_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Listings] Backend error:', response.status, response.statusText)
      return []
    }

    const apartments: BackendApartment[] = await response.json()
    console.log(`[Listings] Fetched ${apartments.length} apartments from backend`)
    
    return apartments.map(mapBackendToFrontend)
  } catch (error) {
    console.error('[Listings] Error fetching from backend:', error)
    return []
  }
}

// ============ PUBLIC API ============

/**
 * Get all stay listings
 */
export async function getStayListings(): Promise<TStayListing[]> {
  return await fetchFromBackend()
}

/**
 * Get stay listings by category
 */
export async function getStayListingsByCategory(categoryHandle?: string): Promise<TStayListing[]> {
  const listings = await fetchFromBackend()

  if (!categoryHandle || categoryHandle === 'all') {
    return listings
  }

  return listings.filter((listing) => listing.categoryHandle === categoryHandle)
}

/**
 * Get single stay listing by handle
 */
export async function getStayListingByHandle(handle: string): Promise<TStayListing | null> {
  try {
    console.log('[Listings] Fetching by handle:', handle)
    
    // Get all apartments and find by handle
    const apartments = await fetchFromBackend()
    const found = apartments.find((apt) => apt.handle === handle)

    if (found) {
      console.log('[Listings] Found apartment by handle:', found.id)
      return found
    }

    // Try by ID if it looks like MongoDB ObjectId
    if (/^[0-9a-fA-F]{24}$/.test(handle)) {
      const response = await fetch(`${API_BASE_URL}/api/apartments/${handle}`, {
        headers: {
          'x-api-key': API_KEY,
        },
        cache: 'no-store',
      })

      if (response.ok) {
        const apartment: BackendApartment = await response.json()
        return mapBackendToFrontend(apartment)
      }
    }

    // Fallback - return first apartment if nothing found
    console.log('[Listings] Apartment not found, returning first available')
    return apartments[0] || null
  } catch (error) {
    console.error('[Listings] Error fetching by handle:', error)
    return null
  }
}

/**
 * Get filter options for stay listings
 */
export async function getStayListingFilterOptions() {
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