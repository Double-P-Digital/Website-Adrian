'use client'

import DatePickerCustomDay from '@/components/DatePickerCustomDay'
import DatePickerCustomHeaderTwoMonth from '@/components/DatePickerCustomHeaderTwoMonth'
import { Divider } from '@/shared/divider'
import { useState, useEffect, useRef } from 'react'
import DatePicker from 'react-datepicker'
import { useRouter, useSearchParams } from 'next/navigation'
import { SectionHeading, SectionSubheading } from './SectionHeading'
import { formatDateToYYYYMMDD, parseYYYYMMDDToDate } from '@/utils/dateUtils'

interface Props {
  defaultStartDate?: Date | null
  defaultEndDate?: Date | null
}

const SectionDateRange = ({ defaultStartDate, defaultEndDate }: Props) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  
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
  
  // Ref pentru a evita loop-ul când actualizăm URL-ul
  const isUpdatingFromUser = useRef(false)

  // Sincronizează cu datele din URL/props doar când se schimbă din exterior (nu din user interaction)
  useEffect(() => {
    // Ignoră sincronizarea dacă actualizarea vine de la utilizator
    if (isUpdatingFromUser.current) {
      isUpdatingFromUser.current = false
      return
    }
    
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
    
    // Actualizează doar dacă datele din URL sunt diferite de cele curente
    const currentStartStr = startDate ? formatDateToYYYYMMDD(startDate) : null
    const currentEndStr = endDate ? formatDateToYYYYMMDD(endDate) : null
    
    if (urlCheckin && urlCheckin !== currentStartStr) {
      setStartDate(parseYYYYMMDDToDate(urlCheckin))
    } else if (!urlCheckin && defaultStartDate && currentStartStr !== formatDateToYYYYMMDD(defaultStartDate)) {
      setStartDate(defaultStartDate)
    } else if (!urlCheckin && !defaultStartDate && !startDate) {
      setStartDate(getToday())
    }
    
    if (urlCheckout && urlCheckout !== currentEndStr) {
      setEndDate(parseYYYYMMDDToDate(urlCheckout))
    } else if (!urlCheckout && defaultEndDate && currentEndStr !== formatDateToYYYYMMDD(defaultEndDate)) {
      setEndDate(defaultEndDate)
    } else if (!urlCheckout && (urlCheckin || defaultStartDate || startDate)) {
      // Dacă există check-in dar nu check-out, setează check-out la check-in + 1 zi
      const currentStart = urlCheckin ? parseYYYYMMDDToDate(urlCheckin) : (defaultStartDate || startDate || getToday())
      const nextDay = new Date(currentStart)
      nextDay.setDate(nextDay.getDate() + 1)
      if (!endDate || formatDateToYYYYMMDD(endDate) !== formatDateToYYYYMMDD(nextDay)) {
        setEndDate(nextDay)
      }
    } else if (!urlCheckout && !defaultEndDate && !endDate) {
      setEndDate(getTomorrow())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, defaultStartDate, defaultEndDate])
  
  // Actualizează URL-ul când se schimbă datele pentru a sincroniza cu sidebar-ul
  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    
    // Marchează că actualizarea vine de la utilizator
    isUpdatingFromUser.current = true
    
    setStartDate(start)
    setEndDate(end)
    
    // Actualizează URL-ul pentru sincronizare cu sidebar-ul (doar când ambele date sunt selectate)
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

  return (
    <div className="listingSection__wrap">
      <div>
        <SectionHeading>Availability</SectionHeading>
        <SectionSubheading> Prices may increase on weekends or holidays</SectionSubheading>
      </div>
      <Divider className="w-14!" />

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
        renderCustomHeader={(props) => <DatePickerCustomHeaderTwoMonth {...props} />}
        renderDayContents={(day, date) => <DatePickerCustomDay dayOfMonth={day} date={date} />}
      />

      {/* inputs */}
      <input type="hidden" name="startDate" value={startDate ? startDate.toISOString() : ''} />
      <input type="hidden" name="endDate" value={endDate ? endDate.toISOString() : ''} />
    </div>
  )
}

export default SectionDateRange
