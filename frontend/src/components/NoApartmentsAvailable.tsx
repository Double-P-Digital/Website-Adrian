'use client'

import { useT } from '@/hooks/useT'
import { CalendarIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

interface NoApartmentsAvailableProps {
  hasDateFilter?: boolean
  categoryHandle?: string
}

export default function NoApartmentsAvailable({ hasDateFilter, categoryHandle = 'all' }: NoApartmentsAvailableProps) {
  const T = useT()
  const searchParams = useSearchParams()
  
  // Build URL without date filters
  const getUrlWithoutDates = () => {
    const params = new URLSearchParams()
    
    // Keep other filters but remove dates
    const city = searchParams.get('city')
    const guests = searchParams.get('guests')
    const priceMin = searchParams.get('price_min')
    const priceMax = searchParams.get('price_max')
    const bedrooms = searchParams.get('bedrooms')
    const bathrooms = searchParams.get('bathrooms')
    
    if (city) params.set('city', city)
    if (guests) params.set('guests', guests)
    if (priceMin) params.set('price_min', priceMin)
    if (priceMax) params.set('price_max', priceMax)
    if (bedrooms) params.set('bedrooms', bedrooms)
    if (bathrooms) params.set('bathrooms', bathrooms)
    
    const paramString = params.toString()
    return `/stay-categories/${categoryHandle}${paramString ? `?${paramString}` : ''}`
  }

  const noApartmentsText = T.NoApartments?.['No apartments available'] || 'Nu sunt apartamente disponibile'
  const forSelectedDatesText = T.NoApartments?.['for the selected dates'] || 'pentru datele selectate'
  const tryDifferentDatesText = T.NoApartments?.['Try selecting different dates'] || 'Încercați să selectați alte date'
  const orText = T.NoApartments?.['or'] || 'sau'
  const viewAllApartmentsText = T.NoApartments?.['View all apartments'] || 'Vedeți toate apartamentele'
  const noApartmentsFoundText = T.NoApartments?.['No apartments found'] || 'Nu au fost găsite apartamente'
  const tryDifferentFiltersText = T.NoApartments?.['Try adjusting your filters'] || 'Încercați să ajustați filtrele'
  
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800">
        {hasDateFilter ? (
          <CalendarIcon className="h-10 w-10 text-neutral-400" />
        ) : (
          <MagnifyingGlassIcon className="h-10 w-10 text-neutral-400" />
        )}
      </div>
      
      {hasDateFilter ? (
        <>
          <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
            {noApartmentsText}
          </h3>
          <p className="mb-6 max-w-md text-neutral-500 dark:text-neutral-400">
            {forSelectedDatesText}. {tryDifferentDatesText} {orText.toLowerCase()}:
          </p>
          <Link
            href={getUrlWithoutDates()}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <CalendarIcon className="h-5 w-5" />
            {viewAllApartmentsText}
          </Link>
        </>
      ) : (
        <>
          <h3 className="mb-2 text-xl font-semibold text-neutral-900 dark:text-white">
            {noApartmentsFoundText}
          </h3>
          <p className="mb-6 max-w-md text-neutral-500 dark:text-neutral-400">
            {tryDifferentFiltersText}
          </p>
          <Link
            href={`/stay-categories/${categoryHandle}`}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-700"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            {viewAllApartmentsText}
          </Link>
        </>
      )}
    </div>
  )
}

