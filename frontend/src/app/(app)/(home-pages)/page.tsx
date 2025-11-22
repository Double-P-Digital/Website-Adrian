import BgGlassmorphism from '@/components/BgGlassmorphism'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import HeroSearchForm from '@/components/HeroSearchForm/HeroSearchForm'

import SectionGridCategoryBox from '@/components/SectionGridCategoryBox'
import SectionHowItWork from '@/components/SectionHowItWork'
import SectionTopBooked from '@/components/SectionTopBooked'
// import SectionVideos from '@/components/SectionVideos'
import { getAllCategories } from '@/services/categories'
import { getTopBookedApartments } from '@/services/apartments'
import { getAllListings } from '@/services/listings'
import heroImage from '@/images/hero-right.png'
import { Divider } from '@/shared/divider'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Home page of the Stay application',
}

async function Page() {
  const categories = await getAllCategories()
  const topBookedApartments = await getTopBookedApartments(5)
  // Convert apartments to listings format for display
  const allListings = await getAllListings()
  const topBookedListings = allListings.filter((listing) => 
    topBookedApartments.some((apt) => apt.id === listing.id)
  ).slice(0, 5)
  
  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <HeroSectionWithSearchForm1
          heading="Hotel, car, experiences"
          image={heroImage}
          imageAlt="hero"
          searchForm={<HeroSearchForm initTab="Stays" />}
        />

        <div className="text-center">
          <div className="mt-12">
            <SectionGridCategoryBox categories={categories.slice(0, 3)} />
          </div>
        </div>
        <Divider />
        <SectionHowItWork />
        <Divider />
        <SectionTopBooked apartments={topBookedListings} />
        {/* <Divider />
        <SectionVideos /> */}
      </div>
    </main>
  )
}

export default Page
