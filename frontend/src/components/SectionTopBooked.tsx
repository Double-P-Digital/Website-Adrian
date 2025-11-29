'use client'

import StayCard from '@/components/StayCard'
import { useT } from '@/hooks/useT'
import { Listing } from '@/services/listings'
import Heading from '@/shared/Heading'
import { FC } from 'react'

interface SectionTopBookedProps {
  apartments?: Listing[]
  className?: string
  title?: string
  subheading?: string
}

const SectionTopBooked: FC<SectionTopBookedProps> = ({
  apartments = [],
  className = '',
  title,
  subheading,
}) => {
  const T = useT()
  const defaultTitle = T.SectionTopBooked?.['Top Booked Apartments'] || 'Top Booked Apartments'
  const defaultSubheading = T.SectionTopBooked?.['Discover our most popular apartments, chosen by travelers like you.'] || 'Discover our most popular apartments, chosen by travelers like you.'
  
  const displayTitle = title || defaultTitle
  const displaySubheading = subheading || defaultSubheading
  if (!apartments || apartments.length === 0) {
    return null
  }

  return (
    <div className={`nc-SectionTopBooked ${className}`}>
      <Heading subheading={displaySubheading}>{displayTitle}</Heading>
      
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {apartments.map((apartment) => (
          <StayCard key={apartment.id} data={apartment} size="default" />
        ))}
      </div>
    </div>
  )
}

export default SectionTopBooked

