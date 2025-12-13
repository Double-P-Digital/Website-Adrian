/**
 * frontend/src/api/client.ts
 * API Client centralizat pentru toate apelurile către backend
 */

import { getApiBaseUrl, getApiKey } from '@/config/env'

const API_BASE_URL = getApiBaseUrl()
const API_KEY = getApiKey()

export interface ApiResponse<T> {
  data: T
  status: number
  ok: boolean
}

export interface ApiError {
  message: string
  status: number
  error?: any
}

/**
 * Clasă pentru apeluri API centralizate
 */
class ApiClient {
  private baseURL: string
  private apiKey: string

  constructor(baseURL: string = API_BASE_URL, apiKey: string = API_KEY) {
    this.baseURL = baseURL
    this.apiKey = apiKey
  }

  /**
   * Alege baza URL corectă în funcție de runtime (SSR vs browser).
   * - SSR în Docker: dacă DOCKER_ENV=true și baza e localhost => folosește serviciul backend.
   * - Browser: dacă baza e backend => folosește origin cu port 3000.
   */
  private getRuntimeBaseUrl(): string {
    const isServer = typeof window === 'undefined'
    const isDocker = process.env.DOCKER_ENV === 'true' || process.env.NEXT_PUBLIC_DOCKER_ENV === 'true'

    if (isServer) {
      // Doar în Docker înlocuim localhost cu backend
      if (isDocker && this.baseURL.includes('localhost')) {
        return this.baseURL.replace('localhost', 'backend')
      }
      return this.baseURL
    }

    // Browser
    if (this.baseURL.includes('backend')) {
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3001'
      return origin.replace(':3001', ':3000')
    }
    return this.baseURL
  }

  /**
   * Obține header-urile standard pentru request-uri
   */
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'x-api-key': this.apiKey,
      ...customHeaders,
    }
  }

  /**
   * Procesează răspunsul de la API
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const data = await response.json().catch(() => ({}))
    
    return {
      data: data as T,
      status: response.status,
      ok: response.ok,
    }
  }

  /**
   * Procesează eroarea de la API
   */
  private handleError(error: any, status: number = 500): ApiError {
    return {
      message: error?.message || 'A apărut o eroare la comunicarea cu serverul',
      status,
      error,
    }
  }

  /**
   * GET request
   * Funcționează atât server-side cât și client-side
   */
  async get<T>(
    endpoint: string,
    options?: {
      cache?: RequestCache
      next?: { revalidate?: number }
      headers?: HeadersInit
      signal?: AbortSignal
    }
  ): Promise<T> {
    try {
      const apiUrl = this.getRuntimeBaseUrl()

      // Pentru client-side, next options nu funcționează
      // Construim fetch options compatibile cu ambele medii
      const fetchOptions: RequestInit & { next?: { revalidate?: number } } = {
        method: 'GET',
        headers: this.getHeaders(options?.headers),
      }

      // Adaugă AbortSignal dacă este furnizat (pentru request cancellation)
      if (options?.signal) {
        fetchOptions.signal = options.signal
      }

      // Adaugă cache doar dacă este specificat (pentru server-side)
      if (options?.cache !== undefined) {
        fetchOptions.cache = options.cache
      }

      // Adaugă next options doar pentru server-side (Next.js va ignora în browser)
      if (options?.next) {
        fetchOptions.next = options.next
      } else if (!options?.cache) {
        // Pentru client-side, folosim no-store ca default
        fetchOptions.cache = 'no-store'
      }

      const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await this.handleResponse<T>(response)
      return result.data
    } catch (error: any) {
      // Nu logăm eroarea dacă request-ul a fost anulat intenționat
      if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
        throw error // Re-throw pentru a fi gestionat de caller
      }
      
      // Nu logăm eroarea aici - lasă serviciile să gestioneze erorile
      // Doar pentru "Failed to fetch" (network errors) logăm un warning
      if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
        // Network error - backend might not be accessible
      }
      throw this.handleError(error)
    }
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    body?: any,
    options?: {
      headers?: HeadersInit
    }
  ): Promise<T> {
    try {
      const apiUrl = this.getRuntimeBaseUrl()

      const fetchOptions: RequestInit = {
        method: 'POST',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
      }

      const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions)

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorText}`)
      }

      const result = await this.handleResponse<T>(response)
      return result.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    body?: any,
    options?: {
      headers?: HeadersInit
    }
  ): Promise<T> {
    try {
      const apiUrl = this.getRuntimeBaseUrl()

      const fetchOptions: RequestInit = {
        method: 'PUT',
        headers: this.getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
      }

      const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await this.handleResponse<T>(response)
      return result.data
    } catch (error) {
      throw this.handleError(error)
    }
  }

  /**
   * DELETE request
   */
  async delete<T>(
    endpoint: string,
    options?: {
      headers?: HeadersInit
    }
  ): Promise<T> {
    try {
      const apiUrl = this.getRuntimeBaseUrl()

      const fetchOptions: RequestInit = {
        method: 'DELETE',
        headers: this.getHeaders(options?.headers),
      }

      const response = await fetch(`${apiUrl}${endpoint}`, fetchOptions)

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const result = await this.handleResponse<T>(response)
      return result.data
    } catch (error) {
      throw this.handleError(error)
    }
  }
}

export const apiClient = new ApiClient()

export { ApiClient }

