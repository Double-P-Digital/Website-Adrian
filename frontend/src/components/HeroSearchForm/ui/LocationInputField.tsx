'use client'

import { useInteractOutside } from '@/hooks/useInteractOutside'
import { Divider } from '@/shared/divider'
import { useT } from '@/hooks/useT'
import * as Headless from '@headlessui/react'
import { MapPinIcon } from '@heroicons/react/24/outline'
import {
  Location01Icon,
} from '@hugeicons/core-free-icons'
import { HugeiconsIcon, IconSvgElement } from '@hugeicons/react'
import clsx from 'clsx'
import _ from 'lodash'
import { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ClearDataButton } from './ClearDataButton'
import { getAllApartments } from '@/services/apartments'

type Suggest = {
  id: string
  name: string
  icon?: IconSvgElement
}

const styles = {
  button: {
    base: 'relative z-10 shrink-0 w-full cursor-pointer flex items-center gap-x-3 focus:outline-hidden text-start',
    focused: 'rounded-full bg-transparent focus-visible:outline-hidden dark:bg-white/5 custom-shadow-1',
    default: 'px-7 py-4 xl:px-8 xl:py-6',
    small: 'py-3 px-7 xl:px-8',
  },
  input: {
    base: 'block w-full truncate border-none bg-transparent p-0 font-semibold placeholder-neutral-800 focus:placeholder-neutral-300 focus:ring-0 focus:outline-hidden dark:placeholder-neutral-200',
    default: 'text-base xl:text-lg',
    small: 'text-base',
  },
  panel: {
    base: 'absolute start-0 top-full z-40 mt-3 hidden-scrollbar max-h-96  overflow-y-auto rounded-3xl bg-white py-3 shadow-xl transition duration-150 data-closed:translate-y-1 data-closed:opacity-0  dark:bg-neutral-800',
    default: 'w-lg sm:py-6',
    small: 'w-md sm:py-5',
  },
}

interface Props {
  placeholder?: string
  description?: string
  className?: string
  inputName?: string
  initSuggests?: Suggest[]
  searchingSuggests?: Suggest[]
  fieldStyle: 'default' | 'small'
}

