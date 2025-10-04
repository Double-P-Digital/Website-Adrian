'use client'

import CardCategory3 from '@/components/CardCategory3'
import CardCategory4 from '@/components/CardCategory4'
import CardCategory5 from '@/components/CardCategory5'
import { TCategory } from '@/data/categories'
import clsx from 'clsx'
import { FC } from 'react'

interface Props {
  className?: string
  itemClassName?: string
  categories: TCategory[]
  categoryCardType?: 'card3' | 'card4' | 'card5'
}

const SectionSliderNewCategories: FC<Props> = ({
  className,
  itemClassName = 'w-[17rem] lg:w-1/4 xl:w-1/5',
  categories = [],
  categoryCardType = 'card3',
}) => {
  const renderCard = (item: TCategory) => {
    switch (categoryCardType) {
      case 'card4':
        return <CardCategory4 category={item} />
      case 'card5':
        return <CardCategory5 category={item} />
      default:
        return <CardCategory3 category={item} />
    }
  }

  return (
    <div className={clsx('relative', className)}>
      {/* Flexbox centrat perfect */}
      <div className="flex flex-wrap justify-center items-start gap-4 lg:gap-6 w-full">
        {categories.map((item) => (
          <div className="w-[17rem] flex-shrink-0" key={item.id}>
            {renderCard(item)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default SectionSliderNewCategories