'use client'

import NcInputNumber from '@/components/NcInputNumber'
import { GuestsObject } from '@/type'
import T from '@/utils/getT'
import clsx from 'clsx'
import { FC, useEffect, useState } from 'react'

interface Props {
  defaultValue?: GuestsObject
  onChange?: (data: GuestsObject) => void
  className?: string
}

const GuestsInput: FC<Props> = ({ defaultValue, onChange, className }) => {
  const [guestAdultsInputValue, setGuestAdultsInputValue] = useState(defaultValue?.guestAdults ?? 1)
  const [guestChildrenInputValue, setGuestChildrenInputValue] = useState(defaultValue?.guestChildren ?? 0)
  const [guestRoomsInputValue, setGuestRoomsInputValue] = useState(defaultValue?.guestRooms ?? 1)

  useEffect(() => {
    setGuestAdultsInputValue(defaultValue?.guestAdults ?? 1)
  }, [defaultValue?.guestAdults])
  useEffect(() => {
    setGuestChildrenInputValue(defaultValue?.guestChildren ?? 0)
  }, [defaultValue?.guestChildren])
  useEffect(() => {
    setGuestRoomsInputValue(defaultValue?.guestRooms ?? 1)
  }, [defaultValue?.guestRooms])

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
    onChange && onChange(newValue)
  }

  return (
    <div className={clsx(`relative flex flex-col`, className)}>
      <h3 className="mb-5 block text-xl font-semibold sm:text-2xl">{T['HeroSearchForm']["Who's coming?"]}</h3>
      <NcInputNumber
        className="w-full"
        defaultValue={guestAdultsInputValue}
        onChange={(value) => handleChangeData(value, 'guestAdults')}
        max={20}
        label={T['HeroSearchForm']['Adults']}
        description={T['HeroSearchForm']['Ages 13 or above']}
        inputName="guestAdults"
      />
      <NcInputNumber
        className="mt-6 w-full"
        defaultValue={guestChildrenInputValue}
        onChange={(value) => handleChangeData(value, 'guestChildren')}
        max={20}
        label={T['HeroSearchForm']['Children']}
        description={T['HeroSearchForm']['Ages 2–12']}
        inputName="guestChildren"
      />

      <NcInputNumber
        className="mt-6 w-full"
        defaultValue={guestRoomsInputValue}
        onChange={(value) => handleChangeData(value, 'guestRooms')}
        max={10}
        min={1}
        label={T['HeroSearchForm']['Rooms']}
        description={T['HeroSearchForm']['Number of rooms']}
        inputName="guestRooms"
      />
    </div>
  )
}

export default GuestsInput
