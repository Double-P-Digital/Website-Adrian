'use client'

import { useT } from '@/hooks/useT'
import Heading from '@/shared/Heading'

const SectionMission = () => {
  const T = useT()
  const aboutPage = T.aboutPage as Record<string, string>

  return (
    <div className="relative">
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div>
          <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white lg:text-4xl">
            {aboutPage.missionTitle}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-400 lg:text-lg">
            {aboutPage.missionDescription}
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-neutral-900 dark:text-white lg:text-4xl">
            {aboutPage.visionTitle}
          </h2>
          <p className="mt-6 text-base leading-relaxed text-neutral-600 dark:text-neutral-400 lg:text-lg">
            {aboutPage.visionDescription}
          </p>
        </div>
      </div>
    </div>
  )
}

export default SectionMission

