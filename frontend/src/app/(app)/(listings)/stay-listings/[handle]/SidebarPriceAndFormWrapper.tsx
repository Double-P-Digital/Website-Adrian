'use client'
import SidebarPriceAndFormClient from './SidebarPriceAndFormClient'

export default function SidebarPriceAndFormWrapper({ price }: { price: string }) {
  return <SidebarPriceAndFormClient price={price} />
}
