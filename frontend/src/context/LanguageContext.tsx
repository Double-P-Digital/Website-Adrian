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
  const [language, setLanguageState] = useState<Lang>('en')

  useEffect(() => {
    const stored = localStorage.getItem('language') as Lang
    if (stored) setLanguageState(stored)
  }, [])

  const setLanguage = (lang: Lang) => {
    localStorage.setItem('language', lang)
    setLanguageState(lang)
  }

  const translations = language === 'ro' ? ro : en

  return <LanguageContext.Provider value={{ language, translations, setLanguage }}>{children}</LanguageContext.Provider>
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider')
  return ctx
}
