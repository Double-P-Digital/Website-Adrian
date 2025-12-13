'use client'

import { useT } from '@/hooks/useT'
import clsx from 'clsx'
import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState, useCallback } from 'react'
import { ButtonSubmit, DateRangeField, GuestNumberField, LocationInputField, VerticalDividerLine } from './ui'

interface Props {
  className?: string
  formStyle: 'default' | 'small'
}

export const StaySearchForm = ({ className, formStyle = 'default' }: Props) => {
  const router = useRouter()
  const T = useT()
  const formRef = useRef<HTMLFormElement>(null)
  const [isFormValid, setIsFormValid] = useState(false)

  // Check if all required fields are filled
  const checkFormValidity = useCallback(() => {
    if (!formRef.current) return false
    
    const formData = new FormData(formRef.current)
    const location = formData.get('location') as string
    const checkin = formData.get('checkin') as string
    const checkout = formData.get('checkout') as string
    
    // All fields must be filled
    const isValid = !!(location?.trim() && checkin?.trim() && checkout?.trim())
    return isValid
  }, [])

  // Update validity when form changes
  useEffect(() => {
    const form = formRef.current
    if (!form) return

    const handleChange = () => {
      // Use setTimeout to ensure hidden inputs are updated
      setTimeout(() => {
        setIsFormValid(checkFormValidity())
      }, 50)
    }

    // Listen for all input changes
    form.addEventListener('input', handleChange)
    form.addEventListener('change', handleChange)
    
    // Also check on click (for date picker selections)
    const handleClick = () => {
      setTimeout(() => {
        setIsFormValid(checkFormValidity())
      }, 100)
    }
    form.addEventListener('click', handleClick)

    // Initial check
    handleChange()

    return () => {
      form.removeEventListener('input', handleChange)
      form.removeEventListener('change', handleChange)
      form.removeEventListener('click', handleClick)
    }
  }, [checkFormValidity])

  // Prefetch the stay categories page to improve performance
  useEffect(() => {
    router.prefetch('/stay-categories/all')
  }, [router])

  const handleFormSubmit = (formData: FormData) => {
    const formDataEntries = Object.fromEntries(formData.entries())
    
    // Build URL with all search parameters
    // Note: LocationInputField uses 'location' as inputName by default
    const location = formDataEntries['location'] as string
    const checkin = formDataEntries['checkin'] as string
    const checkout = formDataEntries['checkout'] as string
    const guestAdults = formDataEntries['guestAdults'] as string
    const guestChildren = formDataEntries['guestChildren'] as string
    const guestRooms = formDataEntries['guestRooms'] as string
    
    let url = '/stay-categories/all'
    const params = new URLSearchParams()
    
    if (location) {
      params.append('city', location)
    }
    if (checkin) {
      params.append('checkin', checkin)
    }
    if (checkout) {
      params.append('checkout', checkout)
    }
    
    // Add individual guest values to URL
    if (guestAdults) {
      params.append('guestAdults', guestAdults)
    }
    if (guestChildren) {
      params.append('guestChildren', guestChildren)
    }
    if (guestRooms) {
      params.append('guestRooms', guestRooms)
    }
    
    // Calculate total guests (rooms are not included) for backward compatibility
    const totalGuests = (Number(guestAdults) || 0) + (Number(guestChildren) || 0)
    if (totalGuests > 0) {
      params.append('guests', totalGuests.toString())
    }
    
    if (params.toString()) {
      url = url + '?' + params.toString()
    }
    
    router.push(url)
  }

  // @ts-ignore
  return (
    <Form
      ref={formRef}
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
      <ButtonSubmit fieldStyle={formStyle} className="z-10" disabled={!isFormValid}>

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
