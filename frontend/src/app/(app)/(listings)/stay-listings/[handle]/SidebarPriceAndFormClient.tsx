'use client'
import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'

interface Props {
  price: string
  sourceCurrency?: string
  overridePricePerNight?: number
  overrideCurrency?: string
}

export default function SidebarPriceAndFormClient({ price, sourceCurrency, overridePricePerNight, overrideCurrency }: Props) {
  const { currency, convert } = useCurrency()
  const T = useT()
  const basePrice = Number(String(price).replace(/[^0-9.]/g, ''))
  const baseCurrency = sourceCurrency || 'RON'
  const nightText = T['Booking']['/night'] || '/night'

  // Dacă avem override, afișăm prețul override; altfel prețul de bază
  const displayPrice = overridePricePerNight
    ? convert(overridePricePerNight, (overrideCurrency || 'RON') as 'RON' | 'EUR', currency)
    : convert(basePrice, baseCurrency as 'RON' | 'EUR', currency)

  return (
    <span className="mx-2">
      {displayPrice.toFixed(2)} {currency}
      <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400"> {nightText}</span>
    </span>
  )
}
