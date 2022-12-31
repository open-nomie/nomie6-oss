import Geohash from 'latlon-geohash'
import nid from '../../modules/nid/nid'

export type ILocation = {
  lat: number
  lng: number
  name: string
  hash?: string
  id?: string
}

export default class Location {
  lat: number
  lng: number
  name: string
  hash?: string
  id: string

  constructor(starter: any) {
    this.lat = starter.lat
    this.lng = starter.lng
    this.name = starter.name
    this.hash = starter.hash || this.getGeoHash()
    this.id = starter.id || `${this.hash}:${nid(4)}`
  }
  getGeoHash(): string {
    return Geohash.encode(this.lat, this.lng, 10)
  }
}
