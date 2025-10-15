'use client'
import { useCurrency } from '@/context/CurrencyContext'

export default function SidebarPriceAndFormClient({ price }: { price: string }) {
  const { currency, convert } = useCurrency()
  const numericPrice = Number(String(price).replace(/[^0-9.]/g, ''))
  const convertedPrice = convert(numericPrice, 'RON', currency)

  return (
    <span className="mx-2">
      {convertedPrice.toFixed(2)} {currency}
    </span>
  )
}
