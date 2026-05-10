export interface MarineLifeEntry {
  id?: string
  name: string
  scientificName?: string
  imageUrl?: string
  custom?: boolean
}

export interface DiveEntry {
  id: string
  country: string
  siteName: string
  date: string
  dayNumber?: number
  location: string
  maxDepth: number // stored in meters
  duration: number // minutes
  waterTemp: number // stored in celsius
  buddyName: string
  marineLife: MarineLifeEntry[]
  notes: string
  photos: string[] // base64 encoded images
  createdAt: string
}

export interface UnitPreferences {
  depth: 'meters' | 'feet'
  temperature: 'celsius' | 'fahrenheit'
}

export const METERS_TO_FEET = 3.28084
export const CELSIUS_TO_FAHRENHEIT = (c: number) => (c * 9) / 5 + 32
export const FAHRENHEIT_TO_CELSIUS = (f: number) => ((f - 32) * 5) / 9
export const FEET_TO_METERS = (f: number) => f / METERS_TO_FEET

export function convertDepth(value: number, from: 'meters' | 'feet', to: 'meters' | 'feet'): number {
  if (from === to) return value
  return from === 'meters' ? value * METERS_TO_FEET : FEET_TO_METERS(value)
}

export function convertTemp(value: number, from: 'celsius' | 'fahrenheit', to: 'celsius' | 'fahrenheit'): number {
  if (from === to) return value
  return from === 'celsius' ? CELSIUS_TO_FAHRENHEIT(value) : FAHRENHEIT_TO_CELSIUS(value)
}

export function formatDepth(meters: number, unit: 'meters' | 'feet'): string {
  const value = unit === 'meters' ? meters : meters * METERS_TO_FEET
  return `${value.toFixed(2)} ${unit === 'meters' ? 'm' : 'ft'}`
}

export function formatDepthBoth(meters: number): string {
  const feet = meters * METERS_TO_FEET
  return `${meters.toFixed(2)}m / ${feet.toFixed(2)}ft`
}

export function formatTemp(celsius: number, unit: 'celsius' | 'fahrenheit'): string {
  const value = unit === 'celsius' ? celsius : CELSIUS_TO_FAHRENHEIT(celsius)
  return `${value.toFixed(2)}°${unit === 'celsius' ? 'C' : 'F'}`
}

export function formatTempBoth(celsius: number): string {
  const fahrenheit = CELSIUS_TO_FAHRENHEIT(celsius)
  return `${celsius.toFixed(2)}°C / ${fahrenheit.toFixed(2)}°F`
}
