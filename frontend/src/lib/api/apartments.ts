/**
 * API functions for fetching apartments from backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

interface BackendApartment {
  id: string
  name: string
  address?: string
  price: number
  description?: string
  amenities?: string[]
  images?: string[]
  status?: string
}

interface FrontendListing {
  id: string
  title: string
  handle: string
  address: string
  price: string
  featuredImage: string | { src: string }
  galleryImgs: string[]
  description: string
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

/**
 * Extracts category handle from address
 * Example: "Cluj-Napoca, Romania" → "cluj-napoca"
 */
function extractCategoryHandleFromAddress(address?: string): string {
  if (!address) return 'all'
  
  // Extract city name (before comma)
  const city = address.split(',')[0]?.trim().toLowerCase()
  if (!city) return 'all'
  
  // Convert to handle format (replace spaces with hyphens)
  return city.replace(/\s+/g, '-')
}

/**
 * Maps backend apartment to frontend listing format
 * Uses only fields that exist in backend schema:
 * - name, address, price, description, amenities, images, status
 * Other fields use default values
 * categoryHandle is extracted from address field
 */
function mapBackendToFrontend(apt: BackendApartment): FrontendListing {
  const featuredImg = apt.images?.[0] || ''
  const galleryImgs = apt.images || []
  const categoryHandle = extractCategoryHandleFromAddress(apt.address)
  
  return {
    id: apt.id,
    title: apt.name,
    handle: apt.id, // Use ID as handle since backend doesn't have handle field
    address: apt.address || '',
    price: `$${apt.price}`,
    featuredImage: featuredImg,
    galleryImgs: galleryImgs.length > 0 ? galleryImgs : [featuredImg].filter(Boolean),
    description: apt.description || '',
    maxGuests: 2, // Default value - not in backend
    bedrooms: 1, // Default value - not in backend
    bathrooms: 1, // Default value - not in backend
    beds: 1, // Default value - not in backend
    categoryHandle: categoryHandle, // Extracted from address
    reviewStart: 4.5, // Default value - not in backend
    reviewCount: 0, // Default value - not in backend
    listingCategory: 'Entire apartment',
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    like: false,
    isAds: null,
    saleOff: null,
    map: { lat: 0, lng: 0 }, // Default value - not in backend
  }
}

/**
 * Fetch all apartments from backend
 */
export async function fetchApartmentsFromBackend(): Promise<FrontendListing[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/apartments/all`, {
      headers: {
        'x-api-key': API_KEY,
      },
      cache: 'no-store', // Always fetch fresh data
    })

    if (!response.ok) {
      console.error('Failed to fetch apartments:', response.status, response.statusText)
      return []
    }

    const apartments: BackendApartment[] = await response.json()
    return apartments.map(mapBackendToFrontend)
  } catch (error) {
    console.error('Error fetching apartments from backend:', error)
    return []
  }
}

/**
 * Fetch single apartment by ID from backend
 */
export async function fetchApartmentById(id: string): Promise<FrontendListing | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/apartments/${id}`, {
      headers: {
        'x-api-key': API_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('Failed to fetch apartment:', response.status, response.statusText)
      return null
    }

    const apartment: BackendApartment = await response.json()
    return mapBackendToFrontend(apartment)
  } catch (error) {
    console.error('Error fetching apartment from backend:', error)
    return null
  }
}

/**
 * Fetch apartment by handle (searches by ID since backend doesn't have handle field)
 * If handle is a mock ID (starts with 'stay-listing://'), returns null to use fallback
 */
export async function fetchApartmentByHandle(handle: string): Promise<FrontendListing | null> {
  try {
    // If it's a mock handle, don't try to fetch from backend
    if (handle.startsWith('stay-listing://') || handle.includes('-apartment-')) {
      return null // Use fallback mock data
    }

    // Since backend doesn't have handle field, try to find by ID
    // First, try to get all apartments and find by ID
    const apartments = await fetchApartmentsFromBackend()
    const found = apartments.find((apt) => apt.id === handle)

    if (found) {
      return found
    }

    // If not found, try by ID directly (only if it looks like MongoDB ObjectId)
    if (/^[0-9a-fA-F]{24}$/.test(handle)) {
      return await fetchApartmentById(handle)
    }

    return null
  } catch (error) {
    console.error('Error fetching apartment by handle:', error)
    return null
  }
}

/**
 * Fetch apartments by category handle
 * Filters apartments by extracting categoryHandle from address field
 */
export async function fetchApartmentsByCategory(
  categoryHandle?: string
): Promise<FrontendListing[]> {
  const apartments = await fetchApartmentsFromBackend()

  // Return all if 'all' or undefined
  if (!categoryHandle || categoryHandle === 'all') {
    return apartments
  }

  // Filter by categoryHandle (extracted from address)
  return apartments.filter((apt) => apt.categoryHandle === categoryHandle)
}

