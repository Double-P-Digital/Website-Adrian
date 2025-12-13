'use client'

import { useT } from '@/hooks/useT'
import converSelectedDateToString from '@/utils/converSelectedDateToString'
import Form from 'next/form'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import FieldPanelContainer from '../FieldPanelContainer'
import LocationInput from '../LocationInput'
import DatesRangeInput from '../DatesRangeInput'
import GuestsInput from '../GuestsInput'

const StaySearchFormMobile = () => {
  const router = useRouter()
  const T = useT()
  
  const [fieldNameShow, setFieldNameShow] = useState<'location' | 'dates' | 'guests'>('location')
  
  // State pentru a citi valorile din formular (pentru afișare în FieldPanelContainer)
  const [locationValue, setLocationValue] = useState<string>('')
  const [startDate, setStartDate] = useState<Date | null>(null)
  const [endDate, setEndDate] = useState<Date | null>(null)
  const [guestAdults, setGuestAdults] = useState<number>(1)
  const [guestChildren, setGuestChildren] = useState<number>(0)
  const [guestRooms, setGuestRooms] = useState<number>(1)
  
  // State pentru texte traduse (pentru a evita hydration mismatch)
  const [whereText, setWhereText] = useState("Where")
  const [locationText, setLocationText] = useState("Location")
  const [whenText, setWhenText] = useState("When")
  const [whoText, setWhoText] = useState("Who")
  const [guestsText, setGuestsText] = useState("Guests")
  const [addGuestsText, setAddGuestsText] = useState("Add guests")
  const [addDatesText, setAddDatesText] = useState("Add dates")

  // Update translated texts only on client side to avoid hydration mismatch
  useEffect(() => {
    setWhereText(T['HeroSearchForm']['Where'] || "Where")
    setLocationText(T['HeroSearchForm']['Location'] || "Location")
    setWhenText(T['HeroSearchForm']['When'] || "When")
    setWhoText(T['HeroSearchForm']['Who'] || "Who")
    setGuestsText(T['HeroSearchForm']['Guests'] || "Guests")
    setAddGuestsText(T['HeroSearchForm']['Add guests'] || "Add guests")
    setAddDatesText(T['HeroSearchForm']['Add dates'] || "Add dates")
  }, [T])

  // Citește valorile din formular când se schimbă
  useEffect(() => {
    const form = document.getElementById('form-hero-search-form-mobile') as HTMLFormElement
    if (!form) return

    const updateValues = () => {
      const formData = new FormData(form)
      
      // Actualizează location
      const location = formData.get('location') as string
      if (location) {
        setLocationValue(location)
      }
      
      // Actualizează dates
      const checkin = formData.get('checkin') as string
      const checkout = formData.get('checkout') as string
      if (checkin) {
        setStartDate(new Date(checkin))
      }
      if (checkout) {
        setEndDate(new Date(checkout))
      }
      
      // Actualizează guests
      const adults = formData.get('guestAdults') as string
      const children = formData.get('guestChildren') as string
      const rooms = formData.get('guestRooms') as string
      if (adults) setGuestAdults(Number(adults))
      if (children) setGuestChildren(Number(children))
      if (rooms) setGuestRooms(Number(rooms))
    }

    // Ascultă evenimente de schimbare pe formular
    form.addEventListener('change', updateValues)
    form.addEventListener('input', updateValues)
    
    // Actualizează la mount
    updateValues()

    return () => {
      form.removeEventListener('change', updateValues)
      form.removeEventListener('input', updateValues)
    }
  }, [])

  const handleFormSubmit = (formData: FormData) => {
    const formDataEntries = Object.fromEntries(formData.entries())
    
    // Build URL with all search parameters (similar to desktop version)
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
    
    // Calculate total guests (adults + children, rooms nu se include în total guests)
    const totalGuests = (Number(guestAdults) || 0) + (Number(guestChildren) || 0)
    if (totalGuests > 0) {
      params.append('guests', totalGuests.toString())
    }
    
    if (params.toString()) {
      url = url + '?' + params.toString()
    }
    
    router.push(url)
  }

  const totalGuests = guestAdults + guestChildren
  const guestStringConverted = totalGuests
    ? `${totalGuests} ${guestsText}`
    : addGuestsText

  return (
    <Form id="form-hero-search-form-mobile" action={handleFormSubmit} className="flex w-full flex-col gap-y-3">
      {/* LOCATION - folosește componenta mobilă cu listă de orașe */}
      <FieldPanelContainer
        isActive={fieldNameShow === 'location'}
        headingOnClick={() => setFieldNameShow('location')}
        headingTitle={whereText}
        headingValue={locationValue || locationText}
      >
        <LocationInput
          defaultValue={locationValue}
          imputName="location"
          className="w-full"
          onChange={(value) => setLocationValue(value)}
        />
      </FieldPanelContainer>

      {/* DATE RANGE - folosește componenta mobilă (fără Popover) */}
      <FieldPanelContainer
        isActive={fieldNameShow === 'dates'}
        headingOnClick={() => setFieldNameShow('dates')}
        headingTitle={whenText}
        headingValue={startDate ? converSelectedDateToString([startDate, endDate]) : addDatesText}
      >
        <DatesRangeInput 
          defaultStartDate={startDate} 
          defaultEndDate={endDate} 
          onChange={(dates) => {
            const [start, end] = dates
            setStartDate(start)
            setEndDate(end)
          }} 
        />
      </FieldPanelContainer>

      {/* GUEST NUMBER - folosește componenta mobilă directă (fără Popover) */}
      <FieldPanelContainer
        isActive={fieldNameShow === 'guests'}
        headingOnClick={() => setFieldNameShow('guests')}
        headingTitle={whoText}
        headingValue={guestStringConverted}
      >
        <GuestsInput 
          defaultValue={{
            guestAdults: guestAdults,
            guestChildren: guestChildren,
            guestRooms: guestRooms,
          }}
          onChange={(guests) => {
            setGuestAdults(guests.guestAdults || 0)
            setGuestChildren(guests.guestChildren || 0)
            setGuestRooms(guests.guestRooms || 0)
          }}
        />
      </FieldPanelContainer>
    </Form>
  )
}

export default StaySearchFormMobile
