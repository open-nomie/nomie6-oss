import LocationViewerModal from './location-viewer-modal.svelte'
import type NLog from '../nomie-log/nomie-log'
import { objectHash } from '../../modules/object-hash/object-hash'
import { openModal } from '../../components/backdrop/BackdropStore2'
import { writable } from 'svelte/store'

export type GeoType = {
  lat: number
  lng: number
  name: string
}
type LocationStoreType = {
  geo: Array<GeoType>
  logs: Array<NLog>
}

export const LocationViewerModalStore = writable<LocationStoreType | undefined>(undefined)
export const LocationEditorModalStore = writable<LocationStoreType | undefined>(undefined)

export const openLocationViewer = (geo: Array<GeoType>, logs?: Array<NLog>) => {
  openModal({
    id: `locations-${objectHash(geo)}`,
    component: LocationViewerModal,
    position: 'fullscreen',
    componentProps: {
      logs,
      locations: geo,
    },
  })
}

export const openLogLocation = (log: NLog) => {
  return openLocationViewer([log.geoType], [log])
}

export const closeLocationViewer = () => {
  LocationViewerModalStore.update((s) => undefined)
}
