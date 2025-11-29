'use client'

import { useT } from '@/hooks/useT'
import { UsersIcon } from '@heroicons/react/24/outline'
import {
  Bathtub02Icon,
  BedSingle01Icon,
  MeetingRoomIcon,
} from '@/components/Icons'
import SectionHeader from '../../components/SectionHeader'

interface ListingHeaderClientProps {
  address: string
  listingCategory: string
  title: string
  maxGuests: number
  beds: number
  bathrooms: number
  bedrooms: number
}

export default function ListingHeaderClient({
  address,
  listingCategory,
  title,
  maxGuests,
  beds,
  bathrooms,
  bedrooms,
}: ListingHeaderClientProps) {
  const T = useT()

  return (
    <SectionHeader address={address} listingCategory={listingCategory} title={title}>
      <div className="flex items-center gap-x-3">
        <UsersIcon className="mb-0.5 size-6" />
        <span>{maxGuests} {T.ListingPage.guests}</span>
      </div>
      <div className="flex items-center gap-x-3">
        <BedSingle01Icon className="mb-0.5 size-6" />
        <span>{beds} {T.ListingPage.beds}</span>
      </div>
      <div className="flex items-center gap-x-3">
        <Bathtub02Icon className="mb-0.5 size-6" />
        <span>{bathrooms} {T.ListingPage.baths}</span>
      </div>
      <div className="flex items-center gap-x-3">
        <MeetingRoomIcon className="mb-0.5 size-6" />
        <span>{bedrooms} {T.ListingPage.bedrooms}</span>
      </div>
    </SectionHeader>
  )
}

