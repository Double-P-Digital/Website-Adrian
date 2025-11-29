'use client'

import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { getExchangeRates, getExchangeRatesSync, convertPrice, type ExchangeRates } from '@/services/currency'

type Currency = 'RON' | 'EUR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convert: (price: number, from?: Currency, to?: Currency) => number
  rates: ExchangeRates
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  // Folosește întotdeauna aceeași valoare inițială pentru SSR și client pentru a evita hydration mismatch
  const [currency, setCurrencyState] = useState<Currency>('RON')
  const [rates, setRates] = useState<ExchangeRates>(getExchangeRatesSync())
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Marchează componentul ca montat și inițializează currency-ul din localStorage/URL (client-side only)
  useEffect(() => {
    setIsMounted(true)
    
    // Citește din localStorage
    const stored = localStorage.getItem('currency') as Currency | null
    let initialCurrency: Currency = 'RON'
    
    if (stored === 'RON' || stored === 'EUR') {
      initialCurrency = stored
    }
    
    // Citește din URL (are prioritate peste localStorage)
    const urlParams = new URLSearchParams(window.location.search)
    const urlCurrency = urlParams.get('currency') as Currency | null
    
    if (urlCurrency === 'RON' || urlCurrency === 'EUR') {
      initialCurrency = urlCurrency
    }
    
    // Setează currency-ul inițial
    if (initialCurrency !== currency) {
      setCurrencyState(initialCurrency)
      localStorage.setItem('currency', initialCurrency)
    }
    
    // Actualizează URL-ul dacă nu există currency în URL
    if (!urlCurrency) {
      const currentParams = new URLSearchParams(window.location.search)
      currentParams.set('currency', initialCurrency)
      const newUrl = `${window.location.pathname}?${currentParams.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Sincronizează currency-ul cu URL-ul când se schimbă (doar client-side)
  useEffect(() => {
    if (!isMounted || typeof window === 'undefined') return

    // Citește din URL
    const urlParams = new URLSearchParams(window.location.search)
    const urlCurrency = urlParams.get('currency') as Currency | null
    
    if (urlCurrency === 'RON' || urlCurrency === 'EUR') {
      if (urlCurrency !== currency) {
        setCurrencyState(urlCurrency)
        localStorage.setItem('currency', urlCurrency)
      }
    } else {
      // Dacă nu există în URL, actualizează URL-ul cu currency-ul curent
      const currentParams = new URLSearchParams(window.location.search)
      if (currentParams.get('currency') !== currency) {
        currentParams.set('currency', currency)
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`
        window.history.replaceState({}, '', newUrl)
      }
    }
  }, [isMounted, currency])

  // Funcție pentru setarea currency-ului cu sincronizare URL
  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency)
    
    // Salvează în localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currency', newCurrency)
      
      // Actualizează URL-ul
      const params = new URLSearchParams(window.location.search)
      params.set('currency', newCurrency)
      const newUrl = `${window.location.pathname}?${params.toString()}`
      window.history.replaceState({}, '', newUrl)
    }
  }

  // Încarcă rate-urile de schimb valutar la mount și actualizează periodic
  useEffect(() => {
    let mounted = true

    const loadRates = async () => {
      try {
        setIsLoading(true)
        const exchangeRates = await getExchangeRates()
        if (mounted) {
          setRates(exchangeRates)
        }
      } catch (error) {
        console.error('[CurrencyContext] Error loading exchange rates:', error)
        // Folosește rate-urile din cache sau default
        if (mounted) {
          setRates(getExchangeRatesSync())
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    // Încarcă rate-urile imediat
    loadRates()

    // Actualizează rate-urile la fiecare oră
    const interval = setInterval(() => {
      loadRates()
    }, 60 * 60 * 1000) // 1 oră

    return () => {
      mounted = false
      clearInterval(interval)
    }
  }, [])

  const convert = (price: number, from: Currency = 'RON', to: Currency = currency) => {
    return convertPrice(price, rates, from, to)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, rates, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}
