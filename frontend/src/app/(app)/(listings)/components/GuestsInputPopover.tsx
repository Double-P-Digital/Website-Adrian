'use client'

import NcInputNumber from '@/components/NcInputNumber'
import { useT } from '@/hooks/useT'
import { GuestsObject } from '@/type'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { UserPlusIcon } from '@heroicons/react/24/outline'
import { FC, useState, useEffect, useRef } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Props {
  className?: string
  defaultGuests?: GuestsObject
}

const GuestsInputPopover: FC<Props> = ({ className = 'flex-1', defaultGuests }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const isUpdatingFromUser = useRef(false)
  
  // Try to get guests from URL first, then from props, then use defaults
  const urlGuestAdults = searchParams.get('guestAdults')
  const urlGuestChildren = searchParams.get('guestChildren')
  const urlGuestRooms = searchParams.get('guestRooms')
  
  const initialAdults = defaultGuests?.guestAdults ?? (urlGuestAdults ? Number(urlGuestAdults) : 1)
  const initialChildren = defaultGuests?.guestChildren ?? (urlGuestChildren ? Number(urlGuestChildren) : 0)
  const initialRooms = defaultGuests?.guestRooms ?? (urlGuestRooms ? Number(urlGuestRooms) : 1)
  
  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(initialAdults)
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(initialChildren)
  const [guestRoomsInputValue, setGuestRoomsInputValue] = useState(initialRooms)

  // Sincronizează cu datele din URL/props când se schimbă
  useEffect(() => {
    // Ignoră sincronizarea dacă actualizarea vine de la utilizator
    if (isUpdatingFromUser.current) {
      isUpdatingFromUser.current = false
      return
    }
    
    const urlGuestAdults = searchParams.get('guestAdults')
    const urlGuestChildren = searchParams.get('guestChildren')
    const urlGuestRooms = searchParams.get('guestRooms')
    
    if (urlGuestAdults) {
      setGuestAdultsInputValue(Number(urlGuestAdults))
    } else if (defaultGuests?.guestAdults !== undefined) {
      setGuestAdultsInputValue(defaultGuests.guestAdults)
    }
    
    if (urlGuestChildren) {
      setGuestChildrenInputValue(Number(urlGuestChildren))
    } else if (defaultGuests?.guestChildren !== undefined) {
      setGuestChildrenInputValue(defaultGuests.guestChildren)
    }
    
    if (urlGuestRooms) {
      setGuestRoomsInputValue(Number(urlGuestRooms))
    } else if (defaultGuests?.guestRooms !== undefined) {
      setGuestRoomsInputValue(defaultGuests.guestRooms)
    }
  }, [searchParams, defaultGuests])

  const T = useT()

  const handleChangeData = (value: number, type: keyof GuestsObject) => {
    // Marchează că actualizarea vine de la utilizator
    isUpdatingFromUser.current = true
    
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
    
    // Actualizează URL-ul pentru sincronizare
    const params = new URLSearchParams(searchParams.toString())
    params.set('guestAdults', newValue.guestAdults.toString())
    params.set('guestChildren', newValue.guestChildren.toString())
    params.set('guestRooms', newValue.guestRooms.toString())
    router.push(`?${params.toString()}`, { scroll: false })
  }

  const totalGuests = guestChildrenInputValue + guestAdultsInputValue // Rooms are not included in total guests
  return (
    <Popover className={`relative flex ${className}`}>
      {({ open }) => (
        <>
          <div className={`flex flex-1 items-center rounded-b-3xl focus:outline-hidden ${open ? 'shadow-lg' : ''}`}>
            <PopoverButton className="relative z-10 flex flex-1 cursor-pointer items-center gap-x-3 p-3 text-start focus:outline-hidden">
              <div className="text-neutral-300 dark:text-neutral-400">
                <UserPlusIcon className="h-5 w-5 lg:h-7 lg:w-7" />
              </div>
              <div className="grow">
                <span className="block font-semibold xl:text-lg">
                  {totalGuests || ''} {T['HeroSearchForm']['Guests']}
                </span>
                <span className="mt-1 block text-sm leading-none font-light text-neutral-400">
                  {totalGuests ? T['HeroSearchForm']['Guests'] : T['HeroSearchForm']['Add guests']}
                </span>
              </div>
            </PopoverButton>
          </div>

          <PopoverPanel
            transition
            unmount={false}
            className="absolute end-0 top-full z-10 mt-3 w-full rounded-3xl bg-white px-4 py-5 shadow-xl ring-1 ring-black/5 transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 sm:min-w-[340px] sm:px-8 sm:py-6 dark:bg-neutral-800"
          >
            <NcInputNumber
              className="w-full"
              defaultValue={guestAdultsInputValue}
              onChange={(value) => handleChangeData(value, 'guestAdults')}
              inputName="guestAdults"
              max={10}
              min={1}
              label={T['HeroSearchForm']['Adults']}
              description={T['HeroSearchForm']['Ages 13 or above']}
            />
            <NcInputNumber
              className="mt-6 w-full"
              defaultValue={guestChildrenInputValue}
              onChange={(value) => handleChangeData(value, 'guestChildren')}
              inputName="guestChildren"
              max={4}
              label={T['HeroSearchForm']['Children']}
              description={T['HeroSearchForm']['Ages 2–12']}
            />

            <NcInputNumber
              className="mt-6 w-full"
              defaultValue={guestRoomsInputValue}
              onChange={(value) => handleChangeData(value, 'guestRooms')}
              inputName="guestRooms"
              max={10}
              min={1}
              label={T['HeroSearchForm']['Rooms']}
              description={T['HeroSearchForm']['Number of rooms']}
            />
          </PopoverPanel>
        </>
      )}
    </Popover>
  )
}

export default GuestsInputPopover
