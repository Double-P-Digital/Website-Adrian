import { en } from '../../public/locales/en'
import { ro } from '../../public/locales/ro'

// Export default sincron pentru backwards compatibility (folosit în Client Components)
// Client Components ar trebui să folosească useT() din @/hooks/useT în loc de acest import
// Dar păstrăm acest export pentru compatibilitate cu codul existent
const T = ro
export default T

// Funcție async pentru Server Components - citește limba din cookies
// Această funcție trebuie importată separat: import { getT } from '@/utils/getT'
export async function getT() {
  // Dynamic import pentru a evita importarea cookies() în Client Components
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  const language = cookieStore.get('language')?.value || 'ro'
  return language === 'en' ? en : ro
}
