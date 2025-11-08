import Header from '@/components/Header/Header'
import { ReactNode } from 'react'
import { ApplicationLayout } from '../application-layout'

const Layout = async ({ children }: { children: ReactNode }) => {
  return (
    <ApplicationLayout header={<Header hasBorderBottom={false} />}>
      <div>
        <div className="container">
          {children}
        </div>
      </div>
    </ApplicationLayout>
  )
}

export default Layout
