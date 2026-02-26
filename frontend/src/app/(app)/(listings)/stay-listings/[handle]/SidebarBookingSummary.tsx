'use client'

import { useSearchParams } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import SidebarPriceAndFormWrapper from './SidebarPriceAndFormWrapper'
import { parseYYYYMMDDToDate } from '@/utils/dateUtils'

interface SidebarBookingSummaryProps {
  pricePerNight: string
  sourceCurrency?: string
  overrideTotalPrice?: number
  overridePricePerNight?: number
  overrideCurrency?: string
  overrideNightlyPrices?: { date: string; price: number; currency: string }[]
}

export default function SidebarBookingSummary({ 
  pricePerNight, 
  sourceCurrency: baseCurrency,
  overrideTotalPrice,
  overridePricePerNight,
  overrideCurrency,
  overrideNightlyPrices,
}: SidebarBookingSummaryProps) {
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
      const startDate = parseYYYYMMDDToDate(checkin)
      const endDate = parseYYYYMMDDToDate(checkout)
      
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
  const hasOverride = overrideTotalPrice !== undefined && overrideTotalPrice > 0
  const numericBasePrice = Number(String(pricePerNight).replace(/[^0-9.]/g, ''))
  const listingCurrency = baseCurrency || 'RON'
  const sourceCurrency = hasOverride ? (overrideCurrency || 'RON') : listingCurrency
  
  const nightLabel = nights === 1 
    ? (T.common.night || 'night')
    : (T.common.nights || 'nopți')

  // Calculăm prețul efectiv per noapte și totalul
  const effectivePricePerNight = hasOverride && overridePricePerNight
    ? convert(overridePricePerNight, sourceCurrency as 'RON' | 'EUR', currency)
    : convert(numericBasePrice, listingCurrency as 'RON' | 'EUR', currency)
  
  const effectiveTotal = hasOverride && overrideTotalPrice
    ? convert(overrideTotalPrice, sourceCurrency as 'RON' | 'EUR', currency)
    : effectivePricePerNight * nights

  return (
    <DescriptionList>
      <DescriptionTerm>
        {effectivePricePerNight.toFixed(2)} {currency} x {nights} {nightLabel}
      </DescriptionTerm>
      <DescriptionDetails className="sm:text-right">
        {effectiveTotal.toFixed(2)} {currency}
      </DescriptionDetails>
      <DescriptionTerm className="font-semibold text-neutral-900 dark:text-neutral-100">
        {Booking['Total'] || 'Total'}
      </DescriptionTerm>
      <DescriptionDetails className="font-semibold sm:text-right dark:text-neutral-100">
        {effectiveTotal.toFixed(2)} {currency}
      </DescriptionDetails>
    </DescriptionList>
  )
}

