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
 * Parsează un string YYYY-MM-DD într-un obiect Date în timezone-ul local
 * (fără conversie la UTC)
 */
export function parseYYYYMMDDToDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  // month - 1 pentru că getMonth() returnează 0-11
  return new Date(year, month - 1, day)
}

