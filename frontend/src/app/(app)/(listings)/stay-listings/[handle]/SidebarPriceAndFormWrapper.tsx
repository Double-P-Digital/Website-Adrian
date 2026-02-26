'use client'
import SidebarPriceAndFormClient from './SidebarPriceAndFormClient'

interface Props {
  price: string
  sourceCurrency?: string
  overridePricePerNight?: number
  overrideCurrency?: string
}

export default function SidebarPriceAndFormWrapper({ price, sourceCurrency, overridePricePerNight, overrideCurrency }: Props) {
  return <SidebarPriceAndFormClient price={price} sourceCurrency={sourceCurrency} overridePricePerNight={overridePricePerNight} overrideCurrency={overrideCurrency} />
}
