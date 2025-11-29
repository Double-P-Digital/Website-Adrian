import { getCategoryByHandle } from '@/services/categories'
import { getListingFilterOptions, getListingsByCategory } from '@/services/listings'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import SectionGridHasMap from './SectionGridHasMap'

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

const Page = async ({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ handle?: string[] }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
  const { handle } = await params
  const urlSearchParams = await searchParams
  const category = await getCategoryByHandle(handle?.[0])
  
  // Extrage parametrii de filtrare din URL
  const city = typeof urlSearchParams.city === 'string' ? urlSearchParams.city : undefined
  const checkin = typeof urlSearchParams.checkin === 'string' ? urlSearchParams.checkin : undefined
  const checkout = typeof urlSearchParams.checkout === 'string' ? urlSearchParams.checkout : undefined
  const guests = urlSearchParams.guests ? Number(urlSearchParams.guests) : undefined
  const priceMin = urlSearchParams.price_min ? Number(urlSearchParams.price_min) : undefined
  const priceMax = urlSearchParams.price_max ? Number(urlSearchParams.price_max) : undefined
  const bedrooms = urlSearchParams.bedrooms ? Number(urlSearchParams.bedrooms) : undefined
  const bathrooms = urlSearchParams.bathrooms ? Number(urlSearchParams.bathrooms) : undefined

  // Aplică filtrele la listings
  const listings = await getListingsByCategory(handle?.[0], {
    city,
    checkin,
    checkout,
    guests,
    priceMin,
    priceMax,
    bedrooms,
    bathrooms,
  })
  
  const filterOptions = await getListingFilterOptions()

  if (!category?.id) {
    return redirect('/stay-categories/all')
  }

  return (
    <div className="container xl:max-w-none xl:pe-0 2xl:ps-10">
      <SectionGridHasMap listings={listings} category={category} filterOptions={filterOptions} />
    </div>
  )
}

export default Page
