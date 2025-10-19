'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import PayWith from './PayWith'
import YourTrip from './YourTrip'

const CheckoutPage = () => {
  const searchParams = useSearchParams()
  const { currency, convert } = useCurrency()
  const T = useT()

  const basePrice = Number(searchParams.get('price') || 0)
  const nights = Number(searchParams.get('nights') || 1)

  const pricePerNight = convert(basePrice)
  const totalPrice = pricePerNight * nights

  const serviceCharge = 0
  const fee = 0
  const tax = 0

  return (
    <main className="container mt-10 mb-24 flex flex-col gap-14 lg:mb-32 lg:flex-row lg:gap-10">
      <div className="w-full lg:w-3/5 xl:w-2/3">
        <Form
          action={() => {}}
          className="flex flex-col gap-y-8 border-neutral-200 px-0 sm:rounded-4xl sm:border sm:p-6 xl:p-8 dark:border-neutral-700"
        >
          <h1 className="text-3xl font-semibold lg:text-4xl">{T.Booking['Reserve and pay']}</h1>
          <Divider />
          <YourTrip />
          <PayWith />
          <div>
            <ButtonPrimary type="submit" className="mt-10 w-full text-base/6!">
              {T.Booking['Reserve and pay']}
            </ButtonPrimary>
          </div>
        </Form>
      </div>

      <Divider className="block lg:hidden" />

      <div className="flex grow flex-col gap-y-6 border-neutral-200 px-0 sm:gap-y-8 sm:rounded-4xl sm:p-6 lg:border xl:p-8 dark:border-neutral-700">
        <DescriptionList>
          <DescriptionTerm>
            {T.Booking['per_night_x_nights']
              .replace('{price}', pricePerNight.toFixed(2))
              .replace('{currency}', currency)
              .replace('{nights}', String(nights))}
          </DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${(pricePerNight * nights).toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm>{T.Booking['Service charge']}</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${serviceCharge.toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm>{T.Booking['Fee']}</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${fee.toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm>{T.Booking['Tax']}</DescriptionTerm>
          <DescriptionDetails className="sm:text-right">{`${tax.toFixed(2)} ${currency}`}</DescriptionDetails>

          <DescriptionTerm className="font-semibold text-neutral-900">{T.Booking['Total']}</DescriptionTerm>
          <DescriptionDetails className="font-semibold sm:text-right">{`${totalPrice.toFixed(2)} ${currency}`}</DescriptionDetails>
        </DescriptionList>
      </div>
    </main>
  )
}

export default CheckoutPage

// 'use client'

// import { useT } from '@/hooks/useT'
// import ButtonPrimary from '@/shared/ButtonPrimary'
// import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
// import { Divider } from '@/shared/divider'
// import Form from 'next/form'
// import { useRouter } from 'next/navigation'
// import React from 'react'
// import PayWith from './PayWith'
// import YourTrip from './YourTrip'

// const Page = () => {
//   const router = useRouter()
//   const T = useT()

//   React.useEffect(() => {
//     document.documentElement.scrollTo({
//       top: 0,
//       behavior: 'instant',
//     })
//   }, [])

//   const handleSubmitForm = async (formData: FormData) => {
//     const formObject = Object.fromEntries(formData.entries())
//     console.log('Form submitted:', formObject)
//     // Here you can handle the form submission, e.g., send it to an API
//     router.push('/pay-done') // Uncomment this line if you want to redirect after form submission
//   }

//   const renderSidebar = () => {
//     return (
//       <div className="flex w-full flex-col gap-y-6 border-neutral-200 px-0 sm:gap-y-8 sm:rounded-4xl sm:p-6 lg:border xl:p-8 dark:border-neutral-700">
//         <div className="flex flex-col sm:flex-row sm:items-center">
//           {/* <div className="w-full shrink-0 sm:w-40">
//             <div className="aspect-w-4 overflow-hidden rounded-2xl aspect-h-3 sm:aspect-h-4">
//               <Image
//                 alt=""
//                 fill
//                 sizes="200px"
//                 src="https://images.pexels.com/photos/6373478/pexels-photo-6373478.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940"
//               />
//             </div>
//           </div> */}
//           <div className="flex flex-col gap-y-3 py-5 text-start sm:ps-5">
//             {/* <div>
//               <span className="line-clamp-1 text-sm text-neutral-500 dark:text-neutral-400">
//                 Hotel room in Tokyo, Jappan
//               </span>
//               <span className="mt-1 block text-base font-medium">The Lounge & Bar</span>
//             </div> */}
//             {/* <p className="block text-sm text-neutral-500 dark:text-neutral-400">2 beds · 2 baths</p> */}
//             {/* <Divider className="w-10!" />
//             <StartRating /> */}
//           </div>
//         </div>

//         <Divider className="block lg:hidden" />

//         <DescriptionList>
//           <DescriptionTerm>$19.00 x 3 day</DescriptionTerm>
//           <DescriptionDetails className="sm:text-right">price</DescriptionDetails>
//           <DescriptionTerm>{T.Booking['Service charge']}</DescriptionTerm>
//           <DescriptionDetails className="sm:text-right">$0.00</DescriptionDetails>
//           <DescriptionTerm>{T.Booking['Fee']}</DescriptionTerm>
//           <DescriptionDetails className="sm:text-right">$0.00</DescriptionDetails>
//           <DescriptionTerm>{T.Booking['Tax']}</DescriptionTerm>
//           <DescriptionDetails className="sm:text-right">$0.00</DescriptionDetails>
//           <DescriptionTerm className="font-semibold text-neutral-900">Total</DescriptionTerm>
//           <DescriptionDetails className="font-semibold sm:text-right">$57.00</DescriptionDetails>
//         </DescriptionList>
//       </div>
//     )
//   }

//   const renderMain = () => {
//     return (
//       <Form
//         action={handleSubmitForm}
//         className="flex w-full flex-col gap-y-8 border-neutral-200 px-0 sm:rounded-4xl sm:border sm:p-6 xl:p-8 dark:border-neutral-700"
//       >
//         <h1 className="text-3xl font-semibold lg:text-4xl">{T.Booking['Reserve and pay']}</h1>
//         <Divider />
//         <YourTrip />
//         <PayWith />
//         <div>
//           <ButtonPrimary type="submit" className="mt-10 text-base/6!">
//             {T.Booking['Reserve and pay']}
//           </ButtonPrimary>
//         </div>
//       </Form>
//     )
//   }

//   return (
//     <main className="container mt-10 mb-24 flex flex-col gap-14 lg:mb-32 lg:flex-row lg:gap-10">
//       <div className="w-full lg:w-3/5 xl:w-2/3">{renderMain()}</div>
//       <Divider className="block lg:hidden" />
//       <div className="grow">{renderSidebar()}</div>
//     </main>
//   )
// }

// export default Page
