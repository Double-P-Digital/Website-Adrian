import {
  Bathtub02Icon,
  BedSingle01Icon,
  BodySoapIcon,
  CableCarIcon,
  CctvCameraIcon,
  HairDryerIcon,
  MeetingRoomIcon,
  ShampooIcon,
  Speaker01Icon,
  TvSmartIcon,
  VirtualRealityVr01Icon,
  WaterEnergyIcon,
  WaterPoloIcon,
  Wifi01Icon,
} from '@/components/Icons'
import { getStayListingByHandle } from '@/data/listings'
import ReserveButton from './ReserveButton'

import ButtonSecondary from '@/shared/ButtonSecondary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import { UsersIcon } from '@heroicons/react/24/outline'
import { Metadata } from 'next'
import Form from 'next/form'
import { redirect } from 'next/navigation'
import DatesRangeInputPopover from '../../components/DatesRangeInputPopover'
import GuestsInputPopover from '../../components/GuestsInputPopover'
import HeaderGallery from '../../components/HeaderGallery'
import SectionDateRange from '../../components/SectionDateRange'
import SectionHeader from '../../components/SectionHeader'
import { SectionHeading, SectionSubheading } from '../../components/SectionHeading'
import SidebarPriceAndFormWrapper from './SidebarPriceAndFormWrapper'
import SectionMap from '../../components/SectionMap'

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const { handle } = await params
  const listing = await getStayListingByHandle(handle)

  if (!listing) {
    return {
      title: 'Listing not found',
      description: 'The listing you are looking for does not exist.',
    }
  }

  return {
    title: listing?.title,
    description: listing?.description,
  }
}

const Page = async ({ params }: { params: Promise<{ handle: string }> }) => {
  const { handle } = await params
  const listing = await getStayListingByHandle(handle)

  if (!listing?.id) {
    return redirect('/stay-categories/all')
  }

  const {
    address,
    bathrooms,
    bedrooms,
    description,
    galleryImgs,
    listingCategory,
    map,
    maxGuests,
    price,
    reviewCount,
    reviewStart,
    title,
    beds,
  } = listing

  const numericPrice = Number(listing.price.replace(/[^0-9.-]+/g, ''))

  // Server action to handle form submission
  const handleSubmitForm = async (formData: FormData) => {
    'use server'
    console.log('Form submitted with data:', Object.fromEntries(formData.entries()))
  }

  const renderSectionHeader = () => {
    return (
      <SectionHeader
        address={address}
        listingCategory={listingCategory}
        reviewCount={reviewCount}
        reviewStart={reviewStart}
        title={title}
      >
        <div className="flex items-center gap-x-3">
          <UsersIcon className="mb-0.5 size-6" />
          <span>{maxGuests} guests</span>
        </div>
        <div className="flex items-center gap-x-3">
          <BedSingle01Icon className="mb-0.5 size-6" />
          <span>{beds} beds</span>
        </div>
        <div className="flex items-center gap-x-3">
          <Bathtub02Icon className="mb-0.5 size-6" />
          <span>{bathrooms} baths</span>
        </div>
        <div className="flex items-center gap-x-3">
          <MeetingRoomIcon className="mb-0.5 size-6" />
          <span>{bedrooms} bedrooms</span>
        </div>
      </SectionHeader>
    )
  }

  const renderSectionInfo = () => {
    return (
      <div className="listingSection__wrap">
        <SectionHeading>Stay information</SectionHeading>
        
        {/* ✅ FOLOSEȘTE description din backend */}
        <div className="leading-relaxed text-neutral-700 dark:text-neutral-300">
          {description ? (
            <p className="whitespace-pre-line">{description}</p>
          ) : (
            <p>No description available for this property.</p>
          )}
        </div>

        {/* ❌ ȘTERS - Room Rates hardcodat (implementează când backend are pricing rules) */}
      </div>
    )
  }

  const renderSectionAmenities = () => {
    // ✅ Map amenities icons (poți extinde lista)
    const amenityIcons: { [key: string]: any } = {
      'WiFi': Wifi01Icon,
      'Fast wifi': Wifi01Icon,
      'Bathtub': Bathtub02Icon,
      'Hair dryer': HairDryerIcon,
      'Sound system': Speaker01Icon,
      'TV': TvSmartIcon,
      'Tv Smart': TvSmartIcon,
      'Kitchen': MeetingRoomIcon,
      'Parking': CableCarIcon,
      'Heating': WaterEnergyIcon,
      'AC': WaterEnergyIcon,
    }

    // ✅ FOLOSEȘTE amenities din backend (dacă există în listing)
    // Dacă backend nu returnează amenities, folosește fallback
    const apartmentAmenities = listing.amenities || []

    return (
      <div className="listingSection__wrap">
        <div>
          <SectionHeading>Amenities</SectionHeading>
          <SectionSubheading>About the property&apos;s amenities and services</SectionSubheading>
        </div>
        <Divider className="w-14!" />

        {apartmentAmenities.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-6 text-sm text-neutral-700 xl:grid-cols-3 dark:text-neutral-300">
              {apartmentAmenities.slice(0, 12).map((amenity: string) => {
                const Icon = amenityIcons[amenity] || Wifi01Icon // Fallback icon
                return (
                  <div key={amenity} className="flex items-center gap-x-3">
                    <Icon className="h-6 w-6" />
                    <span>{amenity}</span>
                  </div>
                )
              })}
            </div>

            {apartmentAmenities.length > 12 && (
              <>
                <div className="w-14 border-b border-neutral-200"></div>
                <div>
                  <ButtonSecondary>
                    View {apartmentAmenities.length - 12} more amenities
                  </ButtonSecondary>
                </div>
              </>
            )}
          </>
        ) : (
          <p className="text-neutral-500">No amenities information available.</p>
        )}
      </div>
    )
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
          <DatesRangeInputPopover className="z-11 flex-1" />
          <div className="w-full border-b border-neutral-200 dark:border-neutral-700"></div>
          <GuestsInputPopover className="flex-1" />
        </Form>

        {/* ✅ Calculare dinamică based on dates (implementează când ai date picker functional) */}
        <DescriptionList>
          <DescriptionTerm>{price} x 1 night</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">
            <SidebarPriceAndFormWrapper price={price} />
          </DescriptionDetails>
          <DescriptionTerm className="font-semibold text-neutral-900 dark:text-neutral-100">Total</DescriptionTerm>
          <DescriptionDetails className="font-semibold sm:text-right dark:text-neutral-100">
            <SidebarPriceAndFormWrapper price={price} />
          </DescriptionDetails>
        </DescriptionList>

        <ReserveButton price={Number(numericPrice)} apartmentId={listing.id} />
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
          {renderSectionAmenities()}
          <SectionDateRange />
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