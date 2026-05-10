export interface FishBaseSpecies {
  SpecCode: string
  Genus: string
  Species: string
  FBname: string
  Pic: number
  Shape: string
  Habitat: string
  DepthRange: string
}

const FISHBASE_API = 'https://fishbase.ropensci.org'

export async function searchFishBase(query: string, limit = 30): Promise<FishBaseSpecies[]> {
  if (!query || query.length < 2) return []

  try {
    // Use Species parameter for scientific name search (matches partial)
    const response = await fetch(
      `${FISHBASE_API}/species?Species=${encodeURIComponent(query)}&fields=SpecCode,Genus,Species,FBname,Pic,Shape,Habitat,DepthRange&limit=${limit}`
    )

    if (!response.ok) throw new Error('API request failed')

    const data = await response.json()
    
    // If no results from species search, try common name search
    if (data.length === 0) {
      const commonResponse = await fetch(
        `${FISHBASE_API}/species?FBname=${encodeURIComponent(query)}&fields=SpecCode,Genus,Species,FBname,Pic,Shape,Habitat,DepthRange&limit=${limit}`
      )
      
      if (commonResponse.ok) {
        return await commonResponse.json()
      }
      return []
    }

    return data.slice(0, limit)
  } catch (error) {
    console.error('FishBase API error:', error)
    return []
  }
}

export function getFishBaseImageUrl(genus: string, species: string): string {
  return `https://www.fishbase.de/images/Species/${genus}${species}.jpg`
}

export function getFishBaseThumbnailUrl(genus: string, species: string): string {
  return `https://www.fishbase.de/images/thumbnails/${genus}_${species}.jpg`
}

export function getFishBaseSpeciesUrl(genus: string, species: string): string {
  return `https://www.fishbase.se/summary/${genus}-${species}.html`
}