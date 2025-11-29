'use client'

import { useT } from '@/hooks/useT'
import Heading from '@/shared/Heading'

const SectionValues = () => {
  const T = useT()
  const aboutPage = T.aboutPage as Record<string, string>

  const values = [
    {
      title: aboutPage.value1Title,
      description: aboutPage.value1Description,
    },
    {
      title: aboutPage.value2Title,
      description: aboutPage.value2Description,
    },
    {
      title: aboutPage.value3Title,
      description: aboutPage.value3Description,
    },
    {
      title: aboutPage.value4Title,
      description: aboutPage.value4Description,
    },
  ]

  return (
    <div className="relative">
      <Heading>{aboutPage.valuesTitle}</Heading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {values.map((value, index) => (
          <div
            key={index}
            className="rounded-2xl bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800"
          >
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200">
              {value.title}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {value.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionValues

