'use client'

import StayCard from '@/components/StayCard'
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
  title = 'Top Booked Apartments',
  subheading = 'Discover our most popular apartments, chosen by travelers like you.',
}) => {
  if (!apartments || apartments.length === 0) {
    return null
  }

  return (
    <div className={`nc-SectionTopBooked ${className}`}>
      <Heading subheading={subheading}>{title}</Heading>
      
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {apartments.map((apartment) => (
          <StayCard key={apartment.id} data={apartment} size="default" />
        ))}
      </div>
    </div>
  )
}

export default SectionTopBooked

