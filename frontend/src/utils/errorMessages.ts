/**
 * Utility pentru transformarea erorilor tehnice în mesaje user-friendly
 * Toate mesajele sunt în limba română pentru UX consistent
 */

// Mapare erori tehnice comune -> mesaje user-friendly
const ERROR_MAPPINGS: Record<string, string> = {
  // Erori Stripe
  'card_declined': 'Cardul a fost refuzat. Vă rugăm să verificați datele sau să încercați cu alt card.',
  'insufficient_funds': 'Fonduri insuficiente pe card. Vă rugăm să încercați cu alt card.',
  'expired_card': 'Cardul a expirat. Vă rugăm să folosiți un card valid.',
  'incorrect_cvc': 'Codul CVC este incorect. Vă rugăm să verificați și să încercați din nou.',
  'processing_error': 'Eroare la procesarea plății. Vă rugăm să încercați din nou.',
  'incorrect_number': 'Numărul cardului este incorect. Vă rugăm să verificați datele.',
  'invalid_expiry_month': 'Luna de expirare este invalidă.',
  'invalid_expiry_year': 'Anul de expirare este invalid.',
  'invalid_cvc': 'Codul CVC este invalid.',
  'authentication_required': 'Este necesară autentificarea. Vă rugăm să confirmați plata în aplicația băncii.',
  'card_not_supported': 'Acest tip de card nu este acceptat.',
  'currency_not_supported': 'Această monedă nu este acceptată.',
  'duplicate_transaction': 'Tranzacție duplicată detectată. Vă rugăm să verificați dacă plata a fost deja efectuată.',
  'fraudulent': 'Tranzacția a fost refuzată din motive de securitate.',
  'generic_decline': 'Cardul a fost refuzat. Vă rugăm să contactați banca sau să încercați cu alt card.',
  'lost_card': 'Cardul a fost raportat ca pierdut. Vă rugăm să contactați banca.',
  'stolen_card': 'Cardul a fost raportat ca furat. Vă rugăm să contactați banca.',
  'merchant_blacklist': 'Cardul nu poate fi folosit pentru această tranzacție.',
  'new_account_information_available': 'Datele cardului s-au schimbat. Vă rugăm să reintroduceți datele.',
  'no_action_taken': 'Nu s-a putut procesa plata. Vă rugăm să încercați din nou.',
  'not_permitted': 'Această tranzacție nu este permisă. Vă rugăm să contactați banca.',
  'offline_pin_required': 'Este necesar PIN-ul cardului.',
  'online_or_offline_pin_required': 'Este necesar PIN-ul cardului.',
  'pickup_card': 'Cardul nu poate fi folosit. Vă rugăm să contactați banca.',
  'pin_try_exceeded': 'Prea multe încercări cu PIN greșit. Cardul a fost blocat.',
  'restricted_card': 'Cardul are restricții. Vă rugăm să contactați banca.',
  'revocation_of_all_authorizations': 'Toate autorizările au fost revocate. Vă rugăm să contactați banca.',
  'revocation_of_authorization': 'Autorizarea a fost revocată. Vă rugăm să contactați banca.',
  'security_violation': 'Problemă de securitate detectată. Vă rugăm să contactați banca.',
  'service_not_allowed': 'Serviciul nu este permis pentru acest card.',
  'stop_payment_order': 'Plata a fost oprită. Vă rugăm să contactați banca.',
  'testmode_decline': 'Card de test în modul live. Vă rugăm să folosiți un card real.',
  'transaction_not_allowed': 'Tranzacția nu este permisă. Vă rugăm să contactați banca.',
  'try_again_later': 'Serviciul este temporar indisponibil. Vă rugăm să încercați din nou mai târziu.',
  'withdrawal_count_limit_exceeded': 'Limită de tranzacții depășită. Vă rugăm să încercați mâine.',
  
  // Erori de rețea și server
  'network error': 'Problemă de conexiune. Vă rugăm să verificați internetul și să încercați din nou.',
  'failed to fetch': 'Nu s-a putut conecta la server. Vă rugăm să verificați conexiunea.',
  'timeout': 'Cererea a expirat. Vă rugăm să încercați din nou.',
  'internal server error': 'Eroare de server. Vă rugăm să încercați din nou mai târziu.',
  'bad gateway': 'Eroare de server. Vă rugăm să încercați din nou mai târziu.',
  'service unavailable': 'Serviciul este temporar indisponibil. Vă rugăm să încercați din nou.',
  
  // Erori de validare
  'validation failed': 'Date invalide. Vă rugăm să verificați informațiile introduse.',
  'invalid request': 'Cerere invalidă. Vă rugăm să verificați datele introduse.',
  'checkInDate must be a valid ISO 8601 date string': 'Data de check-in este invalidă.',
  'checkOutDate must be a valid ISO 8601 date string': 'Data de check-out este invalidă.',
  
  // Erori specifice aplicației
  'apartment not found': 'Apartamentul nu a fost găsit.',
  'room not available': 'Camera nu este disponibilă pentru perioada selectată.',
  'dates not available': 'Datele selectate nu sunt disponibile.',
  'invalid dates': 'Datele selectate sunt invalide.',
  'price mismatch': 'Prețul s-a schimbat. Vă rugăm să reîncărcați pagina.',
  'session expired': 'Sesiunea a expirat. Vă rugăm să reîncărcați pagina.',
  'unauthorized': 'Nu aveți permisiune pentru această acțiune.',
  'forbidden': 'Acces interzis.',
  
  // Erori PynBooking
  'pynbooking error': 'Eroare la sincronizarea rezervării. Rezervarea dvs. a fost salvată și va fi procesată manual.',
  'confirmation link is required': 'Eroare de configurare. Vă rugăm să contactați suportul.',
}

