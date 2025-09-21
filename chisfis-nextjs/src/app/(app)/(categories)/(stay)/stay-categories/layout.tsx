import { ApplicationLayout } from '@/app/(app)/application-layout'
import BgGlassmorphism from '@/components/BgGlassmorphism'

import { getAuthors } from '@/data/authors'
import { getStayCategories } from '@/data/categories'
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {
  const categories = (await getStayCategories()).slice(7, 15)
  const authors = await getAuthors()

  return (
    <ApplicationLayout>
      <BgGlassmorphism />

      {children}

      {/* <div className="container">
        <div className="relative py-16 lg:py-20">
          <BackgroundSection />
          <Heading subheading="Explore houses based on 10 types of stays">Explore the world with us.</Heading>
          <SectionSliderNewCategories
            itemClassName="w-[17rem] lg:w-1/3 xl:w-1/4"
            categories={categories}
            categoryCardType="card5"
          />
        </div>
      </div> */}
    </ApplicationLayout>
  )
}

export default Layout
