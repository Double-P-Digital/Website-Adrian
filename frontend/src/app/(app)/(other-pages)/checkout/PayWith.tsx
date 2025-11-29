'use client'

import { useT } from '@/hooks/useT'
import { Description, Field, Label } from '@/shared/fieldset'
import Input from '@/shared/Input'
import { MasterCardIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import { DescriptionDetails, DescriptionList, DescriptionTerm } from '@/shared/description-list'
import ApartmentSummary from './ApartmentSummary'

interface PayWithProps {
  apartmentId?: string
  pricePerNight: number
  nights: number
  totalPrice: number
  serviceCharge: number
  fee: number
  tax: number
  currency: string
  validationErrors?: Record<string, string>
}

const PayWith = ({
  apartmentId,
  pricePerNight,
  nights,
  totalPrice,
  serviceCharge,
  fee,
  tax,
  currency,
  validationErrors = {},
}: PayWithProps) => {
  const T = useT()
  const Booking = T.Booking as Record<string, string>

  return (
    <div className="pt-5">
      {/* Informații despre client */}
      <h3 className="text-2xl font-semibold">{Booking['Guest Information'] || 'Informații despre client'}</h3>
      <div className="my-5 w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

      {/* Date client */}
      <div className="mb-8 flex flex-col gap-y-5">
        {/* Nume și Prenume */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field>
            <Label>
              {Booking['First Name'] || 'Prenume'} <span className="text-red-500">*</span>
            </Label>
            <Input
              name="firstName"
              className={`mt-1.5 ${validationErrors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              required
              placeholder={Booking['Enter first name'] || 'Introduceți prenumele'}
            />
            {validationErrors.firstName && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.firstName}</p>
            )}
          </Field>

          <Field>
            <Label>
              {Booking['Last Name'] || 'Nume'} <span className="text-red-500">*</span>
            </Label>
            <Input
              name="lastName"
              className={`mt-1.5 ${validationErrors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              required
              placeholder={Booking['Enter last name'] || 'Introduceți numele'}
            />
            {validationErrors.lastName && (
              <p className="mt-1 text-sm text-red-500">{validationErrors.lastName}</p>
            )}
          </Field>
        </div>

        {/* Email */}
        <Field>
          <Label>
            {Booking['Email'] || 'Email'} <span className="text-red-500">*</span>
          </Label>
          <Input
            name="email"
            type="email"
            className={`mt-1.5 ${validationErrors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            required
            placeholder="example@email.com"
          />
          {validationErrors.email ? (
            <p className="mt-1 text-sm text-red-500">{validationErrors.email}</p>
          ) : (
            <Description>{Booking['We will send the booking confirmation to this email'] || 'Vom trimite confirmarea rezervării la acest email'}</Description>
          )}
        </Field>

        {/* Număr de telefon */}
        <Field>
          <Label>
            {Booking['Phone Number'] || 'Număr de telefon'} <span className="text-red-500">*</span>
          </Label>
          <Input
            name="phoneNumber"
            type="tel"
            className={`mt-1.5 ${validationErrors.phoneNumber ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            required
            placeholder="+40 123 456 789"
          />
          {validationErrors.phoneNumber ? (
            <p className="mt-1 text-sm text-red-500">{validationErrors.phoneNumber}</p>
          ) : (
            <Description>{Booking['We may contact you regarding your booking'] || 'Vă putem contacta în legătură cu rezervarea'}</Description>
          )}
        </Field>
      </div>

      {/* Metodă de plată */}
      <div className="mt-8">
        <h3 className="text-2xl font-semibold">{T['PayWith']['Pay with']}</h3>
        <div className="my-5 w-14 border-b border-neutral-200 dark:border-neutral-700"></div>

        <div className="mt-6 flex items-center gap-x-2 rounded-full px-4 py-2.5 text-sm font-medium">
          <HugeiconsIcon icon={MasterCardIcon} size={20} strokeWidth={1.5} />
          <span>{T['PayWith']['Credit card']}</span>
        </div>
        <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
          {Booking['Payment will be processed securely via Stripe'] || 'Plata va fi procesată în siguranță prin Stripe'}
        </p>
        
        {/* Summary pentru mobile - afișat sub Credit card */}
        <div className="mt-6 lg:hidden">
          {apartmentId && <ApartmentSummary apartmentId={apartmentId} />}
          <DescriptionList>
            <DescriptionTerm>
              {Booking['per_night_x_nights']
                ?.replace('{price}', pricePerNight.toFixed(2))
                ?.replace('{currency}', currency)
                ?.replace('{nights}', String(nights)) || `${pricePerNight.toFixed(2)} ${currency} x ${nights} night(s)`}
            </DescriptionTerm>
            <DescriptionDetails className="sm:text-right">{`${(pricePerNight * nights).toFixed(2)} ${currency}`}</DescriptionDetails>

            <DescriptionTerm>{Booking['Service charge'] || 'Service charge'}</DescriptionTerm>
            <DescriptionDetails className="sm:text-right">{`${serviceCharge.toFixed(2)} ${currency}`}</DescriptionDetails>

            <DescriptionTerm>{Booking['Fee'] || 'Fee'}</DescriptionTerm>
            <DescriptionDetails className="sm:text-right">{`${fee.toFixed(2)} ${currency}`}</DescriptionDetails>

            <DescriptionTerm>{Booking['Tax'] || 'Tax'}</DescriptionTerm>
            <DescriptionDetails className="sm:text-right">{`${tax.toFixed(2)} ${currency}`}</DescriptionDetails>

            <DescriptionTerm className="font-semibold text-neutral-900">{Booking['Total'] || 'Total'}</DescriptionTerm>
            <DescriptionDetails className="font-semibold sm:text-right">{`${totalPrice.toFixed(2)} ${currency}`}</DescriptionDetails>
          </DescriptionList>
        </div>
      </div>
    </div>
  )
}

export default PayWith
