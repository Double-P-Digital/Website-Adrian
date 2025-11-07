'use client'

import { Pagination, PaginationGap, PaginationList, PaginationNext, PaginationPage, PaginationPrevious } from '@/shared/Pagination'
import { usePathname, useSearchParams } from 'next/navigation'

interface PaginationComponentProps {
  totalItems: number
  itemsPerPage?: number
  maxPagesToShow?: number
}

export default function PaginationComponent({ 
  totalItems, 
  itemsPerPage = 12, 
  maxPagesToShow = 7 
}: PaginationComponentProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentPage = Number(searchParams.get('page')) || 1
  
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  
  // Afișează paginarea întotdeauna, chiar și cu o singură pagină
  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', pageNumber.toString())
    return `${pathname}?${params.toString()}`
  }

  // Calculează ce pagini să afișeze
  const getPageNumbers = () => {
    const pages: (number | 'gap')[] = []
    
    if (totalPages <= maxPagesToShow) {
      // Afișează toate paginile
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Afișează pagini cu gap-uri
      const leftSiblingIndex = Math.max(currentPage - 1, 1)
      const rightSiblingIndex = Math.min(currentPage + 1, totalPages)
      
      const shouldShowLeftDots = leftSiblingIndex > 2
      const shouldShowRightDots = rightSiblingIndex < totalPages - 1
      
      // Prima pagină întotdeauna
      pages.push(1)
      
      if (shouldShowLeftDots) {
        pages.push('gap')
      }
      
      // Pagini din mijloc
      for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
        if (i !== 1 && i !== totalPages) {
          pages.push(i)
        }
      }
      
      if (shouldShowRightDots) {
        pages.push('gap')
      }
      
      // Ultima pagină întotdeauna
      if (totalPages !== 1) {
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const pages = getPageNumbers()

  return (
    <Pagination>
      <PaginationPrevious 
        href={currentPage > 1 ? createPageUrl(currentPage - 1) : undefined}
      />
      <PaginationList>
        {pages.map((page, index) => 
          page === 'gap' ? (
            <PaginationGap key={`gap-${index}`} />
          ) : (
            <PaginationPage 
              key={page} 
              href={createPageUrl(page)}
              current={page === currentPage}
            >
              {page}
            </PaginationPage>
          )
        )}
      </PaginationList>
      <PaginationNext 
        href={currentPage < totalPages ? createPageUrl(currentPage + 1) : undefined}
      />
    </Pagination>
  )
}
