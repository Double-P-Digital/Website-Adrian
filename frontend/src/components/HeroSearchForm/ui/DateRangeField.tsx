'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerCustomHeaderTwoMonth from '@/components/DatePickerCustomHeaderTwoMonth'
import { useT } from '@/hooks/useT'
import { Popover, PopoverButton, PopoverPanel } from '@headlessui/react'
import { CalendarIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC, useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import { useSearchParams } from 'next/navigation'
import { ClearDataButton } from './ClearDataButton'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils'

const styles = {
  button: {
    base: 'relative z-10 shrink-0 w-full cursor-pointer flex items-center gap-x-3 focus:outline-hidden text-start',
    focused: 'rounded-full bg-transparent focus-visible:outline-hidden dark:bg-white/5 custom-shadow-1',
    default: 'px-7 py-4 xl:px-8 xl:py-6',
    small: 'py-3 px-7 xl:px-8',
  },
  mainText: {
    default: 'text-base xl:text-lg',
    small: 'text-base',
  },
  panel: {
    base: 'absolute top-full z-10 mt-3 w-3xl transition duration-150 data-closed:translate-y-1 data-closed:opacity-0 start-1/2 -translate-x-1/2 overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-black/5 dark:bg-neutral-800',
    default: '',
    small: '',
  },
}

interface Props {
  className?: string
  fieldStyle: 'default' | 'small'
  clearDataButtonClassName?: string
  description?: string
  panelClassName?: string
  isOnlySingleDate?: boolean
}

export const DateRangeField: FC<Props> = ({
  className = 'flex-1',
  fieldStyle = 'default',
  clearDataButtonClassName,
  description = `check-in - check-out`,
  panelClassName,
  isOnlySingleDate = false,
}) => {
  const searchParams = useSearchParams()
  
  // Use current date as check-in and current date + 1 day as check-out (minimum 1 night)
  const getDefaultDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { today, tomorrow }
  }
  
  // Read dates from URL on mount
  const getInitialDates = () => {
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    const { today, tomorrow } = getDefaultDates()
    
    if (checkin) {
      const checkinDate = new Date(checkin)
      checkinDate.setHours(0, 0, 0, 0)
      if (checkout) {
        const checkoutDate = new Date(checkout)
        checkoutDate.setHours(0, 0, 0, 0)
        return { startDate: checkinDate, endDate: checkoutDate }
      }
      return { startDate: checkinDate, endDate: tomorrow }
    }
    return { startDate: today, endDate: tomorrow }
  }
  
  const initialDates = getInitialDates()
  const [startDate, setStartDate] = useState<Date | null>(initialDates.startDate)
  const [endDate, setEndDate] = useState<Date | null>(initialDates.endDate)
  const T = useT();
  
  // Update dates when URL changes
  useEffect(() => {
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    const { today, tomorrow } = getDefaultDates()
    
    if (checkin) {
      const checkinDate = new Date(checkin)
      checkinDate.setHours(0, 0, 0, 0)
      setStartDate(checkinDate)
      
      if (checkout) {
        const checkoutDate = new Date(checkout)
        checkoutDate.setHours(0, 0, 0, 0)
        setEndDate(checkoutDate)
      } else {
        setEndDate(tomorrow)
      }
    } else {
      setStartDate(today)
      setEndDate(tomorrow)
    }
  }, [searchParams])

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Comportament ca booking.com:
    // 1. Dacă nu există niciun interval selectat
    if (!startDate && !endDate) {
      // Prima dată selectată devine check-in
      if (start && !end) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        if (startDateOnly < todayOnly) {
          setStartDate(today)
        } else {
          setStartDate(start)
        }
        setEndDate(null)
        return
      }
      // Dacă se selectează ambele date deodată
      if (start && end) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
        
        // Verifică explicit că check-in și check-out nu sunt aceeași dată
        if (startDateOnly.getTime() === endDateOnly.getTime()) {
          setStartDate(start)
          setEndDate(null)
          return
        }
        
        if (startDateOnly < todayOnly) {
          setStartDate(today)
        } else {
          setStartDate(start)
        }
        
        const actualStart = startDateOnly < todayOnly ? todayOnly : startDateOnly
        const diffTime = endDateOnly.getTime() - actualStart.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 1) {
          setEndDate(end)
        } else {
          setEndDate(null)
        }
        return
      }
    }
    
    // 2. Dacă există doar check-in selectat (se așteaptă check-out)
    if (startDate && !endDate) {
      if (start && end) {
        // S-a selectat check-out
        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
        
        // Verifică explicit că check-in și check-out nu sunt aceeași dată
        if (startDateOnly.getTime() === endDateOnly.getTime()) {
          setEndDate(null)
          return
        }
        
        const diffTime = endDateOnly.getTime() - startDateOnly.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 1) {
          setEndDate(end)
        } else {
          setEndDate(null)
        }
        return
      }
      // Dacă se selectează o nouă dată
      if (start && !end) {
        const selectedDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        
        // Verifică dacă data selectată este în trecut
        if (selectedDateOnly < todayOnly) {
          setStartDate(today)
          setEndDate(null)
          return
        }
        
        // Orice dată selectată >= data curentă devine noul check-in
        setStartDate(start)
        setEndDate(null)
        return
      }
    }
    
    // 3. Dacă există deja un interval complet (check-in și check-out)
    // Orice dată selectată >= data curentă devine automat noul check-in (resetează check-out-ul)
    if (startDate && endDate) {
      // Dacă se selectează o dată nouă
      if (start && !end) {
        const selectedDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        
        // Verifică dacă data selectată este în trecut
        if (selectedDateOnly < todayOnly) {
          setStartDate(today)
          setEndDate(null)
          return
        }
        
        // Orice dată selectată >= data curentă devine noul check-in
        setStartDate(start)
        setEndDate(null)
        return
      }
      
      // Dacă se selectează ambele date (interval nou)
      if (start && end) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
        
        if (startDateOnly < todayOnly) {
          setStartDate(today)
        } else {
          setStartDate(start)
        }
        
        const actualStart = startDateOnly < todayOnly ? todayOnly : startDateOnly
        const diffTime = endDateOnly.getTime() - actualStart.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 1) {
          setEndDate(end)
        } else {
          setEndDate(null)
        }
        return
      }
    }
    
    // Fallback: gestionează cazurile standard
    if (start) {
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      if (startDateOnly < todayOnly) {
        setStartDate(today)
      } else {
        setStartDate(start)
      }
    } else {
      setStartDate(null)
    }
    
    if (end) {
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      const currentStart = startDate || today
      const currentStartOnly = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate())
      const diffTime = endDateOnly.getTime() - currentStartOnly.getTime()
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays >= 1) {
        setEndDate(end)
      } else {
        setEndDate(null)
      }
    } else {
      setEndDate(null)
    }
  }

  return (
    <>
      <Popover className={`group relative z-10 flex ${className}`}>
        {({ open: showPopover }) => (
          <>
            <PopoverButton
              className={clsx(styles.button.base, styles.button[fieldStyle], showPopover && styles.button.focused)}
            >
              {fieldStyle === 'default' && (
                <CalendarIcon className="size-5 text-neutral-300 lg:size-7 dark:text-neutral-400" />
              )}

              <div className="flex-1 text-start">
                <span className={clsx('block font-semibold', styles.mainText[fieldStyle])}>
                  {startDate?.toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                  }) || T['HeroSearchForm']['Add dates']}
                  {endDate && !isOnlySingleDate
                    ? ' - ' +
                      endDate?.toLocaleDateString('en-US', {
                        month: 'short',
                        day: '2-digit',
                      })
                    : ''}
                </span>
                <span className="mt-1 block text-sm leading-none font-light text-neutral-400">
                  {T.HeroSearchForm.CheckIn +" - "+  T.HeroSearchForm.CheckOut|| T['HeroSearchForm']['Add dates']}
                </span>
              </div>
            </PopoverButton>

            <ClearDataButton
              className={clsx(!startDate && !endDate && 'sr-only', clearDataButtonClassName)}
              onClick={() => {
                setStartDate(null)
                setEndDate(null)
              }}
            />

            <PopoverPanel
              unmount={false}
              transition
              className={clsx(panelClassName, styles.panel.base, styles.panel[fieldStyle])}
            >
              {isOnlySingleDate ? (
                <DatePicker
                  selected={startDate}
                  onChange={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    if (date && date < today) {
                      setStartDate(today)
                      setEndDate(new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000))
                    } else {
                      setStartDate(date)
                      setEndDate(new Date((date?.getTime() || 0) + 2 * 24 * 60 * 60 * 1000))
                    }
                  }}
                  startDate={startDate}
                  minDate={new Date()}
                  filterDate={(date) => {
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    return currentDate >= today
                  }}
                  monthsShown={2}
                  showPopperArrow={false}
                  inline
                  renderCustomHeader={(p) => <DatePickerCustomHeaderTwoMonth {...p} />}
                  renderDayContents={(day, date) => <DatePickerCustomDay dayOfMonth={day} date={date} />}
                />
              ) : (
                <DatePicker
                  selected={startDate}
                  onChange={onChangeDate}
                  startDate={startDate}
                  endDate={endDate}
                  minDate={new Date()}
                  selectsRange
                  filterDate={(date) => {
                    // Nu permite selectarea datelor din trecut
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
                    const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
                    
                    if (currentDate < todayOnly) {
                      return false
                    }
                    
                    // Comportament ca booking.com:
                    // 1. Dacă nu există niciun interval, permite toate datele viitoare
                    if (!startDate && !endDate) {
                      return true
                    }
                    
                    // 2. Dacă există doar check-in, permite selectarea oricărei date valide (>= today)
                    // Dar nu permite selectarea aceleiași zile ca check-in pentru check-out
                    if (startDate && !endDate) {
                      const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                      
                      // Nu permite selectarea aceleiași zile ca check-in
                      if (currentDate.getTime() === startDateOnly.getTime()) {
                        return false
                      }
                      
                      return true
                    }
                    
                    // 3. Dacă există interval complet, permite selectarea oricărei date valide (>= today)
                    if (startDate && endDate) {
                      return true
                    }
                    
                    return true
                  }}
                  monthsShown={2}
                  showPopperArrow={false}
                  inline
                  renderCustomHeader={(p) => <DatePickerCustomHeaderTwoMonth {...p} />}
                  renderDayContents={(day, date) => (
                    <DatePickerCustomDay 
                      dayOfMonth={day} 
                      date={date} 
                      startDate={startDate}
                      endDate={endDate}
                    />
                  )}
                />
              )}
            </PopoverPanel>
          </>
        )}
      </Popover>

      {/* input:hidde */}
      <input type="hidden" name="checkin" value={startDate ? formatDateToYYYYMMDD(startDate) : ''} />
      {!isOnlySingleDate && (
        <input type="hidden" name="checkout" value={endDate ? formatDateToYYYYMMDD(endDate) : ''} />
      )}
    </>
  )
}
