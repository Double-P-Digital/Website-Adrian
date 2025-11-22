/**
 * Categories Service
 * Business logic for categories
 */

import { getAllApartments } from './apartments'
import stayCategoryCoverImage from '@/images/hero-right-2.png'

/**
 * Category domain model
 */
export interface Category {
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
 * Count apartments by category
 */
function countApartmentsByCategory(apartments: { address: string }[]): { [key: string]: number } {
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

/**
 * Get all categories
 */
export async function getAllCategories(): Promise<Category[]> {
  try {
    // Fetch apartments to get real counts
    const apartments = await getAllApartments()
    const counts = countApartmentsByCategory(apartments)

    console.log('[Categories Service] Apartment counts:', counts)

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
  } catch (error) {
    console.error('[Categories Service] Error fetching categories:', error)
    return []
  }
}

/**
 * Get category by handle
 */
export async function getCategoryByHandle(handle?: string): Promise<Category | null> {
  handle = handle?.toLowerCase()

  if (!handle || handle === 'all') {
    // Fetch total count for "all" category
    try {
      const apartments = await getAllApartments()

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
    } catch (error) {
      console.error('[Categories Service] Error fetching all category:', error)
      return null
    }
  }

  const categories = await getAllCategories()
  return categories.find((category) => category.handle === handle) || null
}