export const LocationInputField: FC<Props> = ({
  placeholder: placeholderProp,
  description = "Where are you going?",
  className = 'flex-1',
  inputName = 'location',
  initSuggests,
  searchingSuggests,
  fieldStyle = 'default',
}) => {
  const T = useT();
  const searchParams = useSearchParams()
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [showPopover, setShowPopover] = useState(false)
  const [selected, setSelected] = useState<Suggest | null>(null)
  const [inputValue, setInputValue] = useState<string>('')
  const [cities, setCities] = useState<Suggest[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const [isMounted, setIsMounted] = useState(false)
  
  // Folosim placeholder tradus doar după mount pentru a evita hydration mismatch
  const [placeholder, setPlaceholder] = useState(placeholderProp || "Where to?")
  const [suggestedLocationsText, setSuggestedLocationsText] = useState("Suggested locations")
  
  useEffect(() => {
    setIsMounted(true)
    // Setează placeholder-ul tradus doar pe client
    if (!placeholderProp) {
      setPlaceholder(T.Aside["Where to?"] || "Where to?")
    }
    // Setează textul tradus pentru "Suggested locations" doar pe client
    setSuggestedLocationsText(T['HeroSearchForm']['Suggested locations'] || "Suggested locations")
  }, [T, placeholderProp])
  
  // Read city from URL and sync with state
  useEffect(() => {
    const city = searchParams.get('city')
    if (city) {
      // Only update if different from current value to avoid unnecessary re-renders
      if (inputValue !== city) {
        setSelected({
          id: `city-${city}`,
          name: city,
          icon: Location01Icon,
        })
        setInputValue(city)
      }
    }
    // Don't reset if no city in URL - user might be typing a new value
  }, [searchParams]) // Removed inputValue from deps to avoid infinite loop

  // Load cities from apartments
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true)
        const apartments = await getAllApartments()
        
        // Extract unique cities from apartments
        const cityMap = new Map<string, string>()
        apartments.forEach((apartment) => {
          let cityName: string | null = null
          
          // Prefer city field if available
          if (apartment.city) {
            cityName = apartment.city.trim()
          }   
          // Add to map if we found a valid city name
          if (cityName && cityName.length > 0) {
            const cityKey = cityName.toLowerCase()
            if (!cityMap.has(cityKey)) {
              cityMap.set(cityKey, cityName)
            }
          }
        })
        
        // Convert to Suggest format
        const citySuggests: Suggest[] = Array.from(cityMap.values())
          .sort()
          .map((city, index) => ({
            id: `city-${index}`,
            name: city,
            icon: Location01Icon,
          }))
        
        setCities(citySuggests)
      } catch (error) {
        setCities([])
      } finally {
        setIsLoadingCities(false)
      }
    }
    
    loadCities()
  }, [])

  useEffect(() => {
    const _inputFocusTimeOut = setTimeout(() => {
      if (showPopover && inputRef.current) {
        inputRef.current.focus()
      }
    }, 200)
    return () => {
      clearTimeout(_inputFocusTimeOut)
    }
  }, [showPopover])

  // for memoization of the close function
  const closePopover = useCallback(() => {
    setShowPopover(false)
  }, [])

  //  a custom hook that listens for clicks outside the container
  useInteractOutside(containerRef, closePopover)

  // Update inputValue immediately for real-time filtering
  const handleInputChangeImmediate = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value) // Update immediately for filtering
    setShowPopover(true)
  }, [])
  
  // Debounced handler for setting selected value
  const handleInputChangeDebounced = useMemo(
    () =>
      _.debounce((value: string) => {
        const trimmedValue = value.trim()
        // If the input has a value, set it as selected (allows custom city input)
        if (trimmedValue) {
          setSelected({
            id: `custom-${Date.now()}`, // Generate a unique id for custom input
            name: trimmedValue,
          })
        } else {
          // If input is empty, clear selection
          setSelected(null)
        }
      }, 300),
    []
  )
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleInputChangeImmediate(e)
    handleInputChangeDebounced(e.target.value)
  }, [handleInputChangeImmediate, handleInputChangeDebounced])
  
  // Handle Enter key to accept custom input
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputRef.current?.value) {
      const value = inputRef.current.value.trim()
      if (value) {
        setInputValue(value)
        setSelected({
          id: `custom-${Date.now()}`,
          name: value,
        })
        setShowPopover(false)
      }
    }
  }, [])

  // Handle blur - immediately set selected value to ensure it's captured before form submit
  const handleBlur = useCallback(() => {
    // Cancel any pending debounce
    handleInputChangeDebounced.cancel()
    
    // If there's input value but no selected, set it immediately
    const currentValue = inputRef.current?.value?.trim() || inputValue.trim()
    if (currentValue && (!selected?.name || selected.name !== currentValue)) {
      setSelected({
        id: `custom-${Date.now()}`,
        name: currentValue,
      })
      setInputValue(currentValue)
    }
  }, [handleInputChangeDebounced, inputValue, selected])
  useEffect(() => {
    return () => {
      handleInputChangeDebounced.cancel() // Cancel debounce when component unmounts
    }
  }, [handleInputChangeDebounced])

  // Filter cities based on input value
  const getFilteredCities = useCallback(() => {
    if (!inputValue || inputValue.trim() === '') {
      // If no input, show all cities
      return cities.length > 0 ? cities : (initSuggests || [])
    }
    
    // Filter cities that match the input (case-insensitive)
    const searchTerm = inputValue.toLowerCase().trim()
    const filtered = cities.filter((city) => 
      city.name.toLowerCase().includes(searchTerm)
    )
    
    return filtered
  }, [inputValue, cities, initSuggests])
  
  const isShowInitSuggests = !inputValue || inputValue.trim() === ''
  const suggestsToShow = getFilteredCities()
  
  // Hide popover if there are no suggestions to show
  const shouldShowPopover = showPopover && suggestsToShow.length > 0
  return (
    <div
      className={`group relative z-10 flex ${className}`}
      ref={containerRef}
      {...(showPopover && {
        'data-open': 'true',
      })}
    >
        <Headless.Combobox
        value={selected}
        onChange={(value) => {
          if (value) {
            setSelected(value)
            setInputValue(value.name)
          } else {
            setSelected({ id: '', name: '' })
            setInputValue('')
          }
          // Close the popover when a value is selected
          if (value?.id) {
            setShowPopover(false)
            setTimeout(() => {
              inputRef.current?.blur()
            }, 50)
          }
        }}
      >
        <div
          onMouseDown={() => setShowPopover(true)}
          onTouchStart={() => setShowPopover(true)}
          className={clsx(styles.button.base, styles.button[fieldStyle], showPopover && styles.button.focused)}
        >
          {fieldStyle === 'default' && (
            <MapPinIcon className="size-5 text-neutral-300 lg:size-7 dark:text-neutral-400" />
          )}

          <div className="grow">
            <Headless.ComboboxInput
              ref={inputRef}
              aria-label="Search for a location"
              className={clsx(styles.input.base, styles.input[fieldStyle])}
              placeholder={placeholder}
              autoComplete="off"
              displayValue={(item?: Suggest) => item?.name || ''}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
            />
            {/* Hidden input for form submission - prioritize inputValue for immediate user input */}
            <input
              type="hidden"
              name={inputName}
              value={inputValue || selected?.name || ''}
              onChange={() => {}} // Prevent React warning about uncontrolled input
            />
            <div className="mt-0.5 text-start text-sm font-light text-neutral-400">
              <span className="line-clamp-1">{placeholder}</span>
            </div>

            <ClearDataButton
              className={clsx(!selected?.id && !inputValue && 'sr-only')}
              onClick={() => {
                setSelected({ id: '', name: '' })
                setInputValue('')
                setShowPopover(false)
                if (inputRef.current) {
                  inputRef.current.value = ''
                  inputRef.current.focus()
                }
              }}
            />
          </div>
        </div>

        <Headless.Transition show={shouldShowPopover} unmount={false}>
          <div className={clsx(styles.panel.base, styles.panel[fieldStyle])}>
            {isShowInitSuggests && (
              <p className="mt-2 mb-3 px-4 text-xs/6 font-normal text-neutral-600 sm:mt-0 sm:px-8 dark:text-neutral-400">
                {suggestedLocationsText}
              </p>
            )}
            {isShowInitSuggests && <Divider className="opacity-50" />}
            <Headless.ComboboxOptions static unmount={false}>
              {suggestsToShow.map((item) => (
                <Headless.ComboboxOption
                  key={item.id}
                  value={item}
                  className="flex items-center gap-3 p-4 data-focus:bg-neutral-100 sm:gap-4.5 sm:px-8 dark:data-focus:bg-neutral-700"
                >
                  <HugeiconsIcon
                    icon={item.icon || Location01Icon}
                    className="size-4 text-neutral-400 sm:size-6 dark:text-neutral-500"
                  />
                  <span className="block font-medium text-neutral-700 dark:text-neutral-200">{item.name}</span>
                </Headless.ComboboxOption>
              ))}
            </Headless.ComboboxOptions>
          </div>
        </Headless.Transition>
      </Headless.Combobox>
    </div>
  )
}
