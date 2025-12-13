'use client'

import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { getCurrencies, getLanguages } from '@/data/navigation'
import {
  Popover,
  PopoverButton,
  PopoverPanel,
  PopoverPanelProps,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from '@headlessui/react'
import { BanknotesIcon, GlobeAltIcon, SlashIcon } from '@heroicons/react/24/outline'
import { ChevronDownIcon } from '@heroicons/react/24/solid'
import clsx from 'clsx'
import { FC } from 'react'

// const Currencies = ({ currencies }: { currencies: Awaited<ReturnType<typeof getCurrencies>> }) => {
//   return (
//     <div className="grid gap-6 lg:grid-cols-2">
//       {currencies.map((item, index) => (
//         <CloseButton
//           key={index}
//           className={clsx(
//             '-m-2.5 flex items-center rounded-lg p-2.5 transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden dark:hover:bg-neutral-700',
//             item.active ? 'bg-neutral-100 dark:bg-neutral-700' : 'opacity-80'
//           )}
//         >
//           <div dangerouslySetInnerHTML={{ __html: item.icon }} />
//           <p className="ms-2 text-sm font-medium">{item.name}</p>
//         </CloseButton>
//       ))}
//     </div>
//   )
// }
const Currencies = () => {
  const { currency, setCurrency } = useCurrency()
  const currencies = [
    { id: 'RON', name: 'RON (Lei)' },
    { id: 'EUR', name: 'EUR (Euro)' },
  ]
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {currencies.map((item, index) => (
        <button
          key={index}
          onClick={() => setCurrency(item.id as 'RON' | 'EUR')}
          className={clsx(
            '-m-2.5 flex w-full items-center rounded-lg p-2.5 text-left transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden dark:hover:bg-neutral-700',
            item.id === currency ? 'bg-neutral-100 dark:bg-neutral-700' : 'opacity-80'
          )}
        >
          <div>
            <p className="text-sm font-medium">{item.name}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

const Languages = ({ languages }: { languages: Awaited<ReturnType<typeof getLanguages>> }) => {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {languages.map((item, index) => (
        <button
          key={index}
          onClick={() => setLanguage(item.id as 'en' | 'ro')}
          className={clsx(
            '-m-2.5 flex w-full items-center rounded-lg p-2.5 text-left transition duration-150 ease-in-out hover:bg-neutral-100 focus:outline-hidden dark:hover:bg-neutral-700',
            item.id === language ? 'bg-neutral-100 dark:bg-neutral-700' : 'opacity-80'
          )}
        >
          <div>
            <p className="text-sm font-medium">{item.name}</p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">{item.description}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

interface Props {
  panelAnchor?: PopoverPanelProps['anchor']
  panelClassName?: PopoverPanelProps['className']
  className?: string
  currencies: Awaited<ReturnType<typeof getCurrencies>>
  languages: Awaited<ReturnType<typeof getLanguages>>
  compact?: boolean
}

const CurrLangDropdown: FC<Props> = ({
  panelAnchor = {
    to: 'bottom end',
    gap: 16,
  },
  className,
  languages,
  currencies,
  panelClassName = 'w-sm',
  compact = false,
}) => {
  const iconSize = compact ? 'size-4' : 'size-5'
  const chevronSize = compact ? 'size-3' : 'size-4'
  const padding = compact ? '-m-1.5 p-1.5' : '-m-2.5 p-2.5'
  
  return (
    <Popover className={clsx('group', className)}>
      <PopoverButton className={clsx(padding, "flex items-center text-sm font-medium text-neutral-600 group-hover:text-neutral-950 focus:outline-hidden focus-visible:outline-hidden dark:text-neutral-200 dark:group-hover:text-neutral-100")}>
        <GlobeAltIcon className={iconSize} />
        <SlashIcon className={clsx(iconSize, "opacity-60")} />
        <BanknotesIcon className={iconSize} />
        <ChevronDownIcon className={clsx("ms-1 group-data-open:rotate-180", chevronSize)} aria-hidden="true" />
      </PopoverButton>

      <PopoverPanel
        anchor={panelAnchor}
        transition
        className={clsx(
          'z-40 rounded-3xl bg-white p-6 shadow-lg ring-1 ring-black/5 transition duration-200 ease-in-out data-closed:translate-y-1 data-closed:opacity-0 dark:bg-neutral-800',
          panelClassName
        )}
      >
        <TabGroup>
          <TabList className="flex space-x-1 rounded-full bg-neutral-100 p-1 dark:bg-neutral-700">
            {['Language', 'Currency'].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  clsx(
                    'w-full rounded-full py-2 text-sm leading-5 font-medium text-neutral-700 focus:ring-0 focus:outline-hidden',
                    selected
                      ? 'bg-white shadow-sm'
                      : 'text-neutral-700 hover:bg-white/70 dark:text-neutral-300 dark:hover:bg-neutral-900/40'
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </TabList>
          <TabPanels className="mt-5">
            <TabPanel className="rounded-xl p-3 focus:ring-0 focus:outline-hidden">
              <Languages languages={languages} />
            </TabPanel>
            <TabPanel className="rounded-xl p-3 focus:ring-0 focus:outline-hidden">
              <Currencies />
            </TabPanel>
          </TabPanels>
        </TabGroup>
      </PopoverPanel>
    </Popover>
  )
}

export default CurrLangDropdown
