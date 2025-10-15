'use client'
import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'

export default function SidebarPriceAndFormClient({ price }: { price: string }) {
  const { currency, convert } = useCurrency()
  const T = useT()
  const numericPrice = Number(String(price).replace(/[^0-9.]/g, ''))
  const convertedPrice = convert(numericPrice, 'RON', currency)
  const nightText = T['Booking']['/night'] || '/night'

  return (
    <span className="mx-2">
      {convertedPrice.toFixed(2)} {currency}
      <span className="text-sm font-normal text-neutral-500 dark:text-neutral-400"> {nightText}</span>
    </span>
  )
}
