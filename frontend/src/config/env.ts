/**
 * Environment Configuration
 * Centralized environment variable management
 */

interface EnvConfig {
  apiUrl: string
  apiKey: string
  stripePublishableKey?: string
  pynBookingApiKey?: string
  nodeEnv: 'development' | 'production' | 'test'
}

/**
 * Validates and returns environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const pynBookingApiKey = process.env.NEXT_PUBLIC_PYNBOOKING_API_KEY
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv']

  if (!apiUrl) {
    // Using default API URL
  }

  return {
    apiUrl,
    apiKey,
    stripePublishableKey,
    pynBookingApiKey,
    nodeEnv,
  }
}

/**
 * Get API base URL
 */
export function getApiBaseUrl(): string {
  return getEnvConfig().apiUrl
}

/**
 * Get API key
 */
export function getApiKey(): string {
  return getEnvConfig().apiKey
}

/**
 * Get PynBooking API key
 */
export function getPynBookingApiKey(): string | undefined {
  return getEnvConfig().pynBookingApiKey
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvConfig().nodeEnv === 'development'
}

