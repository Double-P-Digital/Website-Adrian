'use client'

import {
  Bathtub01Icon,
  Bathtub02Icon,
  BedBunkIcon,
  BedSingle01Icon,
  BodySoapIcon,
  Calendar01Icon,
  Car01Icon,
  CctvCameraIcon,
  Comment01Icon,
  CropIcon,
  HairDryerIcon,
  House04Icon,
  ImageAdd02Icon,
  IronIcon,
  MeetingRoomIcon,
  MicrowaveIcon,
  RealEstate02Icon,
  RefrigeratorIcon,
  Settings03Icon,
  Setup02Icon,
  ShampooIcon,
  ShowerIcon,
  Speaker01Icon,
  Task01Icon,
  Timer02Icon,
  TowelIcon,
  TvSmartIcon,
  WashingMachineIcon,
  WaterEnergyIcon,
  Wifi01Icon,
} from '@/components/Icons'
import { useT } from '@/hooks/useT'
import ButtonSecondary from '@/shared/ButtonSecondary'
import { Divider } from '@/shared/divider'
import { SectionHeading, SectionSubheading } from '../../components/SectionHeading'

interface SectionAmenitiesProps {
  amenities: string[]
}

export default function SectionAmenities({ amenities }: SectionAmenitiesProps) {
  const T = useT()
  const ListingPage = T.ListingPage as Record<string, string>
  
  // Remove duplicate amenities
  const uniqueAmenities = [...new Set(amenities)]

  // ✅ Funcție helper pentru normalizare (case-insensitive, trim, lowercase)
  const normalizeAmenity = (amenity: string): string => {
    return amenity.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  // ✅ Map amenities icons cu multiple variante (case-insensitive)
  // Cheile sunt normalizate (lowercase, trimmed)
  const amenityIcons: { [key: string]: any } = {
    // WiFi variants
    'wifi': Wifi01Icon,
    'wi-fi': Wifi01Icon,
    'wireless': Wifi01Icon,
    'fast wifi': Wifi01Icon,
    'internet': Wifi01Icon,
    'free wifi': Wifi01Icon,
    'wifi gratuit': Wifi01Icon,
    'wifi gratuit inclus': Wifi01Icon,
    'internet wireless': Wifi01Icon,
    'internet wireless este disponibil în întregul hotel şi este gratuit': Wifi01Icon,
    'wireless internet': Wifi01Icon,
    'free wireless': Wifi01Icon,
    'gratuit wifi': Wifi01Icon,
    
    // TV variants
    'tv': TvSmartIcon,
    'television': TvSmartIcon,
    'smart tv': TvSmartIcon,
    'tv smart': TvSmartIcon,
    'flat screen tv': TvSmartIcon,
    'tv cu ecran plat': TvSmartIcon,
    'televizor': TvSmartIcon,
    'ecran plat': TvSmartIcon,
    'flat screen': TvSmartIcon,
    'tv flat screen': TvSmartIcon,
    'televizor cu ecran plat': TvSmartIcon,
    'smart television': TvSmartIcon,
    
    // Kitchen variants
    'kitchen': MeetingRoomIcon,
    'full kitchen': MeetingRoomIcon,
    'kitchenette': MeetingRoomIcon,
    'cooking facilities': MeetingRoomIcon,
    'bucătărie': MeetingRoomIcon,
    'bucatarie': MeetingRoomIcon,
    'bucatarie completa': MeetingRoomIcon,
    'bucătărie mică': MeetingRoomIcon,
    'bucatarie mica': MeetingRoomIcon,
    'facilități de gătit': MeetingRoomIcon,
    'facilitati de gatit': MeetingRoomIcon,
    
    // Parking variants
    'parking': Car01Icon,
    'free parking': Car01Icon,
    'parking space': Car01Icon,
    'car parking': Car01Icon,
    'garage': Car01Icon,
    'parcare': Car01Icon,
    'parcare gratuită': Car01Icon,
    'parcare gratuita': Car01Icon,
    'nu exista parcare disponibila': Car01Icon,
    'no parking available': Car01Icon,
    'spațiu de parcare': Car01Icon,
    'spatiu de parcare': Car01Icon,
    'parcare auto': Car01Icon,
    
    // Air conditioning variants
    'ac': WaterEnergyIcon,
    'air conditioning': WaterEnergyIcon,
    'air conditioner': WaterEnergyIcon,
    'climate control': WaterEnergyIcon,
    'cooling': WaterEnergyIcon,
    'aer condiționat': WaterEnergyIcon,
    'aer conditionat': WaterEnergyIcon,
    'aer condiţionat': WaterEnergyIcon,
    
    // Heating variants
    'heating': WaterEnergyIcon,
    'central heating': WaterEnergyIcon,
    'radiator': WaterEnergyIcon,
    'warm': WaterEnergyIcon,
    'încălzire': WaterEnergyIcon,
    'incalzire': WaterEnergyIcon,
    'încălzire centrală': WaterEnergyIcon,
    'incalzire centrala': WaterEnergyIcon,
    
    // Bathtub variants
    'bathtub': Bathtub02Icon,
    'bath': Bathtub02Icon,
    'bath tub': Bathtub02Icon,
    'cadă': Bathtub02Icon,
    'cada': Bathtub02Icon,
    'baie': Bathtub02Icon,
    
    // Hair dryer variants
    'hair dryer': HairDryerIcon,
    'hairdryer': HairDryerIcon,
    'hair-dryer': HairDryerIcon,
    'uscător de păr': HairDryerIcon,
    'uscat de par': HairDryerIcon,
    'uscător de par': HairDryerIcon,
    
    // Sound system variants
    'sound system': Speaker01Icon,
    'speakers': Speaker01Icon,
    'audio system': Speaker01Icon,
    'stereo': Speaker01Icon,
    'sistem audio': Speaker01Icon,
    'difuzoare': Speaker01Icon,
    
    // Washing machine variants
    'washing machine': WashingMachineIcon,
    'washer': WashingMachineIcon,
    'laundry': WashingMachineIcon,
    'washing': WashingMachineIcon,
    'mașină de spălat': WashingMachineIcon,
    'masina de spalat': WashingMachineIcon,
    'maşină de spălat': WashingMachineIcon,
    
    // Dryer variants
    'dryer': WashingMachineIcon,
    'clothes dryer': WashingMachineIcon,
    'uscător de rufe': WashingMachineIcon,
    
    // Balcony/Terrace variants
    'balcony': RealEstate02Icon,
    'balcon': RealEstate02Icon,
    'terrace': RealEstate02Icon,
    'terasă': RealEstate02Icon,
    'terrace/balcony': RealEstate02Icon,
    
    // Family rooms
    'family room': BedBunkIcon,
    'camere de familie': BedBunkIcon,
    'family rooms': BedBunkIcon,
    'family accommodation': BedBunkIcon,
    
    // Shower variants
    'shower': ShowerIcon,
    'duş': ShowerIcon,
    'dus': ShowerIcon,
    'shower cabin': ShowerIcon,
    'cabină de duș': ShowerIcon,
    'cabina de dus': ShowerIcon,
    'duș cabină': ShowerIcon,
    'dus cabina': ShowerIcon,
    
    // View variants
    'view': CropIcon,
    'vedere': CropIcon,
    'mountain view': ImageAdd02Icon,
    'vedere la munte': ImageAdd02Icon,
    'sea view': ImageAdd02Icon,
    'city view': ImageAdd02Icon,
    'panoramic view': ImageAdd02Icon,
    'vedere la mare': ImageAdd02Icon,
    'vedere la oras': ImageAdd02Icon,
    'vedere la oraș': ImageAdd02Icon,
    'vedere panoramică': ImageAdd02Icon,
    'vedere panoramica': ImageAdd02Icon,
    'exterior/vedere': ImageAdd02Icon,
    
    // Non-smoking rooms
    'non-smoking': Task01Icon,
    'camere pentru nefumători': Task01Icon,
    'non smoking': Task01Icon,
    'no smoking': Task01Icon,
    'fumatul interzis': Task01Icon,
    'smoke-free': Task01Icon,
    'fumatul interzis în toate spațiile publice și private': Task01Icon,
    'fumatul interzis in toate spatiile publice si private': Task01Icon,
    'fumatul interzis în toate spaţiile publice şi private': Task01Icon,
    'smoking prohibited': Task01Icon,
    'smoking not allowed': Task01Icon,
    'no smoking rooms': Task01Icon,
    'camere nefumători': Task01Icon,
    
    // Microwave
    'microwave': MicrowaveIcon,
    'cuptor cu microunde': MicrowaveIcon,
    'microwave oven': MicrowaveIcon,
    'cuptor microunde': MicrowaveIcon,
    'microunde': MicrowaveIcon,
    
    // Refrigerator
    'refrigerator': RefrigeratorIcon,
    'frigider': RefrigeratorIcon,
    'fridge': RefrigeratorIcon,
    'refrigerator/freezer': RefrigeratorIcon,
    'frigider/congelator': RefrigeratorIcon,
    'frigider congelator': RefrigeratorIcon,
    'freezer': RefrigeratorIcon,
    'congelator': RefrigeratorIcon,
    
    // Bed linens
    'bed linens': BedSingle01Icon,
    'lenjerie de pat': BedSingle01Icon,
    'linens': BedSingle01Icon,
    'bedding': BedSingle01Icon,
    'sheets': BedSingle01Icon,
    'lenjerie': BedSingle01Icon,
    'așternuturi': BedSingle01Icon,
    'asternuturi': BedSingle01Icon,
    'cearșafuri': BedSingle01Icon,
    'cearsafuri': BedSingle01Icon,
    'bed sheets': BedSingle01Icon,
    
    // Toilet paper
    'toilet paper': BodySoapIcon,
    'hârtie igienică': BodySoapIcon,
    'toilet tissue': BodySoapIcon,
    'hartie igienica': BodySoapIcon,
    'hârtie igienica': BodySoapIcon,
    'hartie igienică': BodySoapIcon,
    
    // Towels
    'towels': TowelIcon,
    'prosoape': TowelIcon,
    'bath towels': TowelIcon,
    'prosoape de baie': TowelIcon,
    'bath towel': TowelIcon,
    
    // Toilet
    'toilet': Bathtub01Icon,
    'toaletă': Bathtub01Icon,
    'wc': Bathtub01Icon,
    'restroom': Bathtub01Icon,
    'toaleta': Bathtub01Icon,
    'toiletă privată': Bathtub01Icon,
    'toaleta privata': Bathtub01Icon,
    'private toilet': Bathtub01Icon,
    
    // Iron
    'iron': IronIcon,
    'fier de călcat': IronIcon,
    'ironing board': IronIcon,
    'iron and ironing board': IronIcon,
    'fier de calcat': IronIcon,
    'masă de călcat': IronIcon,
    'masa de calcat': IronIcon,
    'fier și masă de călcat': IronIcon,
    'fier si masa de calcat': IronIcon,
    
    // Coffee/Tea maker
    'coffee maker': Setup02Icon,
    'aparat pentru prepararea de ceai/cafea': Setup02Icon,
    'tea/coffee maker': Setup02Icon,
    'coffee machine': Setup02Icon,
    'tea maker': Setup02Icon,
    'kettle': Setup02Icon,
    'aparat ceai cafea': Setup02Icon,
    'aparat cafea': Setup02Icon,
    'aparat ceai': Setup02Icon,
    'mașină de cafea': Setup02Icon,
    'masina de cafea': Setup02Icon,
    'ceainic': Setup02Icon,
    'electric kettle': Setup02Icon,
    
    // Invoice available
    'invoice available': Comment01Icon,
    'factură disponibilă': Comment01Icon,
    'invoice on request': Comment01Icon,
    'receipt available': Comment01Icon,
    'factura disponibila': Comment01Icon,
    'factură disponibilă la cerere': Comment01Icon,
    'factura disponibila la cerere': Comment01Icon,
    'chitanță disponibilă': Comment01Icon,
    'chitanta disponibila': Comment01Icon,
    'receipt on request': Comment01Icon,
    
    // Private check-in/check-out
    'private check-in': Calendar01Icon,
    'check-in/check-out privat': Calendar01Icon,
    'private check-out': Calendar01Icon,
    'private check-in/check-out': Calendar01Icon,
    'express check-in': Calendar01Icon,
    'express check-out': Calendar01Icon,
    'check-in privat': Calendar01Icon,
    'check-out privat': Calendar01Icon,
    'check-in rapid': Calendar01Icon,
    'check-out rapid': Calendar01Icon,
    'express check in': Calendar01Icon,
    'express check out': Calendar01Icon,
    
    // Smoke alarm
    'smoke alarm': CctvCameraIcon,
    'alarmă de fum': CctvCameraIcon,
    'smoke detector': CctvCameraIcon,
    'fire alarm': CctvCameraIcon,
    'alarma de fum': CctvCameraIcon,
    'detector de fum': CctvCameraIcon,
    'alarmă de incendiu': CctvCameraIcon,
    'alarma de incendiu': CctvCameraIcon,
    'fire detector': CctvCameraIcon,
    
    // Key access
    'key access': Settings03Icon,
    'acces cu cheia': Settings03Icon,
    'key card access': Settings03Icon,
    'electronic key': Settings03Icon,
    'keyless entry': Settings03Icon,
    'acces cu card cheie': Settings03Icon,
    'cheie electronică': Settings03Icon,
    'cheie electronica': Settings03Icon,
    'acces fără cheie': Settings03Icon,
    'acces fara cheie': Settings03Icon,
    'electronic key card': Settings03Icon,
    
    // Additional amenities from the list
    'media/tehnologie': TvSmartIcon,
    'media tehnologie': TvSmartIcon,
    'facilităţile camerei': Setup02Icon,
    'facilitatile camerei': Setup02Icon,
    'room facilities': Setup02Icon,
    'exterior': RealEstate02Icon,
    'mâncăruri și băuturi': Setup02Icon,
    'mancaruri si bauturi': Setup02Icon,
    'food and drinks': Setup02Icon,
    'servicii de recepție': Calendar01Icon,
    'servicii de receptie': Calendar01Icon,
    'reception services': Calendar01Icon,
    'altele': Settings03Icon,
    'others': Settings03Icon,
    'other amenities': Settings03Icon,
    'siguranță': CctvCameraIcon,
    'siguranta': CctvCameraIcon,
    'security': CctvCameraIcon,
    'limbi vorbite': Settings03Icon,
    'languages spoken': Settings03Icon,
    'engleză': Settings03Icon,
    'engleza': Settings03Icon,
    'english': Settings03Icon,
    'română': Settings03Icon,
    'romana': Settings03Icon,
    'romanian': Settings03Icon,
  }

  const getAmenityIcon = (amenity: string) => {
    const normalized = normalizeAmenity(amenity)
    
    // Caută exact match
    if (amenityIcons[normalized]) {
      return amenityIcons[normalized]
    }
    
    // Caută partial match (dacă amenity conține unul dintre cuvintele cheie)
    for (const [key, icon] of Object.entries(amenityIcons)) {
      if (normalized.includes(key) || key.includes(normalized)) {
        return icon
      }
    }
    
    // Fallback: icon default
    return Wifi01Icon
  }

  
  const getTranslatedAmenity = (amenity: string): string => {
    // Caută traducerea exactă
    if (ListingPage[amenity]) {
      return ListingPage[amenity]
    }
    // Dacă nu există traducere, returnează amenity-ul original
    return amenity
  }

  return (
    <div className="listingSection__wrap">
      <div>
        <SectionHeading>{ListingPage['Amenities'] || 'Amenities'}</SectionHeading>
        <SectionSubheading>
          {ListingPage['About the property amenities and services'] || "About the property's amenities and services"}
        </SectionSubheading>
      </div>
      <Divider className="w-14!" />

      {uniqueAmenities.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-6 text-sm text-neutral-700 xl:grid-cols-3 dark:text-neutral-300">
            {uniqueAmenities.slice(0, 12).map((amenity: string, index: number) => {
              const Icon = getAmenityIcon(amenity)
              const translatedAmenity = getTranslatedAmenity(amenity)
              return (
                <div key={`${amenity}-${index}`} className="flex items-center gap-x-3">
                  <Icon className="h-6 w-6" />
                  <span>{translatedAmenity}</span>
                </div>
              )
            })}
          </div>

          {uniqueAmenities.length > 12 && (
            <>
              <div className="w-14 border-b border-neutral-200"></div>
              <div>
                <ButtonSecondary>
                  {ListingPage['View'] || 'View'} {uniqueAmenities.length - 12} {ListingPage['more amenities'] || 'more amenities'}
                </ButtonSecondary>
              </div>
            </>
          )}
        </>
      ) : (
        <p className="text-neutral-500">{ListingPage['No amenities information available'] || 'No amenities information available.'}</p>
      )}
    </div>
  )
}

