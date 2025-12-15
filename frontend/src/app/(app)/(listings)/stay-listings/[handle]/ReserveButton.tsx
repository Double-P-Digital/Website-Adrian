'use client'

import { useT } from '@/hooks/useT'
import ButtonPrimary from '@/shared/ButtonPrimary'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCurrency } from '@/context/CurrencyContext'
import { useLanguage } from '@/context/LanguageContext'
import { parseYYYYMMDDToDate } from '@/utils/dateUtils'

interface ReserveButtonProps {
  price: number // Price per night
  apartmentId?: string
}

export default function ReserveButton({ price, apartmentId }: ReserveButtonProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currency } = useCurrency()
  const { language } = useLanguage()
  const T = useT()

  // Calculate number of nights from URL
  const calculateNights = (): number => {
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    
    if (!checkin || !checkout) return 1
    
    try {
      const startDate = parseYYYYMMDDToDate(checkin)
      const endDate = parseYYYYMMDDToDate(checkout)
      const diffTime = endDate.getTime() - startDate.getTime()
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      return diffDays >= 1 ? diffDays : 1
    } catch {
      return 1
    }
  }

  const nights = calculateNights()
  // Trimite prețul în RON (original), nu convertit - checkout-ul va converti în funcție de currency-ul selectat
  // Prețul este PE NOAPTE, nu totalul

  const handleClick = () => {
    const params = new URLSearchParams({
      price: price.toString(), // Trimite prețul PE NOAPTE în RON (original)
      nights: nights.toString(),
    })
    
    // Add dates to URL if they exist
    const checkin = searchParams.get('checkin')
    const checkout = searchParams.get('checkout')
    if (checkin) params.set('checkin', checkin)
    if (checkout) params.set('checkout', checkout)
    
    // Add guests if they exist
    const guestAdults = searchParams.get('guestAdults')
    const guestChildren = searchParams.get('guestChildren')
    const guestRooms = searchParams.get('guestRooms')
    if (guestAdults) params.set('guestAdults', guestAdults)
    if (guestChildren) params.set('guestChildren', guestChildren)
    if (guestRooms) params.set('guestRooms', guestRooms)
    
    // Add currency and language to URL
    params.set('currency', currency)
    params.set('lang', language)
    
    if (apartmentId) {
      params.set('apartmentId', apartmentId)
    }
    router.push(`/checkout?${params.toString()}`)
  }

  return (
    <ButtonPrimary type="button" onClick={handleClick} className="w-full">
      {T.Booking['Reserve and pay'] || 'Reserve and pay'}
    </ButtonPrimary>
  )
}

