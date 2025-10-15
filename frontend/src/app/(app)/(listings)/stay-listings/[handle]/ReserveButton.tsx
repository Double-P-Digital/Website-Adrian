'use client'

import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'

interface ReserveButtonProps {
  children?: React.ReactNode
}

export default function ReserveButton({ children }: ReserveButtonProps) {
  const T = useT()
  children = children || T.Booking['Reserve and pay'] || 'Confirm and Payment'

  return (
    <ButtonPrimary form="booking-form" type="submit" className="w-full">
      {children || 'Confirm and Payment'}
    </ButtonPrimary>
  )
}
