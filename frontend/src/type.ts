export interface GuestsObject {
  guestAdults?: number
  guestChildren?: number
  guestRooms?: number
}

export type ListingType = 'Stays'

export interface PropertyType {
  name: string
  description: string
  value: string
}

export interface ClassOfProperties extends PropertyType {}

export type DateRage = [Date | null, Date | null]
