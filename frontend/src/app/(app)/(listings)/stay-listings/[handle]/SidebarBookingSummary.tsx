'use client'

import { useSearchParams } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import SidebarPriceAndFormWrapper from './SidebarPriceAndFormWrapper'

interface SidebarBookingSummaryProps {
  pricePerNight: string
}

export default function SidebarBookingSummary({ pricePerNight }: SidebarBookingSummaryProps) {
  const searchParams = useSearchParams()
  const { currency, convert } = useCurrency()
  const T = useT()
  const Booking = T.Booking as Record<string, string>
  
  // Get dates from URL
  const checkin = searchParams.get('checkin')
  const checkout = searchParams.get('checkout')
  
  // Calculate number of nights
  const calculateNights = (): number => {
    if (!checkin || !checkout) return 1
    
    try {
      const startDate = new Date(checkin)
      const endDate = new Date(checkout)
      
      // Calculate difference in days
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      // Ensure at least 1 night
      return diffDays >= 1 ? diffDays : 1
    } catch {
      return 1
    }
  }
  
  const nights = calculateNights()
  const numericPrice = Number(String(pricePerNight).replace(/[^0-9.]/g, ''))
  const convertedPricePerNight = convert(numericPrice, 'RON', currency)
  const subtotal = convertedPricePerNight * nights
  const total = subtotal
  
  const nightText = Booking['/night'] || '/night'
  const nightLabel = nights === 1 
    ? (T.common.night || 'night')
    : (T.common.night ? `${T.common.night}s` : 'nights')

  return (
    <DescriptionList>
      <DescriptionTerm>
        {convertedPricePerNight.toFixed(2)} {currency} x {nights} {nightLabel}
      </DescriptionTerm>
      <DescriptionDetails className="sm:text-right">
        {subtotal.toFixed(2)} {currency}
      </DescriptionDetails>
      <DescriptionTerm className="font-semibold text-neutral-900 dark:text-neutral-100">
        {Booking['Total'] || 'Total'}
      </DescriptionTerm>
      <DescriptionDetails className="font-semibold sm:text-right dark:text-neutral-100">
        {total.toFixed(2)} {currency}
      </DescriptionDetails>
    </DescriptionList>
  )
}

