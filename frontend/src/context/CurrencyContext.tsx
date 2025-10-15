'use client'

import { createContext, ReactNode, useContext, useState } from 'react'

type Currency = 'RON' | 'EUR'

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  convert: (price: number, from?: Currency, to?: Currency) => number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrency] = useState<Currency>('RON')

  // Example conversion rates (update as needed)
  const rates = {
    RON: 1,
    EUR: 0.2, // 1 RON = 0.2 EUR (example)
  }

  const convert = (price: number, from: Currency = 'RON', to: Currency = currency) => {
    if (from === to) return price
    return (price / rates[from]) * rates[to]
  }

  return <CurrencyContext.Provider value={{ currency, setCurrency, convert }}>{children}</CurrencyContext.Provider>
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext)
  if (!ctx) throw new Error('useCurrency must be used within a CurrencyProvider')
  return ctx
}
