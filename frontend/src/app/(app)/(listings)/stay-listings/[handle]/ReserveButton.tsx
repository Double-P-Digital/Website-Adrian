'use client'

import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { useRouter } from 'next/navigation'

interface ReserveButtonProps {
  price: number
  nights?: number
  apartmentId?: string
}

export default function ReserveButton({ price, nights = 1, apartmentId }: ReserveButtonProps) {
  const router = useRouter()
  const T = useT()

  const handleClick = () => {
    const params = new URLSearchParams({
      price: price.toString(),
      nights: nights.toString(),
    })
    if (apartmentId) {
      params.set('apartmentId', apartmentId)
    }
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <ButtonPrimary type="button" onClick={handleClick} className="w-full">
      {T.Booking['Reserve and pay'] || 'Reserve and pay'}
    </ButtonPrimary>
  )
}

