/**
 * Currency Exchange Rate Service
 * Fetches real-time exchange rates from external API
 */

type Currency = 'RON' | 'EUR'

export interface ExchangeRates {
  RON: number // Base currency, always 1
  EUR: number // Rate from RON to EUR
  lastUpdated: number // Timestamp
}

// Cache pentru rate-uri (valabil 1 oră)
let cachedRates: ExchangeRates | null = null
const CACHE_DURATION = 60 * 60 * 1000 // 1 oră în milisecunde

/**
 * Obține rate-urile de schimb valutar din API
 * Folosește ExchangeRate-API (gratuit, fără API key pentru planul de bază)
 * Alternativ: poți folosi Fixer.io, CurrencyAPI, etc.
 */
async function fetchExchangeRates(): Promise<ExchangeRates> {
  try {
    // Opțiunea 1: ExchangeRate-API (gratuit, fără API key)
    // Documentație: https://www.exchangerate-api.com/docs/free
    const response = await fetch('https://open.er-api.com/v6/latest/RON')
    
    if (!response.ok) {
      throw new Error(`API returned ${response.status}`)
    }
    
    const data = await response.json()
    
    // ExchangeRate-API returnează rate-urile față de RON (base currency)
    // Deci EUR va fi în data.rates.EUR
    return {
      RON: 1, // Base currency
      EUR: data.rates?.EUR || 0.2, // Fallback la 0.2 dacă nu există
      lastUpdated: Date.now(),
    }
  } catch (error) {
    console.error('[Currency Service] Error fetching exchange rates:', error)
    
    // Fallback la rate-uri hardcodate dacă API-ul eșuează
    return {
      RON: 1,
      EUR: 0.2, // Rate aproximativ (1 RON ≈ 0.2 EUR)
      lastUpdated: Date.now(),
    }
  }
}

/**
 * Obține rate-urile de schimb valutar (cu cache)
 * Rate-urile sunt actualizate o dată pe oră
 */
export async function getExchangeRates(): Promise<ExchangeRates> {
  // Verifică dacă avem rate-uri în cache și dacă sunt încă valide
  if (cachedRates && Date.now() - cachedRates.lastUpdated < CACHE_DURATION) {
    return cachedRates
  }
  
  // Obține rate-uri noi
  const rates = await fetchExchangeRates()
  cachedRates = rates
  
  return rates
}

/**
 * Obține rate-urile de schimb valutar (versiune sincronă pentru client-side)
 * Folosește cache-ul sau returnează rate-uri default
 */
export function getExchangeRatesSync(): ExchangeRates {
  if (cachedRates && Date.now() - cachedRates.lastUpdated < CACHE_DURATION) {
    return cachedRates
  }
  
  // Returnează rate-uri default dacă nu sunt în cache
  return {
    RON: 1,
    EUR: 0.2,
    lastUpdated: 0,
  }
}

/**
 * Convertește un preț dintr-o valută în alta
 */
export function convertPrice(
  price: number,
  rates: ExchangeRates,
  from: Currency = 'RON',
  to: Currency = 'RON'
): number {
  if (from === to) return price
  
  // Convertește la RON mai întâi (moneda de bază)
  const priceInRON = from === 'RON' ? price : price / rates[from]
  
  // Apoi convertește la moneda țintă
  return to === 'RON' ? priceInRON : priceInRON * rates[to]
}

