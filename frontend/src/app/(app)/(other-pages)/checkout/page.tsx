'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import { Divider } from '@/shared/divider'
import Form from 'next/form'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import PayWith from './PayWith'
import YourTrip from './YourTrip'

function CheckoutPageContent() {
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

const CheckoutPage = () => {
  return (
    <Suspense fallback={
      <div className="container mt-10 mb-24">
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-pulse text-lg">Loading checkout...</div>
          </div>
        </div>
      </div>
    }>
      <CheckoutPageContent />
    </Suspense>
  )
}

export default CheckoutPage