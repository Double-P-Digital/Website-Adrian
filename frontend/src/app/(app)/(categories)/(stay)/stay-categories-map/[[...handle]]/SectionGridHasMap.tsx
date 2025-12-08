'use client'

import ListingFilterTabs from '@/components/ListingFilterTabs'
import StayCard2 from '@/components/StayCard2'
import { Category } from '@/services/categories'
import { getListingFilterOptions, Listing } from '@/services/listings'
import { Divider } from '@/shared/divider'
import convertNumbThousand from '@/utils/convertNumbThousand'
import clsx from 'clsx'
import { FC, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import MapFixedSection from '../../../MapFixedSection'

interface Props {
  className?: string
  listings: Listing[]
  category: Category
  filterOptions: Awaited<ReturnType<typeof getListingFilterOptions>>
}

const SectionGridHasMap: FC<Props> = ({ className, listings, category, filterOptions }) => {
  const [currentHoverID, setCurrentHoverID] = useState<string>('')
  const [selectedListingId, setSelectedListingId] = useState<string>('')
  const searchParams = useSearchParams()
  
  // Citește listingId din URL pentru a centra harta
  useEffect(() => {
    const listingIdFromUrl = searchParams.get('listingId')
    if (listingIdFromUrl) {
      setSelectedListingId(listingIdFromUrl)
    }
  }, [searchParams])

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
              onMouseEnter={() => {
                // Când mouse-ul este peste card, centrează harta pe el
                setCurrentHoverID(listing.id)
                setSelectedListingId(listing.id)
                // Actualizează URL-ul cu listingId fără să reîncărci pagina
                const params = new URLSearchParams(searchParams.toString())
                params.set('listingId', listing.id)
                window.history.pushState({}, '', `${window.location.pathname}?${params.toString()}`)
              }}
              onMouseLeave={() => {
                // Când mouse-ul părăsește card-ul, păstrează selecția dar resetează hover
                setCurrentHoverID('')
              }}
            >
              <StayCard2 data={listing} />
            </div>
          ))}
        </div>
      </div>

      <MapFixedSection
        closeButtonHref={(() => {
          // Construiește URL-ul pentru înapoi păstrând toate filtrele din URL (fără listingId)
          const baseUrl = `/stay-categories/${category.handle}`
          const params = new URLSearchParams()
          searchParams.forEach((value, key) => {
            // Nu include listingId în URL-ul de înapoi
            if (key !== 'listingId') {
              params.append(key, value)
            }
          })
          const queryString = params.toString()
          return queryString ? `${baseUrl}?${queryString}#heading` : `${baseUrl}#heading`
        })()}
        currentHoverID={selectedListingId || currentHoverID}
        listings={listings}
        listingType="Stays"
      />
    </div>
  )
}

export default SectionGridHasMap
