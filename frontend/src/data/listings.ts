import { fetchApartmentsFromBackend, fetchApartmentsByCategory, fetchApartmentByHandle } from '@/lib/api/apartments'

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

const getCloudinaryUrl = (filename: string, options?: {
  width?: number
  quality?: number
  progressive?: boolean
}) => {
  const { width, quality = 90, progressive = false } = options || {}
  
  const transformations = []
  if (width) {
    transformations.push(`w_${width}`)
    transformations.push('c_limit')
  }
  
  transformations.push(`q_${quality}`)
  transformations.push('f_auto')

  if (progressive) {
    transformations.push('fl_progressive:steep')
  }

  transformations.push('fl_lossy')
  transformations.push('fl_force_strip') 
  transformations.push('q_auto:best')    
  const transformStr = transformations.join(',')
  
  return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/${transformStr}/${filename}.jpg`
}

const getCityCode = (city: string): string => {
  const cityCodeMap: { [key: string]: string } = {
    'cluj-napoca': 'cj',
    'baia-mare': 'bm',
    'oradea': 'or'
  }
  return cityCodeMap[city] || city
}


const getApartmentImages = (city: string, apNumber: number, count: number = 5) => {
  const cityCode = getCityCode(city)
  return Array.from({ length: count }, (_, i) => 
    getCloudinaryUrl(`ap${apNumber}_${cityCode}_${i + 1}`, {
      width: 800,      
      quality: 85,     
      progressive: true 
    })
  )
}


const getAllApartmentImages = (city: string, apNumber: number) => {
  const imageCountMap: { [key: string]: number } = {
    'cluj-napoca-1': 28,
    'cluj-napoca-2': 27,
    'cluj-napoca-3': 30,
    'cluj-napoca-4': 26,
    'cluj-napoca-5': 24,
    'cluj-napoca-6': 30,
    'cluj-napoca-7': 23,
    'cluj-napoca-8': 25,
    'cluj-napoca-9': 31,
    'baia-mare-1': 15,
    'baia-mare-2': 17,
    'baia-mare-3': 18,
    'baia-mare-4': 20,
    'baia-mare-5': 16,
    'baia-mare-6': 19,
    'baia-mare-7': 21,
    'baia-mare-8': 14,
    'baia-mare-9': 22,
    'baia-mare-10': 18,
    'baia-mare-11': 20,
    'baia-mare-12': 16,
    'baia-mare-13': 23,
    'oradea-1': 34,
    'oradea-2': 32,
  }
  
  const key = `${city}-${apNumber}`
  const totalImages = imageCountMap[key] || 5
  const cityCode = getCityCode(city)
  
  return Array.from({ length: totalImages }, (_, i) => 
    getCloudinaryUrl(`ap${apNumber}_${cityCode}_${i + 1}`, {
      width: 2560,      
      quality: 92,     
      progressive: true 
    })
  )
}

export async function getStayListings() {
  // Try to fetch from backend first
  const backendListings = await fetchApartmentsFromBackend()
  if (backendListings.length > 0) {
    return backendListings
  }

  // Fallback to mock data if backend is not available
  return [
    {
      id: 'stay-listing://cluj-1',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 1',
      handle: 'cluj-napoca-apartment-1',
      description: 'Beautiful apartment in the heart of Cluj-Napoca',
      featuredImage: getApartmentImages('cluj-napoca', 1)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 1),
      like: false,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.8,
      reviewCount: 28,
      price: '$60',
      maxGuests: 4,
      bedrooms: 2,
      bathrooms: 1,
      beds: 2,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-2',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 2',
      handle: 'cluj-napoca-apartment-2',
      description: 'Cozy apartment with modern amenities',
      featuredImage: getApartmentImages('cluj-napoca', 2)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 2),
      like: false,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.5,
      reviewCount: 45,
      price: '$55',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-3',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 3',
      handle: 'cluj-napoca-apartment-3',
      description: 'Spacious apartment near city center',
      featuredImage: getApartmentImages('cluj-napoca', 3)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 3),
      like: true,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.9,
      reviewCount: 67,
      price: '$70',
      maxGuests: 5,
      beds: 3,
      bedrooms: 2,
      bathrooms: 2,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-4',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 4',
      handle: 'cluj-napoca-apartment-4',
      description: 'Stylish apartment with great view',
      featuredImage: getApartmentImages('cluj-napoca', 4)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 4),
      like: false,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.7,
      reviewCount: 34,
      price: '$65',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-5',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 5',
      handle: 'cluj-napoca-apartment-5',
      description: 'Comfortable apartment in quiet area',
      featuredImage: getApartmentImages('cluj-napoca', 5)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 5),
      like: false,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.6,
      reviewCount: 23,
      price: '$58',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-6',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 6',
      handle: 'cluj-napoca-apartment-6',
      description: 'Newly renovated apartment',
      featuredImage: getApartmentImages('cluj-napoca', 6)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 6),
      like: true,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.8,
      reviewCount: 56,
      price: '$62',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-7',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 7',
      handle: 'cluj-napoca-apartment-7',
      description: 'Bright and airy apartment',
      featuredImage: getApartmentImages('cluj-napoca', 7)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 7),
      like: false,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.7,
      reviewCount: 41,
      price: '$64',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-8',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 8',
      handle: 'cluj-napoca-apartment-8',
      description: 'Perfect for business travelers',
      featuredImage: getApartmentImages('cluj-napoca', 8)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 8),
      like: false,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.6,
      reviewCount: 38,
      price: '$59',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://cluj-9',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Modern Apartment Cluj-Napoca 9',
      handle: 'cluj-napoca-apartment-9',
      description: 'Charming apartment with balcony',
      featuredImage: getApartmentImages('cluj-napoca', 9)[0],
      galleryImgs: getApartmentImages('cluj-napoca', 9),
      like: true,
      address: 'Cluj-Napoca, Romania',
      reviewStart: 4.9,
      reviewCount: 72,
      price: '$68',
      maxGuests: 5,
      beds: 3,
      bedrooms: 2,
      bathrooms: 2,
      categoryHandle: 'cluj-napoca',
      saleOff: null,
      isAds: null,
      map: { lat: 46.7712, lng: 23.6236 },
    },
    {
      id: 'stay-listing://baia-1',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 1',
      handle: 'baia-mare-apartment-1',
      description: 'Beautiful apartment in Baia Mare',
      featuredImage: getApartmentImages('baia-mare', 1)[0],
      galleryImgs: getApartmentImages('baia-mare', 1),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.7,
      reviewCount: 32,
      price: '$45',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-2',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 2',
      handle: 'baia-mare-apartment-2',
      description: 'Modern apartment near center',
      featuredImage: getApartmentImages('baia-mare', 2)[0],
      galleryImgs: getApartmentImages('baia-mare', 2),
      like: true,
      address: 'Baia Mare, Romania',
      reviewStart: 4.8,
      reviewCount: 45,
      price: '$48',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-3',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 3',
      handle: 'baia-mare-apartment-3',
      description: 'Spacious and comfortable',
      featuredImage: getApartmentImages('baia-mare', 3)[0],
      galleryImgs: getApartmentImages('baia-mare', 3),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.6,
      reviewCount: 28,
      price: '$43',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-4',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 4',
      handle: 'baia-mare-apartment-4',
      description: 'Perfect for families',
      featuredImage: getApartmentImages('baia-mare', 4)[0],
      galleryImgs: getApartmentImages('baia-mare', 4),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.7,
      reviewCount: 51,
      price: '$50',
      maxGuests: 5,
      beds: 3,
      bedrooms: 2,
      bathrooms: 2,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-5',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 5',
      handle: 'baia-mare-apartment-5',
      description: 'Quiet and relaxing atmosphere',
      featuredImage: getApartmentImages('baia-mare', 5)[0],
      galleryImgs: getApartmentImages('baia-mare', 5),
      like: true,
      address: 'Baia Mare, Romania',
      reviewStart: 4.9,
      reviewCount: 63,
      price: '$46',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-6',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 6',
      handle: 'baia-mare-apartment-6',
      description: 'Recently renovated apartment',
      featuredImage: getApartmentImages('baia-mare', 6)[0],
      galleryImgs: getApartmentImages('baia-mare', 6),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.5,
      reviewCount: 37,
      price: '$44',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-7',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 7',
      handle: 'baia-mare-apartment-7',
      description: 'Central location apartment',
      featuredImage: getApartmentImages('baia-mare', 7)[0],
      galleryImgs: getApartmentImages('baia-mare', 7),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.7,
      reviewCount: 42,
      price: '$47',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-8',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 8',
      handle: 'baia-mare-apartment-8',
      description: 'Affordable and comfortable',
      featuredImage: getApartmentImages('baia-mare', 8)[0],
      galleryImgs: getApartmentImages('baia-mare', 8),
      like: true,
      address: 'Baia Mare, Romania',
      reviewStart: 4.6,
      reviewCount: 34,
      price: '$42',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-9',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 9',
      handle: 'baia-mare-apartment-9',
      description: 'Great for short stays',
      featuredImage: getApartmentImages('baia-mare', 9)[0],
      galleryImgs: getApartmentImages('baia-mare', 9),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.8,
      reviewCount: 48,
      price: '$49',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-10',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 10',
      handle: 'baia-mare-apartment-10',
      description: 'Stylish and modern',
      featuredImage: getApartmentImages('baia-mare', 10)[0],
      galleryImgs: getApartmentImages('baia-mare', 10),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.7,
      reviewCount: 39,
      price: '$45',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-11',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 11',
      handle: 'baia-mare-apartment-11',
      description: 'Excellent value for money',
      featuredImage: getApartmentImages('baia-mare', 11)[0],
      galleryImgs: getApartmentImages('baia-mare', 11),
      like: true,
      address: 'Baia Mare, Romania',
      reviewStart: 4.8,
      reviewCount: 55,
      price: '$46',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-12',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 12',
      handle: 'baia-mare-apartment-12',
      description: 'Perfect location apartment',
      featuredImage: getApartmentImages('baia-mare', 12)[0],
      galleryImgs: getApartmentImages('baia-mare', 12),
      like: false,
      address: 'Baia Mare, Romania',
      reviewStart: 4.6,
      reviewCount: 31,
      price: '$44',
      maxGuests: 3,
      beds: 2,
      bedrooms: 1,
      bathrooms: 1,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://baia-13',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Cozy Apartment Baia Mare 13',
      handle: 'baia-mare-apartment-13',
      description: 'Beautiful mountain view apartment',
      featuredImage: getApartmentImages('baia-mare', 13)[0],
      galleryImgs: getApartmentImages('baia-mare', 13),
      like: true,
      address: 'Baia Mare, Romania',
      reviewStart: 4.9,
      reviewCount: 68,
      price: '$51',
      maxGuests: 5,
      beds: 3,
      bedrooms: 2,
      bathrooms: 2,
      categoryHandle: 'baia-mare',
      saleOff: null,
      isAds: null,
      map: { lat: 47.6567, lng: 23.5683 },
    },
    {
      id: 'stay-listing://oradea-1',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Elegant Apartment Oradea 1',
      handle: 'oradea-apartment-1',
      description: 'Luxurious apartment in Oradea',
      featuredImage: getApartmentImages('oradea', 1)[0],
      galleryImgs: getApartmentImages('oradea', 1),
      like: false,
      address: 'Oradea, Romania',
      reviewStart: 4.8,
      reviewCount: 52,
      price: '$55',
      maxGuests: 4,
      beds: 2,
      bedrooms: 2,
      bathrooms: 1,
      categoryHandle: 'oradea',
      saleOff: null,
      isAds: null,
      map: { lat: 47.0465, lng: 21.9189 },
    },
    {
      id: 'stay-listing://oradea-2',
      date: 'October 10, 2025',
      listingCategory: 'Entire apartment',
      title: 'Elegant Apartment Oradea 2',
      handle: 'oradea-apartment-2',
      description: 'Stunning apartment with city views',
      featuredImage: getApartmentImages('oradea', 2)[0],
      galleryImgs: getApartmentImages('oradea', 2),
      like: true,
      address: 'Oradea, Romania',
      reviewStart: 4.9,
      reviewCount: 74,
      price: '$58',
      maxGuests: 5,
      beds: 3,
      bedrooms: 2,
      bathrooms: 2,
      categoryHandle: 'oradea',
      saleOff: null,
      isAds: null,
      map: { lat: 47.0465, lng: 21.9189 },
    },
  ]
}

export const getStayListingsByCategory = async (categoryHandle?: string) => {
  // Try to fetch from backend first
  const backendListings = await fetchApartmentsByCategory(categoryHandle)
  if (backendListings.length > 0) {
    return backendListings
  }

  // Fallback to mock data
  const listings = await getStayListings()
  
  if (!categoryHandle || categoryHandle === 'all') {
    return listings
  }
  
  return listings.filter((listing) => listing.categoryHandle === categoryHandle)
}

export const getStayListingByHandle = async (handle: string) => {
  // Try to fetch from backend first
  const backendListing = await fetchApartmentByHandle(handle)
  if (backendListing) {
    // Add host info (mock for now, can be added to backend later)
    return {
      ...backendListing,
      host: {
        displayName: 'Jane Smith',
        handle: 'jane-smith',
        description:
          'Providing lake views, The Symphony 9 Tam Coc in Ninh Binh provides accommodation, an outdoor swimming pool, a bar, a shared lounge, a garden and barbecue facilities.',
        listingsCount: 5,
        reviewsCount: 120,
        rating: 4.8,
        responseRate: 95,
        responseTime: 'within an hour',
        isSuperhost: true,
        isVerified: true,
        joinedDate: 'March 2024',
      },
    }
  }

  // Fallback to mock data
  const listings = await getStayListings()
  let listing = listings.find((listing) => listing.handle === handle)
  if (!listing?.id) {
    listing = listings[0]
  }

  const parts = listing.handle.split('-')
  const apNumber = parseInt(parts[parts.length - 1])
  const city = parts.slice(0, -2).join('-')

  return {
    ...(listing || {}),
    galleryImgs: getAllApartmentImages(city, apNumber),
    host: {
      displayName: 'Jane Smith',
      handle: 'jane-smith',
      description:
        'Providing lake views, The Symphony 9 Tam Coc in Ninh Binh provides accommodation, an outdoor swimming pool, a bar, a shared lounge, a garden and barbecue facilities.',
      listingsCount: 5,
      reviewsCount: 120,
      rating: 4.8,
      responseRate: 95,
      responseTime: 'within an hour',
      isSuperhost: true,
      isVerified: true,
      joinedDate: 'March 2024',
    },
  }
}

export type TStayListing = Awaited<ReturnType<typeof getStayListings>>[number]

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