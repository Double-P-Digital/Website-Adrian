'use client'

import { useT } from '@/hooks/useT'
import Heading from '@/shared/Heading'

const SectionHowItWorks = () => {
  const T = useT()
  const aboutPage = T.aboutPage as Record<string, string>

  const steps = [
    {
      title: aboutPage.step1Title,
      description: aboutPage.step1Description,
      icon: '🔍',
    },
    {
      title: aboutPage.step2Title,
      description: aboutPage.step2Description,
      icon: '📋',
    },
    {
      title: aboutPage.step3Title,
      description: aboutPage.step3Description,
      icon: '💳',
    },
    {
      title: aboutPage.step4Title,
      description: aboutPage.step4Description,
      icon: '✨',
    },
  ]

  return (
    <div className="relative">
      <Heading>{aboutPage.howItWorksTitle}</Heading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
        {steps.map((step, index) => (
          <div
            key={index}
            className="relative rounded-2xl bg-neutral-50 p-6 dark:border-neutral-800 dark:bg-neutral-800"
          >
            <div className="mb-4 text-4xl">{step.icon}</div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-500 text-sm font-semibold text-white">
                {index + 1}
              </span>
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-200">
                {step.title}
              </h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionHowItWorks

