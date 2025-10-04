import { ApplicationLayout } from '@/app/(app)/application-layout'
import BgGlassmorphism from '@/components/BgGlassmorphism'
import { ReactNode } from 'react'

const Layout = async ({ children }: { children: ReactNode }) => {

  // Fetch data that is required for the layo
  return (
    <ApplicationLayout>
      <BgGlassmorphism />

      {children}
    </ApplicationLayout>
  )
}

export default Layout
