import Location from './LocationClass'
import NPaths from '../../paths'
import { createArrayStore } from '../../store/ArrayStore'
import distance from '../../modules/locate/distance'

export const LocationStore = createArrayStore(NPaths.storage.locations(), {
  label: 'Locations',
  key: 'id',
  itemInitializer: (item) => {
    return new Location(item)
  },
  itemSerializer: (item: Location) => {
    return JSON.parse(JSON.stringify(item))
  },
})

export const findNearestLocation = (location: { lat: number; lng: number }, $store: Array<Location>): Location => {
  let match = [...$store]
    .map((loc) => {
      return {
        distance: distance.between([location.lat, location.lng], [loc.lat, loc.lng], 'nm'),
        location: loc,
      }
    })
    .sort((a, b) => {
      return a.distance > b.distance ? 1 : -1
    })
    .find((loc) => loc.distance < 0.1)

  if (match) {
    return match.location
  } else {
    return null
  }
}

export const findNearestLocationHeavy = (location: { lat: number; lng: number }): Location => {
  const raw = LocationStore.rawState()
  return findNearestLocation(location, raw)
}

let searchDebounce
export const findLocations = async (search: string): Promise<Array<Location>> => {
  return new Promise((resolve) => {
    clearTimeout(searchDebounce)
    searchDebounce = setTimeout(() => {
      lookupLocation(search).then((results) => {
        resolve(results)
      })
    }, 300)
  })
}

export const lookupLocationToLocation = async (lookup: LookupLocationType): Promise<Location | undefined> => {
  const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/findAddressCandidates?outSr=4326&forStorage=false&outFields=*&maxLocations=5&singleLine=${encodeURIComponent(
    lookup.name
  )}&magicKey=${lookup.magicKey}&f=json`
  const call = await fetch(url)
  const payload = await call.json()
  const firstCandidate = payload.candidates[0]
  if (firstCandidate) {
    const location = new Location({
      lat: firstCandidate.location.y,
      lng: firstCandidate.location.x,
      name: lookup.name,
    })
    return location
  }
  return undefined
}

export type LookupLocationType = {
  name: string
  magicKey: string
  lat: number
  lng: number
  saved?: boolean
}

export const searchForLocations = async (search: string): Promise<Array<LookupLocationType>> => {
  const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=${encodeURIComponent(
    search
  )}&maxSuggestions=5&f=json`
  const lookup = await fetch(url)
  const payload = await lookup.json()

  return (payload.suggestions || []).map((suggestion) => {
    return {
      name: suggestion.text,
      magicKey: suggestion.magicKey,
    }
  })
}