// Patterns pentru erori care conțin anumite cuvinte cheie
const ERROR_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /card.*declined|declined.*card/i, message: 'Cardul a fost refuzat. Vă rugăm să verificați datele sau să încercați cu alt card.' },
  { pattern: /insufficient.*funds/i, message: 'Fonduri insuficiente pe card.' },
  { pattern: /expired/i, message: 'Cardul a expirat. Vă rugăm să folosiți un card valid.' },
  { pattern: /cvc|cvv|security code/i, message: 'Codul de securitate (CVC) este incorect.' },
  { pattern: /network|connection|fetch/i, message: 'Problemă de conexiune. Vă rugăm să verificați internetul.' },
  { pattern: /timeout/i, message: 'Cererea a expirat. Vă rugăm să încercați din nou.' },
  { pattern: /server error|500|502|503|504/i, message: 'Eroare de server. Vă rugăm să încercați din nou mai târziu.' },
  { pattern: /not found|404/i, message: 'Resursa nu a fost găsită.' },
  { pattern: /unauthorized|401/i, message: 'Sesiunea a expirat. Vă rugăm să vă autentificați din nou.' },
  { pattern: /forbidden|403/i, message: 'Nu aveți permisiune pentru această acțiune.' },
  { pattern: /validation|invalid|required/i, message: 'Vă rugăm să verificați datele introduse.' },
  { pattern: /pynbooking/i, message: 'Rezervarea a fost salvată, dar sincronizarea a întâmpinat o problemă. Vă vom contacta pentru confirmare.' },
  { pattern: /stripe/i, message: 'Eroare la procesarea plății. Vă rugăm să încercați din nou.' },
]

/**
 * Transformă un mesaj de eroare tehnic într-un mesaj user-friendly
 * @param error - Poate fi un string, Error, sau orice obiect cu message
 * @param fallbackMessage - Mesajul default dacă nu se găsește o traducere
 * @returns Mesaj user-friendly în română
 */
