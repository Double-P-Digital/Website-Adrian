'use client'

import { useT } from '@/hooks/useT'
import { UsersIcon } from '@heroicons/react/24/outline'
import { FC } from 'react'

interface Props {
  className?: string
  maxGuests: number
}

/**
 * Read-only display component for showing apartment's maximum guest capacity.
 * Unlike GuestsInputPopover, this component is not editable.
 */
const GuestsDisplay: FC<Props> = ({ className = 'flex-1', maxGuests }) => {
  const T = useT()

  return (
    <div className={`relative flex ${className}`}>
      <div className="flex flex-1 items-center rounded-b-3xl">
        <div className="relative z-10 flex flex-1 items-center gap-x-3 p-3 text-start">
          <div className="text-neutral-300 dark:text-neutral-400">
            <UsersIcon className="h-5 w-5 lg:h-7 lg:w-7" />
          </div>
          <div className="grow">
            <span className="block font-semibold xl:text-lg">
              {maxGuests} {T['HeroSearchForm']['Guests']}
            </span>
            <span className="mt-1 block text-sm leading-none font-light text-neutral-400">
              {T['ListingPage']['Max capacity'] || 'Capacitate maximă'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GuestsDisplay

