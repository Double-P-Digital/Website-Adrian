'use client'

import { useT } from '@/hooks/useT'
import { FC } from 'react'

interface Props {
  className?: string
}

const SectionHero: FC<Props> = ({ className = '' }) => {
  const T = useT()
  const aboutPage = T.aboutPage as Record<string, string>

  return (
    <div className={`relative ${className}`}>
      <div className="relative flex flex-col items-center gap-10 text-center">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold sm:text-5xl">{aboutPage.heroHeading}</h1>
          <p className="mt-7 text-base text-neutral-600 xl:text-lg dark:text-neutral-400">
            {aboutPage.heroSubheading}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SectionHero