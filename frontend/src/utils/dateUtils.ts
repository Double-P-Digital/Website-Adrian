/**
 * Formatează o dată în format YYYY-MM-DD folosind timezone-ul local
 * (fără conversie la UTC, pentru a evita schimbarea datei cu o zi)
 */
export function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Parsează un string de dată într-un obiect Date în timezone-ul local
 * Acceptă formate: YYYY-MM-DD, YYYY-MM-DDTHH:mm:ss.sssZ, sau Date object
 */
export function parseYYYYMMDDToDate(dateString: string | Date): Date {
  // Dacă e deja Date object, returnează-l
  if (dateString instanceof Date) {
    return dateString
  }
  
  // Dacă e string gol sau undefined
  if (!dateString) {
    return new Date()
  }
  
  // Extrage doar partea YYYY-MM-DD (primele 10 caractere)
  const dateOnly = dateString.substring(0, 10)
  const parts = dateOnly.split('-')
  
  // Validare
  if (parts.length !== 3) {
    return new Date()
  }
  
  const year = parseInt(parts[0], 10)
  const month = parseInt(parts[1], 10)
  const day = parseInt(parts[2], 10)
  
  // Verifică dacă sunt numere valide
  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    return new Date()
  }
  
  // month - 1 pentru că getMonth() returnează 0-11
  return new Date(year, month - 1, day)
}

