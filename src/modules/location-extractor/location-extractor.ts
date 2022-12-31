import type NLog from '../../domains/nomie-log/nomie-log'
import { encodeGeoHash } from '../geohash/geohash'

export type LocationExtractionType = {
  lat: number
  lng: number
  positive: number
  negative: number
}

const extractLocations = (logs: Array<NLog>): Array<LocationExtractionType> => {
  const locations: any = {}
  logs.forEach((log) => {
    if (log.lat) {
      const key = [encodeGeoHash(log.lat, log.lng)].join(',')
      locations[key] = locations[key] || {
        lat: log.lat,
        lng: log.lng,
        positive: 0,
        negative: 0,
        visits: 0,
      }
      locations[key].lat = log.lat
      locations[key].lng = log.lng
      locations[key].visits = locations[key].visits + 1
      if (log.score > 0) locations[key].positive = locations[key].positive + 1
      if (log.score < 0) locations[key].negative = locations[key].negative + 1
    }
  })

  return Object.keys(locations)
    .map((key) => {
      return locations[key]
    })
    .sort((a, b) => {
      return a.visits > b.visits ? 1 : -1
    })
}

export default extractLocations
