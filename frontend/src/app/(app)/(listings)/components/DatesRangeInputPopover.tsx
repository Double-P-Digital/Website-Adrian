'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerCustomHeaderTwoMonth from '@/components/DatePickerCustomHeaderTwoMonth'
import T from '@/utils/getT'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { FC, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { useSearchParams, useRouter } from 'next/navigation'
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '@/utils/dateUtils'

interface Props {
  className?: string
  defaultStartDate?: Date | null
  defaultEndDate?: Date | null
}

const DatesRangeInputPopover: FC<Props> = ({ className = 'flex-1', defaultStartDate, defaultEndDate }) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Use current date as check-in and current date + 1 day as check-out (minimum 1 night) if no dates provided
  const getDefaultDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { today, tomorrow }
  }
  
  // Try to get dates from URL first, then from props, then use defaults
  const urlCheckin = searchParams.get('checkin')
  const urlCheckout = searchParams.get('checkout')
  const initialStartDate = defaultStartDate || (urlCheckin ? new Date(urlCheckin) : null)
  const initialEndDate = defaultEndDate || (urlCheckout ? new Date(urlCheckout) : null)
  
  const { today, tomorrow } = getDefaultDates()
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate || today)
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate || tomorrow)

  // Sincronizează cu datele din URL/props când se schimbă
  useEffect(() => {
    const urlCheckin = searchParams.get('checkin')
    const urlCheckout = searchParams.get('checkout')
    
    // Calculează datele default doar când sunt necesare (nu în dependențe)
    const getToday = () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      return today
    }
    
    const getTomorrow = () => {
      const today = getToday()
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)
      return tomorrow
    }
    
    if (urlCheckin) {
      setStartDate(parseYYYYMMDDToDate(urlCheckin))
    } else if (defaultStartDate) {
      setStartDate(defaultStartDate)
    } else {
      setStartDate(getToday())
    }
    
    if (urlCheckout) {
      setEndDate(parseYYYYMMDDToDate(urlCheckout))
    } else if (defaultEndDate) {
      setEndDate(defaultEndDate)
    } else if (urlCheckin || defaultStartDate) {
      // Dacă există check-in dar nu check-out, setează check-out la check-in + 1 zi
      const currentStart = urlCheckin ? parseYYYYMMDDToDate(urlCheckin) : (defaultStartDate || getToday())
      const nextDay = new Date(currentStart)
      nextDay.setDate(nextDay.getDate() + 1)
      setEndDate(nextDay)
    } else {
      setEndDate(getTomorrow())
    }
  }, [searchParams, defaultStartDate, defaultEndDate]) // Eliminat today și tomorrow din dependențe
  //

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    
    // Actualizează URL-ul pentru sincronizare cu calendarul mare
    if (start && end) {
      const params = new URLSearchParams(searchParams.toString())
      const startStr = formatDateToYYYYMMDD(start)
      const endStr = formatDateToYYYYMMDD(end)
      
      // Actualizează doar dacă datele sunt diferite
      if (params.get('checkin') !== startStr || params.get('checkout') !== endStr) {
        params.set('checkin', startStr)
        params.set('checkout', endStr)
        router.push(`?${params.toString()}`, { scroll: false })
      }
    } else if (start) {
      // Dacă doar check-in este selectat, actualizează doar check-in
      const params = new URLSearchParams(searchParams.toString())
      const startStr = formatDateToYYYYMMDD(start)
      
      if (params.get('checkin') !== startStr) {
        params.set('checkin', startStr)
        params.delete('checkout')
        router.push(`?${params.toString()}`, { scroll: false })
      }
    }
  }

  const renderInput = () => {
    return (
      <>
        <div className="text-neutral-300 dark:text-neutral-400">
          <CalendarIcon className="h-5 w-5 lg:h-7 lg:w-7" />
        </div>
        <div className="grow text-start">
          <span className="block font-semibold xl:text-lg">
            {startDate?.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
            }) || 'Add dates'}
            {endDate
              ? ' - ' +
                endDate?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: '2-digit',
                })
              : ''}
          </span>
          <span className="mt-1 block text-sm leading-none font-light text-neutral-400">
            {T['HeroSearchForm']['CheckIn']} - {T['HeroSearchForm']['CheckOut']}
          </span>
        </div>
      </>
    )
  }

  return (
    <>
      <Popover className={`group relative z-10 flex ${className}`}>
        {({ open }) => (
          <>
            <PopoverButton className="relative flex flex-1 cursor-pointer items-center gap-x-3 p-3 group-data-open:shadow-lg focus:outline-hidden">
              {renderInput()}
              {startDate && open && (
                <span
                  className={
                    'absolute end-1 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full bg-neutral-100 text-sm lg:end-3 lg:h-6 lg:w-6 dark:bg-neutral-800'
                  }
                >
                  <XMarkIcon className="size-4" />
                </span>
              )}
            </PopoverButton>

            <PopoverPanel
              transition
              className="absolute start-auto -end-2 top-full z-10 mt-3 w-[calc(100%+1rem)] transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 lg:w-3xl xl:-end-10"
            >
              <div className="overflow-hidden rounded-3xl bg-white py-5 shadow-lg ring-1 ring-black/5 sm:p-8 dark:bg-neutral-800">
                <DatePicker
                  selected={startDate}
                  onChange={onChangeDate}
                  startDate={startDate}
                  endDate={endDate}
                  selectsRange
                  minDate={new Date()}
                  filterDate={(date) => {
                    // Nu permite selectarea datelor din trecut
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    
                    if (currentDate < todayOnly) {
                      return false
                    }
                    
                    // Dacă există check-in, nu permite selectarea aceleiași zile pentru check-out
                    if (startDate && !endDate) {
                      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                      if (currentDate.getTime() === startDateOnly.getTime()) {
                        return false
                      }
                    }
                    
                    return true
                  }}
                  monthsShown={2}
                  showPopperArrow={false}
                  inline
                  renderCustomHeader={(p) => <DatePickerCustomHeaderTwoMonth {...p} />}
                  renderDayContents={(day, date) => <DatePickerCustomDay dayOfMonth={day} date={date} />}
                />
              </div>
            </PopoverPanel>
          </>
        )}
      </Popover>

      {/* inputs */}
      <input type="hidden" name="startDate" value={startDate ? startDate.toISOString() : ''} />
      <input type="hidden" name="endDate" value={endDate ? endDate.toISOString() : ''} />
    </>
  )
}

export default DatesRangeInputPopover
