/**
 * Environment Configuration
 * Centralized environment variable management
 */

interface EnvConfig {
  apiUrl: string
  apiKey: string
  stripePublishableKey?: string
  nodeEnv: 'development' | 'production' | 'test'
}

/**
 * Validates and returns environment configuration
 */
export function getEnvConfig(): EnvConfig {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
  const apiKey = process.env.NEXT_PUBLIC_API_KEY || ''
  const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const nodeEnv = (process.env.NODE_ENV || 'development') as EnvConfig['nodeEnv']

  if (!apiUrl) {
    console.warn('NEXT_PUBLIC_API_URL is not set, using default: http://localhost:3000')
  }

  return {
    apiUrl,
    apiKey,
    stripePublishableKey,
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
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return getEnvConfig().nodeEnv === 'development'
}

