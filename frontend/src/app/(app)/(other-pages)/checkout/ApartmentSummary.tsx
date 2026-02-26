'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { getApartmentForCheckout, type ApartmentForCheckout } from '@/services/apartments'
import { sanitizeImageUrl } from '@/utils/imageUtils'
import { useCurrency } from '@/context/CurrencyContext'

interface Apartment {
  id: string
  name: string
  address: string
  price: number
  images: string[]
  handle: string
}

interface ApartmentSummaryProps {
  apartmentId: string
  overridePricePerNight?: number
  overrideCurrency?: string
}

export default function ApartmentSummary({ apartmentId, overridePricePerNight, overrideCurrency }: ApartmentSummaryProps) {
  const { currency, convert } = useCurrency()
  const [apartment, setApartment] = useState<Apartment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!apartmentId) {
      setLoading(false)
      setError('ID apartament lipsește')
      return
    }

    if (apartmentId.startsWith('stay-listing://')) {
      setLoading(false)
      setError('Vă rugăm să selectați un apartament valid din backend')
      return
    }

    if (!/^[0-9a-fA-F]{24}$/.test(apartmentId)) {
      setLoading(false)
      setError('ID apartament invalid')
      return
    }

    const fetchApartment = async () => {
      try {
        const data = await getApartmentForCheckout(apartmentId)
        
        if (!data) {
          // Nu aruncăm eroare - doar setăm error state pentru UI
          setError('Apartamentul nu a fost găsit')
          setLoading(false)
          return
        }
        
        const mappedApartment: Apartment = {
          id: data.id,
          name: data.name,
          address: data.address || '',
          price: data.price || 0,
          images: data.images || [],
          handle: data.handle,
        }
        
        setApartment(mappedApartment)
        setError(null)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Eroare la încărcarea apartamentului')
      } finally {
        setLoading(false)
      }
    }

    fetchApartment()
  }, [apartmentId])

  if (loading) {
    return (
      <div className="mb-6 animate-pulse rounded-2xl border border-neutral-200 p-4 dark:border-neutral-700">
        <div className="h-48 w-full rounded-xl bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="mt-4 h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700"></div>
        <div className="mt-2 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="mb-6 rounded-2xl border-2 border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/20">
        <p className="font-semibold text-red-800 dark:text-red-200">⚠️ Eroare</p>
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      </div>
    )
  }

  if (!apartment) {
    return (
      <div className="mb-6 rounded-2xl border-2 border-yellow-200 bg-yellow-50 p-6 dark:border-yellow-800 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-700 dark:text-yellow-300">
          Apartamentul nu a fost găsit.
        </p>
      </div>
    )
  }

  const imageUrl = sanitizeImageUrl(
    apartment.images && apartment.images.length > 0 ? apartment.images[0] : null,
    '/images/placeholder.jpg'
  )

  const apartmentLink = `/stay-listings/${apartment.handle}`

  return (
    <div className="mb-6">
      <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
        <Link href={apartmentLink} className="group block">
          {/* IMAGINE APARTAMENT */}
          <div className="relative h-52 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
            <Image
              src={imageUrl}
              alt={apartment.name}
              fill
              priority
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 400px"
              unoptimized={true}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = 'https://via.placeholder.com/400x300/e5e7eb/6b7280?text=Image+Error'
              }}
            />
          </div>

          {/* INFO APARTAMENT */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-neutral-900 transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {apartment.name}
            </h3>
            
            {apartment.address && (
              <p className="mt-2 flex items-center gap-1 text-sm text-neutral-600 dark:text-neutral-400">
                <span>📍</span>
                {apartment.address}
              </p>
            )}
            
            <p className="mt-3 text-2xl font-bold text-neutral-900 dark:text-white">
              {overridePricePerNight
                ? convert(overridePricePerNight, (overrideCurrency || 'RON') as 'RON' | 'EUR', currency).toFixed(2)
                : convert(apartment.price, 'RON', currency).toFixed(2)} {currency}{' '}
              <span className="text-base font-normal text-neutral-500 dark:text-neutral-400">/noapte</span>
            </p>
          </div>
        </Link>
      </div>
    </div>
  )
}