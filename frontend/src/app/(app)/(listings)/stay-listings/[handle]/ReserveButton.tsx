'use client'

import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { useRouter } from 'next/navigation'

interface ReserveButtonProps {
  price: number
  nights?: number
}

export default function ReserveButton({ price, nights = 1 }: ReserveButtonProps) {
  const router = useRouter()
  const T = useT()

  const handleClick = () => {
    router.push(`/checkout?price=${price}&nights=${nights}`)
  }

  return (
    <ButtonPrimary type="button" onClick={handleClick} className="w-full">
      {T.Booking['Reserve and pay'] || 'Reserve and pay'}
    </ButtonPrimary>
  )
}

// 'use client'

// import { useT } from '@/hooks/useT'
// import ButtonPrimary from '@/shared/ButtonPrimary'
// import { useRouter } from 'next/navigation'

// interface ReserveButtonProps {
//   price: number
// }

// export default function ReserveButton({ price }: ReserveButtonProps) {
//   const T = useT()
//   const router = useRouter()

//   const handleClick = () => {
//     // Redirect to checkout page and pass the price
//     router.push(`/checkout?price=${price}`)
//   }

//   return (
//     <ButtonPrimary type="button" onClick={handleClick} className="w-full">
//       {T.Booking['Reserve and pay'] || 'Confirm and Payment'}
//     </ButtonPrimary>
//   )
// }

// 'use client'

// import { useT } from '@/hooks/useT'
// import ButtonPrimary from '@/shared/ButtonPrimary'

// interface ReserveButtonProps {
//   children?: React.ReactNode
// }

// export default function ReserveButton({ children }: ReserveButtonProps) {
//   const T = useT()
//   children = children || T.Booking['Reserve and pay'] || 'Confirm and Payment'

//   return (
//     <ButtonPrimary form="booking-form" type="submit" className="w-full">
//       {children || 'Confirm and Payment'}
//     </ButtonPrimary>
//   )
// }

// 'use client'

// import { useT } from '@/hooks/useT'
// import ButtonPrimary from '@/shared/ButtonPrimary'
// import { useRouter } from 'next/navigation'

// interface ReserveButtonProps {
//   price: number | string
//   children?: React.ReactNode
// }

// export default function ReserveButton({ price, children }: ReserveButtonProps) {
//   const router = useRouter()
//   const T = useT()
//   const label = children || T.Booking['Reserve and pay'] || 'Confirm and Payment'

//   const handleClick = () => {
//     router.push(`/checkout?price=${price}`)
//   }

//   return (
//     <ButtonPrimary onClick={handleClick} type="button" className="w-full">
//       {label}
//     </ButtonPrimary>
//   )
// }
