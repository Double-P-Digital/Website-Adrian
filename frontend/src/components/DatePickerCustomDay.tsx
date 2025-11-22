import { FC } from 'react'

interface Props {
  dayOfMonth: number
  date?: Date | undefined
  startDate?: Date | null
  endDate?: Date | null
}

const DatePickerCustomDay: FC<Props> = ({ dayOfMonth, date, startDate, endDate }) => {
  if (!date) {
    return <span className="react-datepicker__day_span">{dayOfMonth}</span>
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const currentDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  
  // Verifică dacă data este astăzi
  const isToday = currentDate.getTime() === todayOnly.getTime()
  
  // Verifică dacă data este în intervalul selectat
  let isInRange = false
  let isStartDate = false
  let isEndDate = false
  
  if (startDate && endDate) {
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    isStartDate = currentDate.getTime() === startDateOnly.getTime()
    isEndDate = currentDate.getTime() === endDateOnly.getTime()
    isInRange = currentDate >= startDateOnly && currentDate <= endDateOnly
  } else if (!startDate && endDate) {
    // Dacă nu există startDate dar există endDate, evidențiază intervalul de la today până la endDate
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
    isEndDate = currentDate.getTime() === endDateOnly.getTime()
    isInRange = currentDate >= todayOnly && currentDate <= endDateOnly
  }

  // Clase CSS pentru evidențiere
  let className = 'react-datepicker__day_span'
  
  if (isToday) {
    className += ' font-semibold text-blue-600 dark:text-blue-400'
  }
  
  if (isInRange) {
    className += ' bg-blue-100 dark:bg-blue-900/30'
  }
  
  if (isStartDate) {
    className += ' bg-blue-500 text-white dark:bg-blue-600 rounded-l-full'
  }
  
  if (isEndDate) {
    className += ' bg-blue-500 text-white dark:bg-blue-600 rounded-r-full'
  }

  return (
    <span className={className}>
      {dayOfMonth}
    </span>
  )
}

export default DatePickerCustomDay
