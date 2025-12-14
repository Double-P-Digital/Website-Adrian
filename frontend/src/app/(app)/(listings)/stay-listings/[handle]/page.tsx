import { getListingByHandle } from '@/services/listings'
import ReserveButton from './ReserveButton'
import { Divider } from '@/shared/divider'
import { Metadata } from 'next'
import Form from 'next/form'
import { redirect } from 'next/navigation'
import DatesRangeInputPopover from '../../components/DatesRangeInputPopover'
import GuestsDisplay from '../../components/GuestsDisplay'
import HeaderGallery from '../../components/HeaderGallery'
import SectionDateRange from '../../components/SectionDateRange'
import SidebarPriceAndFormWrapper from './SidebarPriceAndFormWrapper'
import SectionMap from '../../components/SectionMap'
import ListingHeaderClient from './ListingHeaderClient'
import ListingInfoClient from './ListingInfoClient'
import SidebarBookingSummary from './SidebarBookingSummary'
import SectionAmenities from './SectionAmenities'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const listing = await getListingByHandle(handle)

  if (!listing) {
    return {
      title: 'Listing not found',
      description: 'The listing you are looking for does not exist.',
    }
  }

  return {
    title: listing?.title,
    description: listing?.descriptionRo || listing?.descriptionEn || '',
  }
}

const Page = async ({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ handle: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const { handle } = await params
  const urlSearchParams = await searchParams
  const listing = await getListingByHandle(handle)
  
  // Extract dates from URL if available
  const checkin = typeof urlSearchParams.checkin === 'string' ? urlSearchParams.checkin : undefined
  const checkout = typeof urlSearchParams.checkout === 'string' ? urlSearchParams.checkout : undefined

  if (!listing?.id) {
    return redirect('/stay-categories/all')
  }

  const {
    address,
    bathrooms,
    bedrooms,
    descriptionRo,
    descriptionEn,
    galleryImgs,
    listingCategory,
    map,
    maxGuests,
    price,
    title,
    beds,
  } = listing

  const numericPrice = Number(listing.price.replace(/[^0-9.-]+/g, ''))

  // Server action to handle form submission
  const handleSubmitForm = async (formData: FormData) => {
    'use server'
  }

  const renderSectionHeader = () => {
    return (
      <ListingHeaderClient
        address={address}
        listingCategory={listingCategory}
        title={title}
        maxGuests={maxGuests}
        beds={beds}
        bathrooms={bathrooms}
        bedrooms={bedrooms}
      />
    )
  }

  const renderSectionInfo = () => {
    return <ListingInfoClient descriptionRo={descriptionRo} descriptionEn={descriptionEn} />
  }


  const renderSidebarPriceAndForm = () => {
    return (
      <div className="listingSection__wrap sm:shadow-xl">
        {/* PRICE */}
        <div className="flex items-end text-2xl font-semibold sm:text-3xl">
          <SidebarPriceAndFormWrapper price={price} />
        </div>

        {/* FORM */}
        <Form
          action={handleSubmitForm}
          className="flex flex-col rounded-3xl border border-neutral-200 dark:border-neutral-700"
          id="booking-form"
        >
          <DatesRangeInputPopover 
            className="z-11 flex-1" 
            defaultStartDate={checkin ? new Date(checkin) : null}
            defaultEndDate={checkout ? new Date(checkout) : null}
          />
          <div className="w-full border-b border-neutral-200 dark:border-neutral-700"></div>
          <GuestsDisplay 
            className="flex-1"
            maxGuests={maxGuests}
          />
        </Form>

        {/* Calculare dinamică pe baza datelor selectate */}
        <SidebarBookingSummary pricePerNight={price} />

        <ReserveButton price={numericPrice} apartmentId={listing.id} />
      </div>
    )
  }

  return (
    <div>
      {/*  HEADER */}
      <HeaderGallery images={galleryImgs} />

      {/* MAIN */}
      <main className="relative z-[1] mt-10 flex flex-col gap-8 lg:flex-row xl:gap-10">
        {/* CONTENT */}
        <div className="flex w-full flex-col gap-y-8 lg:w-3/5 xl:w-[64%] xl:gap-y-10">
          {renderSectionHeader()}
          {renderSectionInfo()}
          <SectionAmenities amenities={listing.amenities || []} />
          <SectionDateRange 
            defaultStartDate={checkin ? new Date(checkin) : null} 
            defaultEndDate={checkout ? new Date(checkout) : null} 
          />
        </div>

        {/* SIDEBAR */}
        <div className="grow">
          <div className="sticky top-5">{renderSidebarPriceAndForm()}</div>
        </div>
      </main>

      <Divider className="my-16" />

      <div className="flex flex-col gap-y-10">
        {/* ✅ FOLOSEȘTE map și address din backend */}
        <SectionMap address={address} lat={map.lat} lng={map.lng} />
      </div>
    </div>
  )
}

export default Page