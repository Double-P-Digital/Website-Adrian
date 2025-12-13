'use client'

import { Search01Icon } from '@/components/Icons'
import { useT } from '@/hooks/useT'
import { getAllApartments } from '@/services/apartments'
import { MapPinIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { FC, useEffect, useRef, useState } from 'react'

interface Props {
  onClick?: () => void
  onChange?: (value: string) => void
  className?: string
  defaultValue?: string
  headingText?: string
  imputName?: string
}

const LocationInput: FC<Props> = ({
  onChange,
  className,
  defaultValue = '',
  headingText,
  imputName = 'location',
}) => {
  const T = useT()
  const [value, setValue] = useState('')
  const [cities, setCities] = useState<string[]>([])
  const [isLoadingCities, setIsLoadingCities] = useState(true)
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Load cities from apartments
  useEffect(() => {
    const loadCities = async () => {
      try {
        setIsLoadingCities(true)
        const apartments = await getAllApartments()
        
        // Extract unique cities from apartments
        const citySet = new Set<string>()
        apartments.forEach((apartment) => {
          if (apartment.city && apartment.city.trim()) {
            citySet.add(apartment.city.trim())
          }
        })
        
        // Convert to sorted array
        const cityArray = Array.from(citySet).sort()
        setCities(cityArray)
      } catch (error) {
        setCities([])
      } finally {
        setIsLoadingCities(false)
      }
    }
    
    loadCities()
  }, [])

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  const handleSelectLocation = (item: string) => {
    // DO NOT REMOVE SETTIMEOUT FUNC
    setTimeout(() => {
      setValue(item)
      onChange && onChange(item)
    }, 0)
  }

  // Filter cities based on input value
  const getFilteredCities = () => {
    if (!value || value.trim() === '') {
      return cities
    }
    
    const searchTerm = value.toLowerCase().trim()
    return cities.filter((city) => 
      city.toLowerCase().includes(searchTerm)
    )
  }

  const filteredCities = getFilteredCities()
  const displayHeading = headingText || T['HeroSearchForm']['Where to?'] || 'Unde?'
  const suggestedText = T['HeroSearchForm']['Suggested locations'] || 'Locații sugerate'
  const searchPlaceholder = T['HeroSearchForm']['Search destinations'] || 'Caută destinații'

  const renderSearchValues = ({ heading, items }: { heading: string; items: string[] }) => {
    if (isLoadingCities) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"></div>
          <span className="ml-2 text-sm text-neutral-500">Se încarcă...</span>
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <p className="py-4 text-center text-sm text-neutral-500">
          {value ? 'Nu s-au găsit orașe' : 'Nu există orașe disponibile'}
        </p>
      )
    }

    return (
      <>
        <p className="block text-base font-semibold">{heading}</p>
        <div className="mt-3">
          {items.map((item) => {
            return (
              <div
                className="mb-1 flex cursor-pointer items-center gap-x-3 rounded-lg py-2 px-2 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => handleSelectLocation(item)}
                key={item}
              >
                <MapPinIcon className="h-5 w-5 text-neutral-500 dark:text-neutral-400" />
                <span>{item}</span>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  return (
    <div className={clsx(className)} ref={containerRef}>
      <h3 className="text-xl font-semibold sm:text-2xl">{displayHeading}</h3>
      <div className="relative mt-5">
        <input
          className="block w-full truncate rounded-xl border border-neutral-300 bg-transparent px-4 py-3 pe-12 leading-none font-normal placeholder-neutral-500 placeholder:truncate focus:border-primary-300 focus:ring-3 focus:ring-primary-200/50 sm:text-sm dark:border-neutral-700 dark:bg-neutral-900 dark:placeholder-neutral-300 dark:focus:ring-primary-600/25"
          placeholder={searchPlaceholder}
          value={value}
          onChange={(e) => {
            setValue(e.currentTarget.value)
            onChange && onChange(e.currentTarget.value)
          }}
          ref={inputRef}
          name={imputName}
          autoComplete="off"
          autoFocus
          data-autofocus
        />
        <span className="absolute end-2.5 top-1/2 -translate-y-1/2">
          <Search01Icon className="h-5 w-5 text-neutral-700 dark:text-neutral-400" />
        </span>
      </div>
      <div className="mt-7">
        {renderSearchValues({
          heading: suggestedText,
          items: filteredCities,
        })}
      </div>
    </div>
  )
}

export default LocationInput
