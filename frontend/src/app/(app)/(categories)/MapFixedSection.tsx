
import StayCard from '@/components/StayCard'
import { Listing } from '@/services/listings'
import { Button } from '@/shared/Button'
import ButtonClose from '@/shared/ButtonClose'
import { Checkbox, CheckboxField } from '@/shared/Checkbox'
import { Label } from '@/shared/fieldset'
import { ListingType } from '@/type'
import T from '@/utils/getT'
import { Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/solid'
import { AdvancedMarker, ControlPosition, Map, MapControl, useMap } from '@vis.gl/react-google-maps'
import { Fragment, useEffect, useState } from 'react'

interface Props {
  currentHoverID: string
  listings: Listing[]
  // The type of listing being displayed on the map.
  // This is used to determine the type of markers and interactions on the map.
  listingType: ListingType
  // The href for the close button, which will redirect to the category page.
  // This is used to close the map and return to the category listings.
  closeButtonHref: string
}

// Component pentru a controla centrarea hărții
const MapController = ({ selectedListingId, listings }: { selectedListingId: string; listings: Listing[] }) => {
  const map = useMap()
  
  useEffect(() => {
    if (!map || !selectedListingId) return
    
    const selectedListing = listings.find(listing => listing.id === selectedListingId)
    if (selectedListing) {
      map.setCenter({
        lat: selectedListing.map.lat,
        lng: selectedListing.map.lng,
      })
      map.setZoom(15) // Zoom mai aproape când se selectează un apartament
    }
  }, [map, selectedListingId, listings])
  
  return null
}

const MapFixedSection = ({ closeButtonHref, currentHoverID: selectedID, listings, listingType }: Props) => {
  const [currentHoverID, setCurrentHoverID] = useState<string>('')
  const [selectedListingId, setSelectedListingId] = useState<string>('')
  const [openCardId, setOpenCardId] = useState<string>('')

  useEffect(() => {
    setCurrentHoverID(selectedID)
  }, [selectedID])
  
  // Când se schimbă selectedID (de la click), setează selectedListingId pentru centrare
  useEffect(() => {
    if (selectedID) {
      setSelectedListingId(selectedID)
      setOpenCardId(selectedID)
    }
  }, [selectedID])

  // Handle card open - close other cards
  const handleCardOpen = (listingId: string) => {
    setOpenCardId(listingId)
    setCurrentHoverID(listingId)
    setSelectedListingId(listingId)
  }

  // Close card when clicking on map (not on a marker)
  const handleMapClick = () => {
    setOpenCardId('')
    setCurrentHoverID('')
  }

  return (
    <div className="fixed inset-0 top-0 z-40 flex-1/2 xl:static xl:z-0">
      <div className="fixed start-0 top-0 size-full overflow-hidden xl:sticky xl:top-0 xl:h-screen">
        <Map
          style={{
            width: '100%',
            height: '100%',
          }}
          defaultZoom={12}
          defaultCenter={listings[0]?.map || { lat: 46.7712, lng: 23.6236 }}
          gestureHandling={'greedy'}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAP_ID || undefined}
          onClick={handleMapClick}
        >
          <MapController selectedListingId={selectedListingId} listings={listings} />
          <MapControl position={ControlPosition.TOP_CENTER}>
            <div className="z-10 mt-5 min-w-max rounded-2xl bg-neutral-100 px-4 py-2 shadow-xl dark:bg-neutral-900">
              <CheckboxField>
                <Checkbox name="search_as_i_move" value="show_on_events_page" defaultChecked />
                <Label>Search as I move the map</Label>
              </CheckboxField>
            </div>
          </MapControl>
          {listings.map((item) => (
            <AdvancedMarker
              key={item.id}
              position={{
                lat: item.map.lat,
                lng: item.map.lng,
              }}
              zIndex={currentHoverID === item.id || openCardId === item.id ? 1000 : 1}
              onMouseEnter={() => {
                if (currentHoverID !== item.id) {
                  // to avoid unnecessary re-renders.
                  setCurrentHoverID(item.id)
                }
              }}
              onMouseLeave={() => {
                // Reset the hover ID when the mouse leaves the marker (only on desktop)
                if (openCardId !== item.id) {
                  setCurrentHoverID('')
                }
              }}
            >
              <AdvancedMarkerCard
                isSelected={(!!currentHoverID && currentHoverID === item.id) || openCardId === item.id}
                key={item.id}
                lat={item.map.lat}
                lng={item.map.lng}
                listing={item}
                listingType={listingType}
                onCardOpen={handleCardOpen}
              />
            </AdvancedMarker>
          ))}
        </Map>
        <div className="absolute top-3 left-3">
          <ButtonClose color="white" href={closeButtonHref} />
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 shadow-2xl">
          <Button color="white" href={closeButtonHref}>
            <XMarkIcon className="size-6" />
            <span>{T['common']['Hide map']}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MapFixedSection

const AdvancedMarkerCard = ({
  listing,
  listingType,
  isSelected,
  onCardOpen,
}: {
  listing: Listing 
  listingType: ListingType
  isSelected?: boolean
  lat: number
  lng: number
  onCardOpen?: (listingId: string) => void
}) => {
  const [isOpen, setIsOpen] = useState(false)

  // Handle click/touch for mobile
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    if (newIsOpen && onCardOpen) {
      onCardOpen(listing.id)
    }
  }

  // Close when another card is selected
  useEffect(() => {
    if (!isSelected) {
      setIsOpen(false)
    }
  }, [isSelected])

  return (
    <div 
      className="relative cursor-pointer" 
      onMouseEnter={() => setIsOpen(true)} 
      onMouseLeave={() => {
        // Only close on mouse leave if not explicitly opened by click
        if (!isSelected) {
          setIsOpen(false)
        }
      }}
      onClick={handleClick}
    >
      <p
        className={`flex min-w-max items-center justify-center rounded-lg px-2 py-1 text-sm font-semibold shadow-lg transition-colors ${
          isSelected || isOpen
            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
            : 'bg-white hover:bg-neutral-900 hover:text-white dark:bg-neutral-900 dark:hover:bg-white dark:hover:text-neutral-900'
        }`}
      >
        {listing.price}
      </p>
      <Transition
        show={isOpen || isSelected}
        as={Fragment}
        enter="transition-opacity duration-75"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-150"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="absolute top-full left-1/2 -translate-x-1/2 w-64 pt-3 z-50">
          <StayCard size="small" data={listing} className="shadow-2xl" />
        </div>
      </Transition>
    </div>
  )
}
