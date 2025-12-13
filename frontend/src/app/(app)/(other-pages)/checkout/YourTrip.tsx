'use client'

import ModalSelectDate from '@/components/ModalSelectDate'
import ModalSelectGuests from '@/components/ModalSelectGuests'
import { useLanguage } from '@/context/LanguageContext'
import { useT } from '@/hooks/useT'
import { GuestsObject } from '@/type'
import converSelectedDateToString from '@/utils/converSelectedDateToString'
import { PencilSquareIcon } from '@heroicons/react/24/outline'
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '@/utils/dateUtils'

interface YourTripProps {
  onDatesChange?: (startDate: Date | null, endDate: Date | null) => void
  onGuestsChange?: (guests: GuestsObject) => void
}

const YourTrip = ({ onDatesChange, onGuestsChange }: YourTripProps) => {
  const T = useT()
  const { language } = useLanguage()
  const searchParams = useSearchParams()
  
  // Citește datele din URL
  const urlCheckin = searchParams.get('checkin')
  const urlCheckout = searchParams.get('checkout')
  const urlGuestAdults = searchParams.get('guestAdults')
  const urlGuestChildren = searchParams.get('guestChildren')
  const urlGuestRooms = searchParams.get('guestRooms')
  
  // Folosește data curentă ca check-in și data curentă + 1 zi ca check-out (minim 1 noapte)
  const getDefaultDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { today, tomorrow }
  }
  
  const { today, tomorrow } = getDefaultDates()
  
  // Inițializează datele din URL sau folosește default-uri
  const [startDate, setStartDate] = useState<Date | null>(() => {
    if (urlCheckin) {
      try {
        return parseYYYYMMDDToDate(urlCheckin)
      } catch {
        return today
      }
    }
    return today
  })
  const [endDate, setEndDate] = useState<Date | null>(() => {
    if (urlCheckout) {
      try {
        return parseYYYYMMDDToDate(urlCheckout)
      } catch {
        return tomorrow
      }
    }
    return tomorrow
  })
  const [guests, setGuests] = useState<GuestsObject>({
    guestAdults: urlGuestAdults ? Number(urlGuestAdults) : 1,
    guestChildren: urlGuestChildren ? Number(urlGuestChildren) : 0,
    guestRooms: urlGuestRooms ? Number(urlGuestRooms) : 1,
  })
  
  // Sincronizează cu URL când se schimbă
  useEffect(() => {
    const urlCheckin = searchParams.get('checkin')
    const urlCheckout = searchParams.get('checkout')
    const urlGuestAdults = searchParams.get('guestAdults')
    const urlGuestChildren = searchParams.get('guestChildren')
    const urlGuestRooms = searchParams.get('guestRooms')
    
    if (urlCheckin) {
      try {
        const newStart = parseYYYYMMDDToDate(urlCheckin)
        if (!startDate || formatDateToYYYYMMDD(startDate) !== urlCheckin) {
          setStartDate(newStart)
        }
      } catch {
        // Ignoră date invalide
      }
    }
    
    if (urlCheckout) {
      try {
        const newEnd = parseYYYYMMDDToDate(urlCheckout)
        if (!endDate || formatDateToYYYYMMDD(endDate) !== urlCheckout) {
          setEndDate(newEnd)
        }
      } catch {
        // Ignoră date invalide
      }
    }
    
    if (urlGuestAdults || urlGuestChildren || urlGuestRooms) {
      setGuests({
        guestAdults: urlGuestAdults ? Number(urlGuestAdults) : guests.guestAdults,
        guestChildren: urlGuestChildren ? Number(urlGuestChildren) : guests.guestChildren,
        guestRooms: urlGuestRooms ? Number(urlGuestRooms) : guests.guestRooms,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Notifică părintele când se schimbă datele (inclusiv la mount)
  useEffect(() => {
    if (onDatesChange) {
      onDatesChange(startDate, endDate)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate])

  // Notifică părintele când se schimbă oaspeții
  useEffect(() => {
    if (onGuestsChange) {
      onGuestsChange(guests)
    }
  }, [guests, onGuestsChange])

  // ✅ Helpers for plural forms (works in English and Romanian)
  const formatGuests = (count: number) => {
    if (language === 'ro') {
      return count === 1 ? `${count} oaspete` : `${count} oaspeți`
    }
    return count === 1 ? `${count} guest` : `${count} guests`
  }

  const formatRooms = (count: number) => {
    if (language === 'ro') {
      return count === 1 ? `${count} cameră` : `${count} camere`
    }
    return count === 1 ? `${count} room` : `${count} rooms`
  }

  return (
    <div>
      <h3 className="text-2xl font-semibold">{T.Booking['Your trip']}</h3>

      <div className="z-10 mt-6 flex flex-col divide-y divide-neutral-200 overflow-hidden rounded-3xl border border-neutral-200 sm:flex-row sm:divide-x sm:divide-y-0 sm:rtl:divide-x-reverse dark:divide-neutral-700 dark:border-neutral-700">
        <ModalSelectDate
          onChange={(dates) => {
            const [start, end] = dates
            setStartDate(start)
            setEndDate(end)
            // Callback-ul va fi apelat automat prin useEffect
          }}
          triggerButton={({ openModal }) => (
            <button
              onClick={openModal}
              className="flex flex-1 justify-between gap-x-5 p-5 text-start hover:bg-neutral-50 focus-visible:outline-hidden dark:hover:bg-neutral-800"
              type="button"
            >
              <div className="flex flex-col">
                <span className="text-sm text-neutral-400">{T['HeroSearchForm']['Date range']}</span>
                <span className="mt-1.5 text-lg font-semibold">
                  {startDate ? converSelectedDateToString([startDate, endDate]) : T['HeroSearchForm']['Add dates']}
                </span>
              </div>
              <PencilSquareIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
        />

        <ModalSelectGuests
          onChangeGuests={setGuests}
          triggerButton={({ openModal }) => (
            <button
              type="button"
              onClick={openModal}
              className="flex flex-1 justify-between gap-x-5 p-5 text-start hover:bg-neutral-50 focus-visible:outline-hidden dark:hover:bg-neutral-800"
            >
              <div className="flex flex-col">
                <span className="text-sm text-neutral-400">{T['HeroSearchForm']['Guests']}</span>
                <span className="mt-1.5 text-lg font-semibold">
                  <span className="line-clamp-1">
                    {`${formatGuests((guests.guestAdults || 0) + (guests.guestChildren || 0))}, ${formatRooms(
                      guests.guestRooms || 1
                    )}`}
                  </span>
                </span>
              </div>
              <PencilSquareIcon className="h-6 w-6 text-neutral-600 dark:text-neutral-400" />
            </button>
          )}
        />
      </div>

      <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
        {T.Booking['Click on the pencil icon to change your trip details.']}
      </p>

      <input type="hidden" name="guestAdults" value={guests.guestAdults} />
      <input type="hidden" name="guestChildren" value={guests.guestChildren} />
      <input type="hidden" name="guestRooms" value={guests.guestRooms} />
      <input type="hidden" name="startDate" value={startDate ? startDate.toISOString() : ''} />
      <input type="hidden" name="endDate" value={endDate ? endDate.toISOString() : ''} />
    </div>
  )
}

export default YourTrip