export function getUserFriendlyError(
  error: unknown,
  fallbackMessage: string = 'A apărut o eroare neașteptată. Vă rugăm să încercați din nou.'
): string {
  // Extrage mesajul din diferite formate de eroare
  let errorMessage = ''
  
  if (typeof error === 'string') {
    errorMessage = error
  } else if (error instanceof Error) {
    errorMessage = error.message
  } else if (error && typeof error === 'object') {
    const errObj = error as Record<string, unknown>
    if (typeof errObj.message === 'string') {
      errorMessage = errObj.message
    } else if (typeof errObj.error === 'string') {
      errorMessage = errObj.error
    } else if (errObj.code && typeof errObj.code === 'string') {
      errorMessage = errObj.code
    }
  }
  
  if (!errorMessage) {
    return fallbackMessage
  }
  
  const lowerMessage = errorMessage.toLowerCase()
  
  // 1. Verifică mapările exacte
  for (const [key, value] of Object.entries(ERROR_MAPPINGS)) {
    if (lowerMessage.includes(key.toLowerCase())) {
      return value
    }
  }
  
  // 2. Verifică pattern-urile regex
  for (const { pattern, message } of ERROR_PATTERNS) {
    if (pattern.test(errorMessage)) {
      return message
    }
  }
  
  // 3. Verifică dacă e un mesaj JSON și extrage eroarea
  if (errorMessage.includes('{') && errorMessage.includes('}')) {
    try {
      const jsonMatch = errorMessage.match(/\{[^{}]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        if (parsed.message && typeof parsed.message === 'string') {
          // Recursiv - verifică dacă mesajul parsat are o traducere
          return getUserFriendlyError(parsed.message, fallbackMessage)
        }
        if (parsed.error && typeof parsed.error === 'string') {
          return getUserFriendlyError(parsed.error, fallbackMessage)
        }
      }
    } catch {
      // Nu e JSON valid, continuă
    }
  }
  
  // 4. Verifică dacă mesajul conține "API Error:" și extrage partea relevantă
  if (errorMessage.includes('API Error:')) {
    const cleanMessage = errorMessage.replace(/API Error:\s*\d+\s*[^-]*-\s*/i, '').trim()
    if (cleanMessage && cleanMessage !== errorMessage) {
      return getUserFriendlyError(cleanMessage, fallbackMessage)
    }
  }
  
  // 5. Dacă mesajul pare deja user-friendly (în română), returnează-l
  if (/^[A-ZĂÂÎȘȚ]/.test(errorMessage) && errorMessage.length < 200 && !errorMessage.includes('Error:')) {
    // Verifică că nu conține termeni tehnici
    const technicalTerms = ['null', 'undefined', 'exception', 'stack', 'trace', 'at ', 'TypeError', 'ReferenceError']
    const hasTechnicalTerms = technicalTerms.some(term => errorMessage.toLowerCase().includes(term.toLowerCase()))
    if (!hasTechnicalTerms) {
      return errorMessage
    }
  }
  
  // 6. Fallback
  return fallbackMessage
}

/**
 * Transformă eroarea Stripe într-un mesaj user-friendly
 * @param stripeError - Obiectul de eroare de la Stripe
 * @returns Mesaj user-friendly în română
 */
export function getStripeErrorMessage(stripeError: { code?: string; decline_code?: string; message?: string }): string {
  // Încearcă decline_code mai întâi (mai specific)
  if (stripeError.decline_code) {
    const mapped = ERROR_MAPPINGS[stripeError.decline_code]
    if (mapped) return mapped
  }
  
  // Apoi error code
  if (stripeError.code) {
    const mapped = ERROR_MAPPINGS[stripeError.code]
    if (mapped) return mapped
  }
  
  // Apoi mesajul original
  if (stripeError.message) {
    return getUserFriendlyError(stripeError.message)
  }
  
  return 'A apărut o eroare la procesarea plății. Vă rugăm să încercați din nou.'
}

/**
 * Verifică dacă o eroare este recuperabilă (utilizatorul poate reîncerca)
 */
export function isRecoverableError(error: unknown): boolean {
  const message = getUserFriendlyError(error, '')
  
  // Erori care NU sunt recuperabile
  const nonRecoverable = [
    'cardul a fost raportat',
    'blocat',
    'furat',
    'pierdut',
    'restricții',
  ]
  
  const lowerMessage = message.toLowerCase()
  return !nonRecoverable.some(term => lowerMessage.includes(term))
}

