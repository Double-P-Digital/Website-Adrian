/**
 * Categories Service
 * Business logic for categories
 */

import { getAllApartments, type Apartment } from './apartments'
import { extractCategoryHandleFromLocation } from '@/utils/extractCategoryHandle'
import stayCategoryCoverImageBM from '@/images/img-siteBM.png'
import stayCategoryCoverImageCJ from '@/images/img-siteCJ.png'
import stayCategoryCoverImageOR from '@/images/img-siteOR.png'

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
 * Count apartments by category
 */
function countApartmentsByCategory(apartments: Apartment[]): { [key: string]: number } {
  const counts: { [key: string]: number } = {
    'cluj-napoca': 0,
    'baia-mare': 0,
    'oradea': 0,
  }


  apartments.forEach((apt, index) => {
    // Use city if available, otherwise fallback to address
    const location = apt.city || apt.address
    const categoryHandle = extractCategoryHandleFromLocation(location)
    
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

    // Build categories array - start with "all" category
    const categories: Category[] = [
      {
        id: 'stay-cat://all',
        name: 'Explore stays',
        handle: 'all',
        href: '/stay-categories/all',
        region: 'Romania',
        count: apartments.length,
        description: 'Explore all stays in Romania',
        thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/Cluj-Napoca.jpg',
        coverImage: {
          src: stayCategoryCoverImageCJ.src,
          width: stayCategoryCoverImageCJ.width,
          height: stayCategoryCoverImageCJ.height,
        },
      },
      {
        id: 'stay-cat://1',
        name: 'Cluj-Napoca',
        region: 'Romania',
        handle: 'cluj-napoca',
        href: '/stay-categories/cluj-napoca',
        count: counts['cluj-napoca'] || 0,
        thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/v1764674844/Cluj-Napoca_lkyjft.jpg',
        coverImage: {
          src: stayCategoryCoverImageCJ.src,
          width: stayCategoryCoverImageCJ.width,
          height: stayCategoryCoverImageCJ.height,
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
        thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/v1764674830/baia-mare_elqe32.webp',
        coverImage: {
          src: stayCategoryCoverImageBM.src,
          width: stayCategoryCoverImageBM.width,
          height: stayCategoryCoverImageBM.height,
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
        thumbnail: 'https://res.cloudinary.com/dcbzjspdt/image/upload/v1764674861/Oradea_sg3cfa.jpg',
        coverImage: {
          src: stayCategoryCoverImageOR.src,
          width: stayCategoryCoverImageOR.width,
          height: stayCategoryCoverImageOR.height,
        },
        description: 'Explore apartments in Oradea',
      },
    ]

    return categories
  } catch (error) {
    console.error('[Categories Service] Error fetching categories:', error)
    return []
  }
}

/**
 * Get category by handle
 */
export async function getCategoryByHandle(handle?: string): Promise<Category | null> {
  const normalizedHandle = handle?.toLowerCase() || 'all'
  
  const categories = await getAllCategories()
  return categories.find((category) => category.handle === normalizedHandle) || null
}

