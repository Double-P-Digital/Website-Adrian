import BgGlassmorphism from '@/components/BgGlassmorphism'
import HeroSectionWithSearchForm1 from '@/components/hero-sections/HeroSectionWithSearchForm1'
import HeroSearchForm from '@/components/HeroSearchForm/HeroSearchForm'
import SectionClientSay from '@/components/SectionClientSay'
import SectionHowItWork from '@/components/SectionHowItWork'
import SectionGridCategoryBox from '@/components/SectionGridCategoryBox'
import SectionVideos from '@/components/SectionVideos'
import { getStayCategories } from '@/data/categories'
import heroImage from '@/images/hero-right.png'
import { Divider } from '@/shared/divider'
import HeadingWithSub from '@/shared/Heading'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Home',
  description: 'Home page of the Stay application',
}

async function Page() {
  const categories = await getStayCategories()
  return (
    <main className="relative overflow-hidden">
      <BgGlassmorphism />
      <div className="relative container mb-24 flex flex-col gap-y-24 lg:mb-28 lg:gap-y-32">
        <HeroSectionWithSearchForm1
          heading="Hotel, car, experiences"
          image={heroImage}
          imageAlt="hero"
          searchForm={<HeroSearchForm initTab="Stays" />}
          description={
            <>
              <p className="max-w-xl text-base text-neutral-500 sm:text-xl dark:text-neutral-400">
                With us, your trip is filled with amazing experiences.
              </p>
            </>
          }
        />

        <div className="text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl lg:text-4xl">
            Let&apos;s go on an adventure
          </h2>
          <div className="mt-12">
            <SectionGridCategoryBox categories={categories.slice(0, 3)} />
          </div>
        </div>
        <Divider />
        <SectionHowItWork />
        <Divider />
        <SectionVideos />
        <div className="relative py-16">
          <SectionClientSay />
        </div>
      </div>
    </main>
  )
}

export default Page
