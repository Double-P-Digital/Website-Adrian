'use client'

import { Button } from '@/shared/Button'
import ButtonClose from '@/shared/ButtonClose'
import ButtonPrimary from '@/shared/ButtonPrimary'
import T from '@/utils/getT'
import { CloseButton, Dialog, DialogPanel } from '@headlessui/react'
import React, { FC, useState } from 'react'
import DatePicker from 'react-datepicker'
import DatePickerCustomDay from './DatePickerCustomDay'
import DatePickerCustomHeaderTwoMonth from './DatePickerCustomHeaderTwoMonth'

interface Props {
  triggerButton?: (p: { openModal: () => void }) => React.ReactNode
  onChange?: (dates: [Date | null, Date | null]) => void
}

const ModalSelectDate: FC<Props> = ({ triggerButton, onChange }) => {
  const [showModal, setShowModal] = useState(false)

  // Folosește data curentă ca check-in și data curentă + 1 zi ca check-out (minim 1 noapte)
  const getDefaultDates = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    return { today, tomorrow }
  }
  
  const { today, tomorrow } = getDefaultDates()
  const [startDate, setStartDate] = useState<Date | null>(today)
  const [endDate, setEndDate] = useState<Date | null>(tomorrow)
  const [validationError, setValidationError] = useState<string | null>(null)

  const onChangeDate = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayOnly = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    
    setValidationError(null)
    
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
      // Dacă se selectează ambele date deodată (nu ar trebui să se întâmple, dar gestionăm)
      if (start && end) {
        const startDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const endDateOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate())
        
        // Verifică explicit că check-in și check-out nu sunt aceeași dată
        if (startDateOnly.getTime() === endDateOnly.getTime()) {
          setStartDate(start)
          setEndDate(null)
          setValidationError('Check-out trebuie să fie cel puțin cu o zi după check-in (minim 1 noapte)')
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
          setValidationError('Check-out trebuie să fie cel puțin cu o zi după check-in (minim 1 noapte)')
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
          setValidationError('Check-out trebuie să fie cel puțin cu o zi după check-in (minim 1 noapte)')
          return
        }
        
        const diffTime = endDateOnly.getTime() - startDateOnly.getTime()
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays >= 1) {
          setEndDate(end)
        } else {
          setEndDate(null)
          setValidationError('Check-out trebuie să fie cel puțin cu o zi după check-in (minim 1 noapte)')
        }
        return
      }
      // Dacă se selectează o nouă dată
      if (start && !end) {
        const selectedDateOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate())
        const currentStartDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        
        // Verifică dacă data selectată este în trecut
        if (selectedDateOnly < todayOnly) {
          setStartDate(today)
          setEndDate(null)
          return
        }
        
        // Dacă data selectată este înainte de check-in-ul curent, devine noul check-in
        // Dacă data selectată este după check-in-ul curent, devine noul check-in (și utilizatorul poate selecta check-out după)
        // Orice dată selectată devine noul check-in
        setStartDate(start)
        setEndDate(null)
        return
      }
    }
    
    // 3. Dacă există deja un interval complet (check-in și check-out)
    // Orice dată selectată devine automat noul check-in (resetează check-out-ul)
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
        
        // Orice dată selectată devine noul check-in (indiferent dacă este înainte, în interval sau după)
        setStartDate(start)
        setEndDate(null) // Resetează check-out-ul pentru a permite selectarea unui nou check-out
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
          setValidationError('Check-out trebuie să fie cel puțin cu o zi după check-in (minim 1 noapte)')
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
        setValidationError('Check-out trebuie să fie cel puțin cu o zi după check-in (minim 1 noapte)')
      }
    } else {
      setEndDate(null)
    }
  }
  
  // Calculează data minimă pentru check-out (check-in + 1 zi)
  const getMinEndDate = (): Date | null => {
    if (!startDate) return null
    const minDate = new Date(startDate)
    minDate.setDate(minDate.getDate() + 1)
    return minDate
  }

  function closeModal() {
    setShowModal(false)
  }
  function openModal() {
    setShowModal(true)
  }

  const renderButtonOpenModal = () => {
    return triggerButton ? (
      triggerButton({ openModal })
    ) : (
      <button onClick={openModal}>{T['common']['Select Date']}</button>
    )
  }

  return (
    <>
      {renderButtonOpenModal()}
      <Dialog className="relative z-50" onClose={closeModal} open={showModal}>
        <div className="fixed inset-0 bg-neutral-300 dark:bg-neutral-900">
          <DialogPanel
            transition
            className="relative flex size-full flex-col transition data-closed:translate-y-40 data-closed:opacity-0"
          >
            <div className="absolute start-4 top-4">
              <CloseButton color="light" as={ButtonClose}></CloseButton>
            </div>

            <div className="flex flex-1 overflow-hidden bg-white p-1 pt-16 dark:bg-neutral-800">
              <div className="flex flex-1 flex-col overflow-auto">
                <div className="p-5 text-xl font-semibold sm:text-2xl">{`When's your trip?`}</div>
                {validationError && (
                  <div className="mx-5 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                    {validationError}
                  </div>
                )}
                <div className="relative z-10 flex flex-1 px-2 py-5 sm:p-5">
                  <DatePicker
                    selected={startDate}
                    onChange={onChangeDate}
                    startDate={startDate}
                    endDate={endDate}
                    minDate={new Date()} // Nu permite selectarea datelor din trecut
                    selectsRange
                    monthsShown={2}
                    showPopperArrow={false}
                    inline
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
                      // Utilizatorul poate selecta o dată înainte de check-in-ul curent (devine noul check-in)
                      // sau o dată după check-in-ul curent (devine noul check-in, apoi poate selecta check-out)
                      if (startDate && !endDate) {
                        const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                        
                        // Nu permite selectarea aceleiași zile ca check-in
                        if (currentDate.getTime() === startDateOnly.getTime()) {
                          return false
                        }
                        
                        // Permite selectarea oricărei date valide (>= today) care nu este aceeași cu check-in
                        return currentDate >= todayOnly
                      }
                      
                      // 3. Dacă există interval complet, permite selectarea oricărei date valide (>= today)
                      // Orice dată selectată va deveni noul check-in
                      if (startDate && endDate) {
                        // Permite selectarea oricărei date valide (>= today)
                        return currentDate >= todayOnly
                      }
                      
                      return true
                    }}
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
            </div>

            <div className="mt-auto flex justify-between border-t border-neutral-200 bg-white px-4 py-3 dark:border-neutral-700 dark:bg-neutral-900">
              <Button
                type="button"
                className="shrink-0 font-semibold underline"
                plain
                onClick={() => {
                  onChangeDate([null, null])
                }}
              >
                {T['common']['Clear dates']}
              </Button>
              <ButtonPrimary
                onClick={() => {
                  // Validare finală: verifică că există minim o noapte
                  if (startDate && endDate) {
                    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
                    const diffTime = endDateOnly.getTime() - startDateOnly.getTime()
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
                    
                    if (diffDays >= 1) {
                      onChange?.([startDate, endDate])
                      closeModal()
                    }
                    // Dacă nu e valid, nu face nimic (utilizatorul trebuie să selecteze corect)
                  } else if (!startDate && !endDate) {
                    // Permite clear
                    onChange?.([null, null])
                    closeModal()
                  }
                }}
                disabled={startDate && endDate ? (() => {
                  const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
                  const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
                  const diffTime = endDateOnly.getTime() - startDateOnly.getTime()
                  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
                  return diffDays < 1
                })() : false}
              >
                {T['common']['Save']}
              </ButtonPrimary>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    </>
  )
}

export default ModalSelectDate
