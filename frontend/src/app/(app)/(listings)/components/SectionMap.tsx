import { Divider } from '@/shared/divider'
import { SectionHeading, SectionSubheading } from './SectionHeading'

interface Props {
  className?: string
  address: string
  lat: number
  lng: number
}

const SectionMap = ({ className, address, lat, lng }: Props) => {
  // ✅ Generează Google Maps embed URL cu coordonate reale
  const googleMapsEmbedUrl = `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY}&q=${lat},${lng}&zoom=15`

  return (
    <div className="listingSection__wrap">
      {/* HEADING */}
      <div>
        <SectionHeading>Location</SectionHeading>
        {/* ✅ FOLOSEȘTE address real din backend */}
        <SectionSubheading>{address || 'Location not specified'}</SectionSubheading>
      </div>
      <Divider className="w-14!" />

      {/* MAP */}
      <div className="aspect-w-5 rounded-xl ring-1 ring-black/10 aspect-h-6 sm:aspect-h-3 lg:aspect-h-2">
        <div className="z-0 overflow-hidden rounded-xl">
          {/* ✅ FOLOSEȘTE lat/lng real din backend */}
          {lat !== 0 && lng !== 0 ? (
            <iframe
              width="100%"
              height="100%"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              src={googleMapsEmbedUrl}
              title={`Map of ${address}`}
            ></iframe>
          ) : (
            <div className="flex items-center justify-center h-full bg-neutral-100 dark:bg-neutral-800">
              <p className="text-neutral-500">Map location not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SectionMap