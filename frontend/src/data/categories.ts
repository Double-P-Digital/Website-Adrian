import stayCategoryCoverImage from '@/images/hero-right-2.png'

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

export interface TStayCategory {
  id: string
  name: string
  region: string
  handle: string
  href: string
  count: number
  thumbnail: string
  coverImage: {
    src: string
    width: number
    height: number
  }
  description: string
}

// ============ HELPER FUNCTIONS ============

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
 * Fetch all apartments from backend to count by category
 */
async function fetchApartmentsForCount(): Promise<BackendApartment[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/apartments/all`, {
      headers: {
        'x-api-key': API_KEY,
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Categories] Failed to fetch apartments:', response.status)
      return []
    }

    return await response.json()
  } catch (error) {
    console.error('[Categories] Error fetching apartments:', error)
    return []
  }
}

/**
 * Count apartments by category
 */
function countApartmentsByCategory(apartments: BackendApartment[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {
    'cluj-napoca': 0,
    'baia-mare': 0,
    'oradea': 0,
  }

  apartments.forEach((apt) => {
    const categoryHandle = extractCategoryHandleFromAddress(apt.address)
    if (counts[categoryHandle] !== undefined) {
      counts[categoryHandle]++
    }
  })

  return counts
}

// ============ PUBLIC API ============

export async function getStayCategories(): Promise<TStayCategory[]> {
  // Fetch apartments to get real counts
  const apartments = await fetchApartmentsForCount()
  const counts = countApartmentsByCategory(apartments)

  console.log('[Categories] Apartment counts:', counts)

  return [
    {
      id: 'stay-cat://1',
      name: 'Cluj-Napoca',
      region: 'Romania',
      handle: 'cluj-napoca',
      href: '/stay-categories/cluj-napoca',
      count: counts['cluj-napoca'] || 0, 
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/Cluj-Napoca.jpg',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
      description: 'Explore apartments in Cluj-Napoca',
    },
    {
      id: 'stay-cat://2',
      name: 'Baia Mare',
      region: 'Romania',
      handle: 'baia-mare',
      href: '/stay-categories/baia-mare',
      count: counts['baia-mare'] || 0, 
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/baia-mare.webp',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
      description: 'Explore apartments in Baia Mare',
    },
    {
      id: 'stay-cat://3',
      name: 'Oradea',
      region: 'Romania',
      handle: 'oradea',
      href: '/stay-categories/oradea',
      count: counts['oradea'] || 0, 
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/Oradea.jpg',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
      description: 'Explore apartments in Oradea',
    },
  ]
}

export async function getStayCategoryByHandle(handle?: string): Promise<TStayCategory | null> {
  handle = handle?.toLowerCase()

  if (!handle || handle === 'all') {
    // Fetch total count for "all" category
    const apartments = await fetchApartmentsForCount()
    
    return {
      id: 'stay://all',
      name: 'Explore stays',
      handle: 'all',
      href: '/stay-categories/all',
      region: 'Romania',
      count: apartments.length, 
      description: 'Explore all stays in Romania',
      thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/Cluj-Napoca.jpg',
      coverImage: {
        src: stayCategoryCoverImage.src,
        width: stayCategoryCoverImage.width,
        height: stayCategoryCoverImage.height,
      },
    }
  }

  const categories = await getStayCategories()
  return categories.find((category) => category.handle === handle) || null
}

export type TCategory = TStayCategory