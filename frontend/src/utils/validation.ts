/**
 * Validation utilities for client-side input validation
 * Provides sanitization and validation functions
 */

/**
 * Sanitize string input - removes potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  // Remove HTML tags
  const withoutHtml = input.replace(/<[^>]*>/g, '')
  
  // Remove script tags and event handlers
  const sanitized = withoutHtml
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  
  // Trim whitespace
  return sanitized.trim()
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  // RFC 5322 compliant email regex (simplified)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim()) && email.length <= 254
}

/**
 * Validate phone number (international format with country code)
 * Accepts: +40, +1, +44, etc. with country code prefix
 */
export function isValidPhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  // Remove spaces, dashes, parentheses
  const cleaned = phone.replace(/[\s\-\(\)]/g, '')
  
  // International phone number patterns (with country code)
  // Format: +[country code][number] (minimum 7 digits after country code, maximum 15 total)
  const internationalPattern = /^\+[1-9]\d{1,14}$/ // E.164 format: +[country code][number]
  
  // Romanian phone number patterns (for backwards compatibility)
  const romanianPatterns = [
    /^\+40[0-9]{9}$/,           // +40XXXXXXXXX
    /^0040[0-9]{9}$/,           // 0040XXXXXXXXX
    /^0[0-9]{9}$/,              // 0XXXXXXXXX
    /^07[0-9]{8}$/,             // 07XXXXXXXX
  ]
  
  // Check international format first (most common with country code selector)
  if (internationalPattern.test(cleaned)) {
    // Verify it has at least 7 digits after country code
    const digitsAfterPlus = cleaned.substring(1)
    return digitsAfterPlus.length >= 8 && digitsAfterPlus.length <= 15
  }
  
  // Fallback to Romanian patterns for backwards compatibility
  return romanianPatterns.some(pattern => pattern.test(cleaned))
}

/**
 * Validate name (first name, last name)
 * Allows letters, spaces, hyphens, apostrophes
 */
export function isValidName(name: string): boolean {
  if (!name || typeof name !== 'string') return false
  
  // Allow letters (including Romanian diacritics), spaces, hyphens, apostrophes
  const nameRegex = /^[a-zA-ZăâîșțĂÂÎȘȚ\s\-']{2,50}$/
  return nameRegex.test(name.trim())
}

/**
 * Validate MongoDB ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  if (!id || typeof id !== 'string') return false
  return /^[0-9a-fA-F]{24}$/.test(id)
}

/**
 * Validate date string
 * Acceptă atât format YYYY-MM-DD cât și ISO string
 */
export function isValidDate(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false
  
  // Verifică dacă este deja în format YYYY-MM-DD
  const yyyyMMddRegex = /^\d{4}-\d{2}-\d{2}$/
  if (yyyyMMddRegex.test(dateString)) {
    const date = new Date(dateString + 'T00:00:00') // Adaugă timp pentru a evita probleme cu timezone
    return !isNaN(date.getTime())
  }
  
  // Dacă nu este în format YYYY-MM-DD, încearcă să-l parseze ca ISO string
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return false
  
  // Verifică dacă este o dată validă
  return true
}

/**
 * Validate that check-out date is after check-in date
 */
export function isValidDateRange(checkIn: string, checkOut: string): boolean {
  if (!isValidDate(checkIn) || !isValidDate(checkOut)) return false
  
  // Parsează datele și compară doar partea de dată (fără timp)
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)
  
  // Setează timpul la 00:00:00 pentru a compara doar datele
  checkInDate.setHours(0, 0, 0, 0)
  checkOutDate.setHours(0, 0, 0, 0)
  
  return checkOutDate > checkInDate
}

/**
 * Validate number is positive and within range
 */
export function isValidNumber(value: number, min: number = 0, max?: number): boolean {
  if (typeof value !== 'number' || isNaN(value)) return false
  if (value < min) return false
  if (max !== undefined && value > max) return false
  return true
}

/**
 * Validate price (must be positive number)
 */
export function isValidPrice(price: number): boolean {
  return isValidNumber(price, 0.01)
}

/**
 * Sanitize and validate form data
 */
export interface FormValidationResult {
  isValid: boolean
  errors: Record<string, string>
}

export function validateCheckoutForm(data: {
  firstName?: string
  lastName?: string
  email?: string
  phoneNumber?: string
  apartmentId?: string
  checkInDate?: string
  checkOutDate?: string
  totalPrice?: number
}): FormValidationResult {
  const errors: Record<string, string> = {}

  // First Name
  if (!data.firstName || !data.firstName.trim()) {
    errors.firstName = 'Prenumele este obligatoriu'
  } else if (!isValidName(data.firstName)) {
    errors.firstName = 'Prenumele conține caractere invalide'
  }

  // Last Name
  if (!data.lastName || !data.lastName.trim()) {
    errors.lastName = 'Numele este obligatoriu'
  } else if (!isValidName(data.lastName)) {
    errors.lastName = 'Numele conține caractere invalide'
  }

  // Email
  if (!data.email || !data.email.trim()) {
    errors.email = 'Email-ul este obligatoriu'
  } else if (!isValidEmail(data.email)) {
    errors.email = 'Email-ul nu este valid'
  }

  // Phone Number
  if (!data.phoneNumber || !data.phoneNumber.trim()) {
    errors.phoneNumber = 'Numărul de telefon este obligatoriu'
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = 'Numărul de telefon nu este valid'
  }

  // Apartment ID
  if (!data.apartmentId) {
    errors.apartmentId = 'ID-ul apartamentului este obligatoriu'
  } else if (!isValidObjectId(data.apartmentId)) {
    errors.apartmentId = 'ID-ul apartamentului este invalid'
  }

  // Check-in Date
  if (!data.checkInDate) {
    errors.checkInDate = 'Data de check-in este obligatorie'
  } else if (!isValidDate(data.checkInDate)) {
    errors.checkInDate = 'Data de check-in nu este validă'
  }

  // Check-out Date
  if (!data.checkOutDate) {
    errors.checkOutDate = 'Data de check-out este obligatorie'
  } else if (!isValidDate(data.checkOutDate)) {
    errors.checkOutDate = 'Data de check-out nu este validă'
  }

  // Date Range
  if (data.checkInDate && data.checkOutDate && isValidDate(data.checkInDate) && isValidDate(data.checkOutDate)) {
    if (!isValidDateRange(data.checkInDate, data.checkOutDate)) {
      errors.checkOutDate = 'Data de check-out trebuie să fie după data de check-in'
    }
  }

  // Total Price
  if (data.totalPrice === undefined || data.totalPrice === null) {
    errors.totalPrice = 'Prețul total este obligatoriu'
  } else if (!isValidPrice(data.totalPrice)) {
    errors.totalPrice = 'Prețul total trebuie să fie mai mare decât 0'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  }
}

