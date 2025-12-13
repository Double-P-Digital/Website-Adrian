'use client'

import NcInputNumber from '@/components/NcInputNumber'
import { GuestsObject } from '@/type'
import { useT } from '@/hooks/useT'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { UserPlusIcon, UserIcon, UsersIcon } from '@heroicons/react/24/outline'
import { MeetingRoomIcon } from '@hugeicons/core-free-icons'
import { HugeiconsIcon } from '@hugeicons/react'
import clsx from 'clsx'
import { FC, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { ClearDataButton } from './ClearDataButton'

const styles = {
  button: {
    base: 'relative z-10 shrink-0 w-full cursor-pointer flex items-center gap-x-3 focus:outline-hidden text-start',
    focused: 'rounded-full bg-transparent focus-visible:outline-hidden dark:bg-white/5 custom-shadow-1 ',
    default: 'px-7 py-4 xl:px-8 xl:py-6',
    small: 'py-3 px-7 xl:px-8',
  },
  mainText: {
    default: 'text-base xl:text-lg',
    small: 'text-base',
  },
  panel: {
    base: 'absolute end-0 top-full z-50 mt-3 flex w-sm flex-col gap-y-6 rounded-3xl bg-white px-8 py-7 shadow-xl transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-800',
    default: '',
    small: '',
  },
}

interface Props {
  fieldStyle: 'default' | 'small'
  className?: string
  clearDataButtonClassName?: string
}

export const GuestNumberField: FC<Props> = ({
  fieldStyle = 'default',
  className = 'flex-1',
  clearDataButtonClassName,
}) => {
  const searchParams = useSearchParams()
  
  // Read guest values from URL on mount
  const getInitialGuests = () => {
    const guestAdults = searchParams.get('guestAdults')
    const guestChildren = searchParams.get('guestChildren')
    const guestRooms = searchParams.get('guestRooms')
    const guests = searchParams.get('guests') // Total guests (adults + children)
    
    // If we have individual values, use them
    if (guestAdults || guestChildren || guestRooms) {
      return {
        adults: guestAdults ? Number(guestAdults) : 1,
        children: guestChildren ? Number(guestChildren) : 0,
        rooms: guestRooms ? Number(guestRooms) : 1,
      }
    }
    
    // If we only have total guests, split it (default: 1 adult, 0 children)
    if (guests) {
      const totalGuests = Number(guests)
      return {
        adults: totalGuests > 0 ? totalGuests : 1,
        children: 0,
        rooms: 1,
      }
    }
    
    // Default values
    return {
      adults: 1,
      children: 0,
      rooms: 1,
    }
  }
  
  const initialGuests = getInitialGuests()
  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(initialGuests.adults)
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(initialGuests.children)
  const [guestRoomsInputValue, setGuestRoomsInputValue] = useState(initialGuests.rooms)
  const T = useT()
  const [guestsText, setGuestsText] = useState("Guests")
  const [addGuestsText, setAddGuestsText] = useState("Add guests")
  const [adultsText, setAdultsText] = useState("Adults")
  const [adultsDescriptionText, setAdultsDescriptionText] = useState("Ages 13 or above")
  const [childrenText, setChildrenText] = useState("Children")
  const [childrenDescriptionText, setChildrenDescriptionText] = useState("Ages 2–12")
  const [roomsText, setRoomsText] = useState("Rooms")
  const [roomsDescriptionText, setRoomsDescriptionText] = useState("Number of rooms")
  
  // Update translated texts only on client side to avoid hydration mismatch
  useEffect(() => {
    setGuestsText(T.HeroSearchForm.Guests || "Guests")
    setAddGuestsText(T['HeroSearchForm']['Add guests'] || "Add guests")
    setAdultsText(T['HeroSearchForm']['Adults'] || "Adults")
    setAdultsDescriptionText(T['HeroSearchForm']['Ages 13 or above'] || "Ages 13 or above")
    setChildrenText(T['HeroSearchForm']['Children'] || "Children")
    setChildrenDescriptionText(T['HeroSearchForm']['Ages 2–12'] || "Ages 2–12")
    setRoomsText(T['HeroSearchForm']['Rooms'] || "Rooms")
    setRoomsDescriptionText(T['HeroSearchForm']['Number of rooms'] || "Number of rooms")
  }, [T])
  
  // Update guests when URL changes
  useEffect(() => {
    const guestAdults = searchParams.get('guestAdults')
    const guestChildren = searchParams.get('guestChildren')
    const guestRooms = searchParams.get('guestRooms')
    const guests = searchParams.get('guests')
    
    if (guestAdults) {
      setGuestAdultsInputValue(Number(guestAdults))
    }
    if (guestChildren) {
      setGuestChildrenInputValue(Number(guestChildren))
    }
    if (guestRooms) {
      setGuestRoomsInputValue(Number(guestRooms))
    } else if (guests) {
      // If only total guests is provided, set adults to that value
      const totalGuests = Number(guests)
      if (totalGuests > 0) {
        setGuestAdultsInputValue(totalGuests)
        setGuestChildrenInputValue(0)
      }
    }
  }, [searchParams])

  const handleChangeData = (value: number, type: keyof GuestsObject) => {
    let newValue = {
      guestAdults: guestAdultsInputValue,
      guestChildren: guestChildrenInputValue,
      guestRooms: guestRoomsInputValue,
    }
    if (type === 'guestAdults') {
      setGuestAdultsInputValue(value)
      newValue.guestAdults = value
    }
    if (type === 'guestChildren') {
      setGuestChildrenInputValue(value)
      newValue.guestChildren = value
    }
    if (type === 'guestRooms') {
      setGuestRoomsInputValue(value)
      newValue.guestRooms = value
    }
  }

  const totalGuests = guestChildrenInputValue + guestAdultsInputValue
  
  return (
    <Popover className={`group relative z-10 flex ${className}`}>
      {({ open: showPopover }) => (
        <>
          <PopoverButton
            className={clsx(styles.button.base, styles.button[fieldStyle], showPopover && styles.button.focused)}
          >
            {fieldStyle === 'default' && (
              <UserPlusIcon className="size-5 text-neutral-300 lg:size-7 dark:text-neutral-400" />
            )}

            <div className="grow">
              <span className={clsx('block font-semibold', styles.mainText[fieldStyle])}>
                {guestsText}
              </span>
              <span className="mt-1 flex items-center gap-2 text-sm leading-none font-light text-neutral-400">
                {totalGuests > 0 || guestRoomsInputValue > 1 ? (
                  <>
                    {guestAdultsInputValue > 0 && (
                      <span className="flex items-center gap-1">
                        <UserIcon className="size-4" />
                        <span>{guestAdultsInputValue}</span>
                      </span>
                    )}
                    {guestChildrenInputValue > 0 && (
                      <span className="flex items-center gap-1">
                        <UsersIcon className="size-4" />
                        <span>{guestChildrenInputValue}</span>
                      </span>
                    )}
                    {guestRoomsInputValue > 0 && (
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={MeetingRoomIcon} size={16} strokeWidth={1.5} />
                        <span>{guestRoomsInputValue}</span>
                      </span>
                    )}
                  </>
                ) : (
                  addGuestsText
                )}
              </span>
            </div>
          </PopoverButton>

          <ClearDataButton
            className={clsx(!totalGuests && 'sr-only', clearDataButtonClassName)}
            onClick={() => {
              setGuestAdultsInputValue(0)
              setGuestChildrenInputValue(0)
              setGuestRoomsInputValue(1)
            }}
          />

          <PopoverPanel unmount={false} transition className={clsx(styles.panel.base, styles.panel[fieldStyle])}>
            <NcInputNumber
              className="w-full"
              defaultValue={guestAdultsInputValue}
              onChange={(value) => handleChangeData(value, 'guestAdults')}
              max={10}
              min={1}
              label={adultsText}
              description={adultsDescriptionText}
              inputName="guestAdults"
            />
            <NcInputNumber
              className="w-full"
              defaultValue={guestChildrenInputValue}
              onChange={(value) => handleChangeData(value, 'guestChildren')}
              max={4}
              label={childrenText}
              description={childrenDescriptionText}
              inputName="guestChildren"
            />
            <NcInputNumber
              className="w-full"
              defaultValue={guestRoomsInputValue}
              onChange={(value) => handleChangeData(value, 'guestRooms')}
              max={10}
              min={1}
              label={roomsText}
              description={roomsDescriptionText}
              inputName="guestRooms"
            />
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}
