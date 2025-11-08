'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getStayListingByHandle, getStayListings } from '@/data/listings'

interface Apartment {
  id: string
  name: string
  address?: string
  featuredImage?: string
  images?: string[]
  price: number
  handle?: string
  title?: string
}

interface ApartmentSummaryProps {
  apartmentId: string
}

export default function ApartmentSummary({ apartmentId }: ApartmentSummaryProps) {
  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!apartmentId) {
      setLoading(false)
      return
    }

    const fetchApartment = async () => {
      try {
        // Dacă este ID mock (ex: stay-listing://cluj-1), folosește datele mock ca fallback
        if (apartmentId.startsWith('stay-listing://')) {
          // Extrage handle-ul din ID (ex: stay-listing://cluj-1 -> cluj-napoca-apartment-1)
          const idPart = apartmentId.replace('stay-listing://', '')
          // Încearcă să găsească listing-ul după handle sau după ID
          const listings = await getStayListings()
          let listing = listings.find((l) => l.id === apartmentId || l.handle?.includes(idPart))
          
          if (!listing) {
            // Dacă nu găsește, folosește primul listing disponibil
            listing = listings[0]
          }
          
          // Obține listing-ul complet cu galleryImgs
          const fullListing = await getStayListingByHandle(listing?.handle || 'cluj-napoca-apartment-1')
          
          if (fullListing) {
            // featuredImage poate fi string sau obiect cu src
            const featuredImg = typeof fullListing.featuredImage === 'string' 
              ? fullListing.featuredImage 
              : (fullListing.featuredImage as any)?.src || fullListing.featuredImage
            
            // galleryImgs este array de string-uri
            const images = Array.isArray(fullListing.galleryImgs) 
              ? fullListing.galleryImgs.map((img: any) => typeof img === 'string' ? img : img?.src || img)
              : []
            
            setApartment({
              id: fullListing.id,
              name: fullListing.title || 'Apartment',
              address: fullListing.address,
              featuredImage: featuredImg,
              images: images,
              price: Number(String(fullListing.price || '0').replace(/[^0-9.-]+/g, '')) || 0,
              handle: fullListing.handle,
            })
          }
          setLoading(false)
          return
        }

        // Pentru MongoDB ObjectId sau orice alt ID, face fetch la backend
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
        const API_KEY = process.env.NEXT_PUBLIC_API_KEY || ''

        const response = await fetch(`${API_BASE_URL}/api/apartments/${apartmentId}`, {
          headers: {
            'x-api-key': API_KEY,
          },
        })

        if (response.ok) {
          const data = await response.json()
          // Map backend data to frontend format
          setApartment({
            id: data.id,
            name: data.name,
            address: data.address,
            featuredImage: data.featuredImage || data.images?.[0],
            images: data.images || [],
            price: data.price || 0,
            handle: data.handle || data.id,
          })
        } else {
          console.warn(`Failed to fetch apartment ${apartmentId}: ${response.status}`)
        }
      } catch (error) {
        console.error('Error fetching apartment:', error)
        // Nu aruncă eroarea, doar loghează
      } finally {
        setLoading(false)
      }
    }

    fetchApartment()
  }, [apartmentId])

  if (loading) {
    return (
      <div className="mb-6 animate-pulse">
        <div className="h-32 w-full rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="mt-3 h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700"></div>
      </div>
    )
  }

  if (!apartment) {
    return null
  }

  const imageUrl = apartment.featuredImage || apartment.images?.[0] || '/images/placeholder.jpg'
  const apartmentLink = apartment.handle ? `/stay-listings/${apartment.handle}` : '#'

  return (
    <div className="mb-6 border-b border-neutral-200 pb-6 dark:border-neutral-700">
      <Link href={apartmentLink} className="group block">
        <div className="relative aspect-video w-full overflow-hidden rounded-lg">
          <Image
            src={imageUrl}
            alt={apartment.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
        </div>
        <h3 className="mt-3 text-lg font-semibold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
          {apartment.name}
        </h3>
        {apartment.address && (
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">{apartment.address}</p>
        )}
      </Link>
    </div>
  )
}

