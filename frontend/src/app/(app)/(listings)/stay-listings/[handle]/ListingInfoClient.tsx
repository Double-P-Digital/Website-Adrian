'use client'

import { useT } from '@/hooks/useT'
import { useLanguage } from '@/context/LanguageContext'
import { SectionHeading } from '../../components/SectionHeading'

interface ListingInfoClientProps {
  descriptionRo?: string | null
  descriptionEn?: string | null
}

export default function ListingInfoClient({ descriptionRo, descriptionEn }: ListingInfoClientProps) {
  const T = useT()
  const { language } = useLanguage()

  // Selectează descrierea în funcție de limba curentă
  const getDescription = () => {
    if (language === 'ro') {
      return descriptionRo || descriptionEn || null
    } else {
      return descriptionEn || descriptionRo || null
    }
  }

  const displayDescription = getDescription()

  return (
    <div className="listingSection__wrap">
      <SectionHeading>{T.ListingPage['Stay information']}</SectionHeading>
      
      <div className="leading-relaxed text-neutral-700 dark:text-neutral-300">
        {displayDescription ? (
          <p className="whitespace-pre-line">{displayDescription}</p>
        ) : (
          <p>{T.ListingPage['No description available']}</p>
        )}
      </div>
    </div>
  )
}

