'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerCustomHeaderTwoMonth from '@/components/DatePickerCustomHeaderTwoMonth'
import { useT } from '@/hooks/useT'
import { CalendarIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { FC, useState, useEffect, useRef } from 'react'
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
  const T = useT()
  const [isOpen, setIsOpen] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)
  
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
    
    // Setează startDate din URL sau props sau default
    if (urlCheckin) {
      setStartDate(parseYYYYMMDDToDate(urlCheckin))
    } else if (defaultStartDate) {
      setStartDate(defaultStartDate)
    } else {
      setStartDate(getToday())
    }
    
    // Setează endDate din URL sau props sau default
    // Nu forțăm endDate = startDate + 1 zi dacă utilizatorul încă selectează
    if (urlCheckout) {
      setEndDate(parseYYYYMMDDToDate(urlCheckout))
    } else if (defaultEndDate) {
      setEndDate(defaultEndDate)
    } else if (!urlCheckin && !defaultStartDate) {
      // Doar dacă nu avem nici check-in setat, folosim default tomorrow
      setEndDate(getTomorrow())
    }
    // Altfel lăsăm endDate null pentru a permite selecția liberă
  }, [searchParams, defaultStartDate, defaultEndDate]) // Eliminat today și tomorrow din dependențe

  // Handle click outside - doar dacă ambele date sunt selectate
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        // Permite închiderea doar dacă ambele date sunt selectate
        if (startDate && endDate) {
          setIsOpen(false)
        }
        // Dacă doar check-in e selectat, nu închide popover-ul
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, startDate, endDate])

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    setStartDate(start)
    setEndDate(end)
    
    // Actualizează URL-ul doar când ambele date sunt selectate (intervalul complet)
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
      
      // Închide popover-ul când ambele date sunt selectate
      setIsOpen(false)
    }
    // Nu actualizăm URL-ul și nu închidem popover-ul când doar check-in este selectat
  }
  
  const handleTogglePopover = () => {
    // La deschidere, permite întotdeauna
    // La închidere, permite doar dacă ambele date sunt selectate
    if (!isOpen) {
      setIsOpen(true)
    } else if (startDate && endDate) {
      setIsOpen(false)
    }
    // Dacă e deschis și nu are ambele date, nu închide
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
      <div ref={popoverRef} className={`group relative z-10 flex ${className}`}>
        <button 
          type="button"
          onClick={handleTogglePopover}
          className={`relative flex flex-1 cursor-pointer items-center gap-x-3 p-3 focus:outline-hidden ${isOpen ? 'shadow-lg' : ''}`}
        >
          {renderInput()}
          {startDate && isOpen && (
            <span
              className={
                'absolute end-1 top-1/2 z-10 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full bg-neutral-100 text-sm lg:end-3 lg:h-6 lg:w-6 dark:bg-neutral-800'
              }
            >
              <XMarkIcon className="size-4" />
            </span>
          )}
        </button>

        {isOpen && (
          <div className="absolute start-auto -end-2 top-full z-10 mt-3 w-[calc(100%+1rem)] lg:w-3xl xl:-end-10">
            <div className="overflow-hidden rounded-3xl bg-white py-5 shadow-lg ring-1 ring-black/5 sm:p-8 dark:bg-neutral-800">
              {/* Mesaj de avertizare când doar check-in e selectat */}
              {startDate && !endDate && (
                <div className="mb-4 rounded-lg bg-amber-50 p-3 text-center text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  {T['Booking']?.['Select checkout date'] || 'Selectează data de check-out pentru a continua'}
                </div>
              )}
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
          </div>
        )}
      </div>

      {/* inputs */}
      <input type="hidden" name="startDate" value={startDate ? formatDateToYYYYMMDD(startDate) : ''} />
      <input type="hidden" name="endDate" value={endDate ? formatDateToYYYYMMDD(endDate) : ''} />
    </>
  )
}

export default DatesRangeInputPopover
