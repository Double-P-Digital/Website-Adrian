'use client'

import { useT } from '@/hooks/useT'
import clsx from 'clsx'
import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { ButtonSubmit, DateRangeField, GuestNumberField, LocationInputField, VerticalDividerLine } from './ui'

interface Props {
  className?: string
  formStyle: 'default' | 'small'
}

export const StaySearchForm = ({ className, formStyle = 'default' }: Props) => {
  const router = useRouter()
  const T = useT()

  // Prefetch the stay categories page to improve performance
  useEffect(() => {
    router.prefetch('/stay-categories/all')
  }, [router])

  const handleFormSubmit = (formData: FormData) => {
    const formDataEntries = Object.fromEntries(formData.entries())
    console.log('[StaySearchForm] Form submitted with data:', formDataEntries)
    
    // Build URL with all search parameters
    // Note: LocationInputField uses 'location' as inputName by default
    const location = formDataEntries['location'] as string
    const checkin = formDataEntries['checkin'] as string
    const checkout = formDataEntries['checkout'] as string
    const guestAdults = formDataEntries['guestAdults'] as string
    const guestChildren = formDataEntries['guestChildren'] as string
    const guestInfants = formDataEntries['guestInfants'] as string
    
    console.log('[StaySearchForm] Extracted values:', {
      location,
      checkin,
      checkout,
      guestAdults,
      guestChildren,
      guestInfants,
    })
    
    let url = '/stay-categories/all'
    const params = new URLSearchParams()
    
    if (location) {
      params.append('city', location)
      console.log('[StaySearchForm] Added city to URL:', location)
    }
    if (checkin) {
      params.append('checkin', checkin)
      console.log('[StaySearchForm] Added checkin to URL:', checkin)
    }
    if (checkout) {
      params.append('checkout', checkout)
      console.log('[StaySearchForm] Added checkout to URL:', checkout)
    }
    
    // Calculate total guests
    const totalGuests = (Number(guestAdults) || 0) + (Number(guestChildren) || 0) + (Number(guestInfants) || 0)
    if (totalGuests > 0) {
      params.append('guests', totalGuests.toString())
      console.log('[StaySearchForm] Added guests to URL:', totalGuests)
    }
    
    if (params.toString()) {
      url = url + '?' + params.toString()
    }
    
    console.log('[StaySearchForm] Navigating to:', url)
    router.push(url)
  }

  // @ts-ignore
  return (
    <Form
      className={clsx(
        'relative z-10 flex w-full rounded-full bg-white [--form-bg:var(--color-white)] dark:bg-neutral-800 dark:[--form-bg:var(--color-neutral-800)]',
        className,
        formStyle === 'small' && 'custom-shadow-1',
        formStyle === 'default' && 'shadow-xl dark:shadow-2xl'
      )}
      action={handleFormSubmit}
    >

      <LocationInputField
          className="hero-search-form__field-after flex-5/12"
          fieldStyle={formStyle}
          // label={T['HeroSearchForm']['Where to?']}
      />
      <VerticalDividerLine />
      <DateRangeField
          className="hero-search-form__field-before hero-search-form__field-after flex-4/12"
          fieldStyle={formStyle}
          // label={T['HeroSearchForm']['When?']}
      />
      <VerticalDividerLine />
      <GuestNumberField
          className="hero-search-form__field-before flex-4/12"
          clearDataButtonClassName={clsx(formStyle === 'small' && 'sm:end-18', formStyle === 'default' && 'sm:end-22')}
          fieldStyle={formStyle}
          // label={T['HeroSearchForm']['Guests']}
      />
      <ButtonSubmit fieldStyle={formStyle} className="z-10">

      </ButtonSubmit>
      {/*<LocationInputField className="hero-search-form__field-after flex-5/12" fieldStyle={formStyle} />*/}
      {/*<VerticalDividerLine />*/}
      {/*<DateRangeField*/}
      {/*  className="hero-search-form__field-before hero-search-form__field-after flex-4/12"*/}
      {/*  fieldStyle={formStyle}*/}
      {/*/>*/}
      {/*<VerticalDividerLine />*/}
      {/*<GuestNumberField*/}
      {/*  className="hero-search-form__field-before flex-4/12"*/}
      {/*  clearDataButtonClassName={clsx(formStyle === 'small' && 'sm:end-18', formStyle === 'default' && 'sm:end-22')}*/}
      {/*  fieldStyle={formStyle}*/}
      {/*/>*/}

      {/*<ButtonSubmit fieldStyle={formStyle} className="z-10" />*/}
    </Form>
  )
}
