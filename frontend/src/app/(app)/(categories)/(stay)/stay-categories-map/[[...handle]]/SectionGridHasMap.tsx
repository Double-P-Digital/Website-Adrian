'use client'

import ListingFilterTabs from '@/components/ListingFilterTabs'
import StayCard2 from '@/components/StayCard2'
import PaginationComponent from '@/components/PaginationComponent'
import { TStayCategory } from '@/data/categories'
import { getStayListingFilterOptions, TStayListing } from '@/data/listings'
import { Divider } from '@/shared/divider'
import convertNumbThousand from '@/utils/convertNumbThousand'
import clsx from 'clsx'
import { FC, useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import MapFixedSection from '../../../MapFixedSection'

interface Props {
  className?: string
  listings: TStayListing[]
  category: TStayCategory
  filterOptions: Awaited<ReturnType<typeof getStayListingFilterOptions>>
}

const SectionGridHasMap: FC<Props> = ({ className, listings: allListings, category, filterOptions }) => {
  const [currentHoverID, setCurrentHoverID] = useState<string>('')
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 12
  
  // Paginare cu useMemo pentru performance
  const { listings, totalItems } = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return {
      listings: allListings.slice(startIndex, endIndex),
      totalItems: allListings.length
    }
  }, [allListings, currentPage, itemsPerPage])

  return (
    <div className={clsx('relative flex min-h-screen gap-6', className)}>
      <div className="flex w-full flex-1/2 flex-col gap-y-8 pt-8 pb-20">
        <h1 id="heading" className="text-lg font-semibold sm:text-xl">
          Over {convertNumbThousand(category.count)} places
          {category.handle !== 'all' ? ` in ${category.name}` : null}
        </h1>
        <ListingFilterTabs filterOptions={filterOptions} />
        <Divider />
        <div className="grid grid-cols-1 gap-x-5 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 2xl:gap-x-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              onMouseEnter={() => setCurrentHoverID(listing.id)}
              onMouseLeave={() => setCurrentHoverID('')}
            >
              <StayCard2 data={listing} />
            </div>
          ))}
        </div>
        <div className="mt-16 flex items-center">
          <PaginationComponent totalItems={totalItems} itemsPerPage={itemsPerPage} />
        </div>
      </div>

      <MapFixedSection
        closeButtonHref={`/stay-categories/${category.handle}#heading`}
        currentHoverID={currentHoverID}
        listings={allListings}
        listingType="Stays"
      />
    </div>
  )
}

export default SectionGridHasMap
