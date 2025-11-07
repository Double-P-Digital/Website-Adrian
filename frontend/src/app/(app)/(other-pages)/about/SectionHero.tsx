import { FC, ReactNode } from 'react'

interface Props {
  className?: string
  heading: ReactNode
  subHeading: string
}

const SectionHero: FC<Props> = ({ className = '', heading, subHeading }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="relative flex flex-col items-center gap-10 text-center">
        <div className="w-full max-w-4xl mx-auto">
          <h1 className="text-4xl font-semibold sm:text-5xl">{heading}</h1>
          <p className="mt-7 text-base text-neutral-600 xl:text-lg dark:text-neutral-400">{subHeading}</p>
        </div>
      </div>
    </div>
  )
}

export default SectionHero