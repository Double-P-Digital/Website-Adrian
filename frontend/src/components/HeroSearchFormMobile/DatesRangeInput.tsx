'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerCustomHeaderTwoMonth from '@/components/DatePickerCustomHeaderTwoMonth'
import T from '@/utils/getT'
import clsx from 'clsx'
import { FC, useState } from 'react'
import DatePicker from 'react-datepicker'
import { formatDateToYYYYMMDD } from '@/utils/dateUtils'

interface Props {
  className?: string
  onChange?: (value: [Date | null, Date | null]) => void
  defaultStartDate?: Date | null
  defaultEndDate?: Date | null
}

const StayDatesRangeInput: FC<Props> = ({ className, defaultEndDate, defaultStartDate, onChange }) => {
  // Use current date as check-in and current date + 1 day as check-out (minimum 1 night)
  const getDefaultDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { today, tomorrow }
  }
  
  const { today, tomorrow } = getDefaultDates()
  const [startDate, setStartDate] = useState<Date | null>(defaultStartDate || today)
  const [endDate, setEndDate] = useState<Date | null>(defaultEndDate || tomorrow)

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    // Validări similare cu desktop-ul
    let newStart: Date | null = null
    let newEnd: Date | null = null
    
    if (start) {
      const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
      if (startDateOnly < todayOnly) {
        newStart = today
      } else {
        newStart = start
      }
    }
    
    if (end) {
      const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
      const currentStart = newStart || startDate || today
      const currentStartOnly = new Date(currentStart.getFullYear(), currentStart.getMonth(), currentStart.getDate())
      
      // Verifică că check-out nu este în aceeași zi cu check-in
      if (endDateOnly.getTime() === currentStartOnly.getTime()) {
        newEnd = null
      } else {
        const diffTime = endDateOnly.getTime() - currentStartOnly.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 1) {
          newEnd = end
        } else {
          newEnd = null
        }
      }
    }
    
    setStartDate(newStart)
    setEndDate(newEnd)
    
    if (onChange) {
      onChange([newStart, newEnd])
    }
  }

  return (
    <>
      <div className={clsx(className)}>
        <h3 className="block text-center text-xl font-semibold sm:text-2xl">
          {T['HeroSearchForm']["When's your trip?"]}
        </h3>
        <div className="relative z-10 flex shrink-0 justify-center py-5">
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
            renderDayContents={(day, date) => (
              <DatePickerCustomDay 
                dayOfMonth={day} 
                date={date} 
                startDate={startDate}
                endDate={endDate}
              />
            )}
          />
        </div>
      </div>

      {/* input:hidde */}
      <input type="hidden" name="checkin" value={startDate ? formatDateToYYYYMMDD(startDate) : ''} />
      <input type="hidden" name="checkout" value={endDate ? formatDateToYYYYMMDD(endDate) : ''} />
    </>
  )
}

export default StayDatesRangeInput
