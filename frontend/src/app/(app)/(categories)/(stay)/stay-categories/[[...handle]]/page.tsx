import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import { StaySearchForm } from '@/components/HeroSearchForm/StaySearchForm'
import ListingFilterTabs from '@/components/ListingFilterTabs'
import NoApartmentsAvailable from '@/components/NoApartmentsAvailable'
import StayCard2 from '@/components/StayCard2'
import { getAllCategories, getCategoryByHandle } from '@/services/categories'
import { getListingFilterOptions, getListingsByCategory } from '@/services/listings'
import { extractCategoryHandleFromLocation } from '@/utils/extractCategoryHandle'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import ListingHeaderClient from "./ListingHeaderClient";

export async function generateMetadata({ params }: { params: Promise<{ handle?: string[] }> }): Promise<Metadata> {
  const { handle } = await params
  const category = await getCategoryByHandle(handle?.[0])
  if (!category) {
    return {
      title: 'Collection not found',
      description: 'The collection you are looking for does not exist.',
    }
  }
  const { name, description } = category
  return { title: name, description }
}

const Page = async ({ params, searchParams }: { 
  params: Promise<{ handle?: string[] }>,
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const { handle } = await params
  const urlSearchParams = await searchParams

  // Extract filter parameters from URL
  const city = typeof urlSearchParams.city === 'string' ? urlSearchParams.city : undefined
  const checkin = typeof urlSearchParams.checkin === 'string' ? urlSearchParams.checkin : undefined
  const checkout = typeof urlSearchParams.checkout === 'string' ? urlSearchParams.checkout : undefined
  const guests = urlSearchParams.guests ? Number(urlSearchParams.guests) : undefined
  const priceMin = urlSearchParams.price_min ? Number(urlSearchParams.price_min) : undefined
  const priceMax = urlSearchParams.price_max ? Number(urlSearchParams.price_max) : undefined
  const bedrooms = urlSearchParams.bedrooms ? Number(urlSearchParams.bedrooms) : undefined
  const bathrooms = urlSearchParams.bathrooms ? Number(urlSearchParams.bathrooms) : undefined
  const query = typeof urlSearchParams.q === 'string' ? urlSearchParams.q : undefined

  const category = await getCategoryByHandle(handle?.[0])
  const listings = await getListingsByCategory(handle?.[0], {
    city,
    checkin,
    checkout,
    guests,
    priceMin,
    priceMax,
    bedrooms,
    bathrooms,
    query,
  })
  
  const filterOptions = await getListingFilterOptions()


  if (!category?.id) {
    return redirect('/stay-categories/all')
  }

  // Determine which category to display based on city filter
  // If there's a city filter, show that city's image and name
  let displayCategory = category
  if (city) {
    const cityHandle = extractCategoryHandleFromLocation(city)
    const allCategories = await getAllCategories()
    const cityCategory = allCategories.find(c => c.handle === cityHandle)
    if (cityCategory) {
      displayCategory = cityCategory
    }
  }

  return (
    <div className="pb-28">
      {/* Hero section */}
      <div className="container">
        <HeroSectionWithSearchForm1
          heading={displayCategory.name}
          image={displayCategory.coverImage}
          imageAlt={displayCategory.name}
          searchForm={
            <Suspense fallback={<div className="h-20 w-full" />}>
              <StaySearchForm formStyle="default" />
            </Suspense>
          }
          // description={
          //   <div className="flex items-center sm:text-lg">
          //     <HugeiconsIcon icon={MapPinpoint02Icon} size={20} color="currentColor" strokeWidth={1.5} />
          //     <span className="ms-2.5">{category.region} </span>
          //     <span className="mx-5"></span>
          //     <HugeiconsIcon icon={House04Icon} size={20} color="currentColor" strokeWidth={1.5} />
          //     <span className="ms-2.5">{convertNumbThousand(category.count)} stays</span>
          //   </div>
          // }
        />
      </div>

      {/* Content */}
      <div className="relative container mt-14 lg:mt-24">
        {/*/!* start heading *!/*/}
        {/*<div className="flex flex-wrap items-end justify-between gap-x-2.5 gap-y-5">*/}
        {/*  <h2 id="heading" className="scroll-mt-20 text-lg font-semibold sm:text-xl">*/}
        {/*    Over {convertNumbThousand(category.count)} places*/}
        {/*    {category.handle !== 'all' ? ` in ${category.name}` : null}*/}
        {/*  </h2>*/}
        {/*  <Button color="white" className="ms-auto" href={'/stay-categories-map/' + category.handle}>*/}
        {/*    <span className="me-1">Show map</span>*/}
        {/*    <HugeiconsIcon icon={MapsLocation01Icon} size={20} color="currentColor" strokeWidth={1.5} />*/}
        {/*  </Button>*/}
        {/*</div>*/}
        {/*<Divider className="my-8 md:mb-12" />*/}
        {/*/!* end heading *!/*/}
        <ListingHeaderClient category={category} />

        <ListingFilterTabs filterOptions={filterOptions} />
        <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 md:gap-x-8 md:gap-y-12 lg:mt-10 lg:grid-cols-3 xl:grid-cols-4">
          {listings.length > 0 ? (
            listings.map((listing) => (
              <StayCard2 key={listing.id} data={listing} />
            ))
          ) : (
            <Suspense fallback={null}>
              <NoApartmentsAvailable 
                hasDateFilter={!!(checkin || checkout)} 
                categoryHandle={category.handle} 
              />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

export default Page
