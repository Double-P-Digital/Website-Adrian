import Header from '@/components/Header/Header'
import { ReactNode } from 'react'
import { ApplicationLayout } from '../application-layout'

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <ApplicationLayout header={<Header hasBorderBottom={false} />}>
      <div>
        <div className="container">
          {children}
          {/* <SectionOurFeatures rightImg={featuresImg} type="type2" className="py-24 lg:py-32" /> */}
        </div>
      </div>
    </ApplicationLayout>
  )
}

export default Layout
