import CardCategoryBox1 from '@/components/CardCategoryBox1'
import { TCategory } from '@/data/categories'
import React from 'react'

interface SectionGridCategoryBoxProps {
  categories: TCategory[]
  className?: string
}

const SectionGridCategoryBox: React.FC<SectionGridCategoryBoxProps> = ({ categories, className = '' }) => {
  return (
    <div className={`flex flex-wrap justify-center gap-5 sm:gap-6 md:gap-8 ${className}`}>
      {categories.map((item, i) => (
        <CardCategoryBox1 key={item.id} category={item} className="w-[17rem]" />
      ))}
    </div>
  )
}

export default SectionGridCategoryBox
