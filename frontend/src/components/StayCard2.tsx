'use client'
import GallerySlider from '@/components/GallerySlider'
import { useCurrency } from '@/context/CurrencyContext'
import { Listing } from '@/services/listings'
import { useT } from '@/hooks/useT'
import { Badge } from '@/shared/Badge'
import { Location06Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { FC, useMemo } from 'react'

interface StayCard2Props {
  className?: string
  data: Listing
  size?: 'default' | 'small'
}

const StayCard2: FC<StayCard2Props> = ({ size = 'default', className = '', data }) => {
  const T = useT()
  const { currency, convert } = useCurrency()
  const searchParams = useSearchParams()

  const {
    galleryImgs,
    listingCategory,
    address,
    title,
    bedrooms,
    handle: listingHandle,
    price,
    id,
    overrideTotalPrice,
    overrideCurrency,
    sourceCurrency: listingCurrency,
  } = data

  // Păstrează parametrii URL când navighează la detalii
  const listingHref = useMemo(() => {
    const baseUrl = `/stay-listings/${listingHandle}`
    const params = new URLSearchParams()
    
    // Păstrează parametrii relevanți din URL
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    const guestAdults = searchParams.get('guestAdults')
    const guestChildren = searchParams.get('guestChildren')
    const guestRooms = searchParams.get('guestRooms')
    
    if (checkin) params.set('checkin', checkin)
    if (checkout) params.set('checkout', checkout)
    if (guestAdults) params.set('guestAdults', guestAdults)
    if (guestChildren) params.set('guestChildren', guestChildren)
    if (guestRooms) params.set('guestRooms', guestRooms)
    
    const queryString = params.toString()
    return queryString ? `${baseUrl}?${queryString}` : baseUrl
  }, [listingHandle, searchParams])
  
  const numericPrice = Number(String(price).replace(/[^0-9.]/g, ''))
  
  // Calculează numărul de nopți din datele selectate
  const checkin = searchParams.get('checkin')
  const checkout = searchParams.get('checkout')
  
  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0
    try {
      const startDate = new Date(checkin + 'T00:00:00')
      const endDate = new Date(checkout + 'T00:00:00')
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 1 ? diffDays : 0
    } catch {
      return 0
    }
  }, [checkin, checkout])
  
  // Calculează prețul: dacă avem override total, folosim direct; altfel basePrice × nights
  const hasDateRange = nights > 0
  const hasOverride = overrideTotalPrice !== undefined && overrideTotalPrice > 0 && hasDateRange
  const displayPrice = hasOverride
    ? overrideTotalPrice
    : (hasDateRange ? numericPrice * nights : numericPrice)
  const sourceCurrency = hasOverride ? (overrideCurrency || 'RON') : (listingCurrency || 'RON')
  const convertedPrice = convert(displayPrice, sourceCurrency, currency)

  // Limităm la primele 5 poze
  const limitedGalleryImgs = galleryImgs?.slice(0, 5) || []

  const renderSliderGallery = () => {
    return (
      <div className="relative w-full">
        <GallerySlider ratioClass="aspect-w-12 aspect-h-11" galleryImgs={limitedGalleryImgs} href={listingHref} />
      </div>
    )
  }

  const renderContent = () => {
    return (
      <div className={clsx(size === 'default' ? 'mt-3 gap-y-3' : 'mt-2 gap-y-2', 'flex flex-col h-full')}>
        <div className="flex flex-col gap-y-2 flex-1">
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {T.ListingPage[listingCategory as keyof typeof T.ListingPage] || listingCategory} · {bedrooms} {T.ListingPage.beds}
          </span>
          <div className="flex items-center gap-x-2">
            <h2 className={`text-base font-semibold text-neutral-900 capitalize dark:text-white`}>
              <span className="line-clamp-1">{title}</span>
            </h2>
          </div>
          <div className="flex items-center gap-x-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {size === 'default' && (
              <HugeiconsIcon
                className="mb-0.5"
                icon={Location06Icon}
                size={16}
                color="currentColor"
                strokeWidth={1.5}
              />
            )}
            <span className="line-clamp-2">{address}</span>
          </div>
        </div>
        <div className="w-14 border-b border-neutral-100 dark:border-neutral-800"></div>
        <div className="flex items-end justify-between gap-2 mt-auto">
          <div>
            <span className="text-base font-semibold">
              {convertedPrice.toFixed(2)} {currency}
            </span>
            {size === 'default' && (
              hasDateRange ? (
                <span className="ml-1 text-sm font-normal text-neutral-500 dark:text-neutral-400">
                  ({nights} {nights === 1 ? T.common.night : (T.common.nights || 'nopți')})
                </span>
              ) : (
                <>
                  <span className="mx-1 text-sm font-light text-neutral-400 dark:text-neutral-500">/</span>
                  <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">
                    {T['common']['night']}
                  </span>
                </>
              )
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`group relative flex flex-col ${className}`}>
      {renderSliderGallery()}
      <Link href={listingHref} className="flex flex-col flex-1">
        {renderContent()}
      </Link>
    </div>
  )
}

export default StayCard2
