'use client'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { en } from '../../public/locales/en'
import { ro } from '../../public/locales/ro'

type Lang = 'en' | 'ro'

interface LanguageContextType {
  language: Lang
  translations: typeof en
  setLanguage: (lang: Lang) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  // Folosește întotdeauna aceeași valoare inițială pentru SSR și client pentru a evita hydration mismatch
  const [language, setLanguageState] = useState<Lang>('ro')
  const [isMounted, setIsMounted] = useState(false)

  // Marchează componentul ca montat și inițializează language-ul din localStorage/cookies/URL (client-side only)
  useEffect(() => {
    setIsMounted(true)
    
    // Citește din localStorage
    const stored = localStorage.getItem('language') as Lang | null
    let initialLang: Lang = 'ro'
    
    if (stored === 'en' || stored === 'ro') {
      initialLang = stored
    }
    
    // Încearcă să citească din cookies
    const cookies = document.cookie.split(';')
    const langCookie = cookies.find(c => c.trim().startsWith('language='))
    if (langCookie) {
      const lang = langCookie.split('=')[1] as Lang
      if (lang === 'en' || lang === 'ro') {
        initialLang = lang
      }
    }
    
    // Citește din URL (are prioritate peste localStorage/cookies)
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang') as Lang | null
    
    if (urlLang === 'en' || urlLang === 'ro') {
      initialLang = urlLang
    }
    
    // Setează language-ul inițial
    if (initialLang !== language) {
      setLanguageState(initialLang)
      localStorage.setItem('language', initialLang)
      document.cookie = `language=${initialLang}; path=/; max-age=31536000`
    }
    
    // Actualizează URL-ul dacă nu există lang în URL
    if (!urlLang) {
      const currentParams = new URLSearchParams(window.location.search)
      currentParams.set('lang', initialLang)
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronizează language-ul cu URL-ul când se schimbă (doar client-side)
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return

    // Citește din URL
    const urlParams = new URLSearchParams(window.location.search)
    const urlLang = urlParams.get('lang') as Lang | null
    
    if (urlLang === 'en' || urlLang === 'ro') {
      if (urlLang !== language) {
        setLanguageState(urlLang)
        localStorage.setItem('language', urlLang)
        document.cookie = `language=${urlLang}; path=/; max-age=31536000`
      }
    } else {
      // Dacă nu există în URL, actualizează URL-ul cu language-ul curent
      const currentParams = new URLSearchParams(window.location.search)
      if (currentParams.get('lang') !== language) {
        currentParams.set('lang', language)
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [isMounted, language])

  // Funcție pentru setarea language-ului cu sincronizare URL
  const setLanguage = (lang: Lang) => {
    setLanguageState(lang)
    
    // Salvează în localStorage și cookies
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang)
      document.cookie = `language=${lang}; path=/; max-age=31536000` // 1 an
      
      // Actualizează URL-ul
      const params = new URLSearchParams(window.location.search)
      params.set('lang', lang)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }

  const translations = language === 'ro' ? ro : en

  return <LanguageContext.Provider value={{ language, translations, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}

