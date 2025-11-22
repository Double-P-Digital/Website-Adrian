import SaleOffBadge from '@/components/SaleOffBadge'
import { Listing } from '@/services/listings'
import { Badge } from '@/shared/Badge'
import { Location06Icon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import Link from 'next/link'
import { FC } from 'react'
import GallerySlider from './GallerySlider'

interface StayCardProps {
  className?: string
  data: Listing
  size?: 'default' | 'small'
}

const StayCard: FC<StayCardProps> = ({ size = 'default', className = '', data }) => {
  const {
    galleryImgs,
    listingCategory,
    address,
    title,
    bedrooms,
    handle: listingHandle,
    discountCode,
    price,
  } = data
  
  // Show sale badge if discount code exists
  const saleOff = !!discountCode

  const listingHref = `/stay-listings/${listingHandle}`

  const renderSliderGallery = () => {
    return (
      <div className="relative w-full">
        <GallerySlider
          ratioClass="aspect-w-4 aspect-h-3 "
          galleryImgs={galleryImgs}
          href={listingHref}
          galleryClass={size === 'default' ? undefined : ''}
        />
        {saleOff && <SaleOffBadge className="absolute start-3 top-3" />}
      </div>
    )
  }

  const renderContent = () => {
    return (
      <div className={size === 'default' ? 'space-y-4 p-4' : 'space-y-1 p-3'}>
        <div className={size === 'default' ? 'space-y-2' : 'space-y-1'}>
          <span className="text-sm text-neutral-500 dark:text-neutral-400">
            {listingCategory} · {bedrooms} beds
          </span>
          <div className="flex items-center gap-x-2">
            <h2 className={`text-base font-semibold text-neutral-900 capitalize dark:text-white`}>
              <span className="line-clamp-1">{title}</span>
            </h2>
          </div>
          <div className="flex items-center gap-x-1.5 text-sm text-neutral-500 dark:text-neutral-400">
            {size === 'default' && (
              <HugeiconsIcon icon={Location06Icon} size={16} color="currentColor" strokeWidth={1.5} />
            )}
            {address}
          </div>
        </div>
        <div className="w-14 border-b border-neutral-100 dark:border-neutral-800"></div>
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">
            {price}
            {` `}
            {size === 'default' && (
              <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400">/night</span>
            )}
          </span>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`group relative bg-white dark:bg-neutral-900 ${
        size === 'default' ? 'border border-neutral-100 dark:border-neutral-800' : ''
      } overflow-hidden rounded-2xl transition-shadow hover:shadow-xl ${className}`}
    >
      {renderSliderGallery()}
      <Link href={listingHref}>{renderContent()}</Link>
    </div>
  )
}

export default StayCard
