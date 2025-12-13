import BgGlassmorphism from '@/components/BgGlassmorphism'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import HeroSearchForm from '@/components/HeroSearchForm/HeroSearchForm'

import SectionGridCategoryBox from '@/components/SectionGridCategoryBox'
import SectionHowItWork from '@/components/SectionHowItWork'
import SectionTopBooked from '@/components/SectionTopBooked'
// import SectionVideos from '@/components/SectionVideos'
import { getAllCategories } from '@/services/categories'
import { getTopBookedApartments } from '@/services/apartments'
import { getAllListings, mapApartmentToListing } from '@/services/listings'
import heroImage from '@/images/img-site.png'
import { Divider } from '@/shared/divider'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Home page of the Stay application',
}

async function Page() {
  const categories = await getAllCategories()
  const topBookedApartments = await getTopBookedApartments(5)
  
  // Convert top booked apartments directly to listings format
  // This is more efficient than fetching all listings and filtering
  let topBookedListings = topBookedApartments.map(apartment => mapApartmentToListing(apartment))
  
  // Fallback: dacă nu avem top booked apartments, folosim primele N listings
  if (topBookedListings.length === 0) {
    const allListings = await getAllListings()
    topBookedListings = allListings.slice(0, 5)
  }
  
  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <HeroSectionWithSearchForm1
          heading="Hotel, car, experiences"
          image={heroImage}
          imageAlt="hero"
          searchForm={
            <Suspense fallback={<div className="h-20 w-full" />}>
              <HeroSearchForm initTab="Stays" />
            </Suspense>
          }
        />

        <div className="text-center">
          <div className="mt-12">
            <SectionGridCategoryBox categories={categories.filter(cat => cat.handle !== 'all').slice(0, 3)} />
          </div>
        </div>
        <Divider />
        <SectionHowItWork />
        <Divider />
        <Suspense fallback={<div className="h-96 w-full" />}>
          <SectionTopBooked apartments={topBookedListings} />
        </Suspense>
        {/* <Divider />
        <SectionVideos /> */}
      </div>
    </main>
  )
}

export default Page
