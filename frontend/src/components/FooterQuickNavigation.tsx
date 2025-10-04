'use client'

import { getCurrencies, getLanguages } from '@/data/navigation'
import Logo from '@/shared/Logo'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { useIntersection } from 'react-use'
import CurrLangDropdown from './Header/CurrLangDropdown'

const SCROLL_THRESHOLD = 80

const FooterQuickNavigation = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const rafId = useRef<number | null>(null)
  const lastScrollY = useRef<number>(0)
  const [currencies, setCurrencies] = useState<any[]>([])
  const [languages, setLanguages] = useState<any[]>([])
  
  const intersection = useIntersection(containerRef as RefObject<HTMLDivElement>, {
    root: null,
    rootMargin: '0px',
    threshold: 1,
  })
  const isInViewport = intersection && intersection.intersectionRatio >= 1

  useEffect(() => {
    // Load currencies and languages
    const loadData = async () => {
      const [currData, langData] = await Promise.all([getCurrencies(), getLanguages()])
      setCurrencies(currData)
      setLanguages(langData)
    }
    loadData()
  }, [])

  useEffect(() => {
    // update the lastScrollY position when the showNav is shown/hidden
    lastScrollY.current = window.pageYOffset
  }, [isInViewport])

  const showHideHeaderMenu = useCallback(() => {
    if (!containerRef?.current) {
      return
    }
    const currentScrollPos = window.pageYOffset

    // SHOW _ HIDE NAV MENU
    if (currentScrollPos > lastScrollY.current) {
      if (isInViewport && currentScrollPos - lastScrollY.current < SCROLL_THRESHOLD) {
        return
      }
      containerRef.current.classList.add('translate-y-[calc(100%+1.5rem)]')
    } else {
      if (!isInViewport && lastScrollY.current - currentScrollPos < SCROLL_THRESHOLD) {
        return
      }
      containerRef.current.classList.remove('translate-y-[calc(100%+1.5rem)]')
    }
    lastScrollY.current = currentScrollPos
  }, [isInViewport])

  const handleEventScroll = useCallback(() => {
    rafId.current = window.requestAnimationFrame(showHideHeaderMenu)
  }, [showHideHeaderMenu])

  useEffect(() => {
    window.addEventListener('scroll', handleEventScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleEventScroll)
      // Cleanup requestAnimationFrame if pending
      if (rafId.current) {
        window.cancelAnimationFrame(rafId.current)
      }
    }
  }, [handleEventScroll])

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 bg-white/90 px-4 py-3 shadow ring-1 shadow-slate-200/80 ring-slate-900/5 backdrop-blur-sm transition-transform lg:hidden dark:bg-neutral-950/90"
    >
      <div className="container mx-auto flex w-full max-w-lg items-center justify-between">
        {/* Logo on the left */}
        <div className="shrink-0">
          <Logo />
        </div>
        
        {/* Language & Currency Selection on the right */}
        <CurrLangDropdown currencies={currencies} languages={languages} />
      </div>
    </div>
  )
}

export default FooterQuickNavigation
