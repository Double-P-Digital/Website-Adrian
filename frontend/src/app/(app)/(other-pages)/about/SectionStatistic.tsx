'use client'

import { useT } from '@/hooks/useT'
import Heading from '@/shared/Heading'
import { FC } from 'react'

interface SectionStatisticProps {
  className?: string
}

const SectionStatistic: FC<SectionStatisticProps> = ({ className = '' }) => {
  const T = useT()
  const aboutPage = T.aboutPage as Record<string, string>

  const stats = [
    {
      id: '1',
      value: aboutPage.stat1Value,
      description: aboutPage.stat1Description,
    },
    {
      id: '2',
      value: aboutPage.stat2Value,
      description: aboutPage.stat2Description,
    },
    {
      id: '3',
      value: aboutPage.stat3Value,
      description: aboutPage.stat3Description,
    },
    {
      id: '4',
      value: aboutPage.stat4Value,
      description: aboutPage.stat4Description,
    },
  ]

  return (
    <div className={`relative ${className}`}>
      <Heading>{aboutPage.statsTitle}</Heading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 xl:gap-8">
        {stats.map((stat) => (
          <div
            key={stat.id}
            className="rounded-2xl bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800"
          >
            <h3 className="text-2xl leading-none font-semibold text-neutral-900 md:text-3xl dark:text-neutral-200">
              {stat.value}
            </h3>
            <span className="mt-3 block text-sm text-neutral-500 sm:text-base dark:text-neutral-400">
              {stat.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionStatistic
