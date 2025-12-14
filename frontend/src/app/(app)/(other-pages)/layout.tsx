import Header from '@/components/Header/Header'
import { Metadata } from 'next'
import { ApplicationLayout } from '../application-layout'

export const metadata: Metadata = {
  title: 'DailyGuest',
  description: 'DailyGuest - Rezervă apartamente în Cluj-Napoca, Baia Mare și Oradea. Experiența bookingului simplificată.',
  keywords: ['DailyGuest', 'Rezervări', 'Apartamente', 'Cluj-Napoca', 'Baia Mare', 'Oradea', 'Cazare'],
}

export default function Layout({ children, params }: { children: React.ReactNode; params: any }) {
  return <ApplicationLayout header={<Header hasBorderBottom={true} />}>{children}</ApplicationLayout>
}
