<script lang="ts">
  //svelte
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  // components
  // modules
  import locate from '../../modules/locate/locate'
  import distance from '../../modules/locate/distance'
  import Location from '../locations/LocationClass'

  import { slide } from 'svelte/transition'
  // stores

  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'

  import Button from '../../components/button/button.svelte'
  import NLog from '../nomie-log/nomie-log'
  import { NavigateCircleSolid, StarSolid } from '../../components/icon/nicons'
  import { openLogDisplay } from '../nomie-log/log-display-modal/LogDisplayStore'
  import { wait } from '../../utils/tick/tick'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import LockClosedSolid from '../../n-icons/LockClosedSolid.svelte'
  import { quintOut } from 'svelte/easing'
  import { showToast } from '../../components/toast/ToastStore'
  import { LocationStore } from '../locations/LocationStore'

  // props
  export let locations: Array<NLocationType> = []

  export let records: Array<NLog> = []

  export let small: boolean = undefined
  export let picker: boolean = undefined
  export let height = undefined
  export let className = ''
  export let style = ''
  export let lock: boolean = false
  export let hideFavorite: boolean = false
  // export let activeLogs: Array<NLog> = []

  // const L: any = window['L']

  // Import CSS from Leaflet and plugins.
  import 'leaflet/dist/leaflet.css'

  // Import images directly that got missed via the CSS imports above.
  import 'leaflet/dist/images/marker-icon-2x.png'
  import 'leaflet/dist/images/marker-shadow.png'

  // Import JS from Leaflet and plugins.
  // import 'leaflet/dist/leaflet'
  import L from 'leaflet'
  import * as esri_geo from 'esri-leaflet-geocoder'

  // consts
  const dispatch = createEventDispatcher()
  const id = `map-${Math.random().toString().replace('.', '')}`

  // Setup GeoCode SErvice
  const geocodeService = esri_geo.geocodeService()

  // Leaflet Map Holder
  let MAP = undefined
  let _el

  type NLocationType = {
    name: string
    lat: number
    lng: number
    log?: NLog
  }

  // Local State
  let data = {
    locationName: null,
    activeLocation: locations[locations.length - 1] || null,
    locating: false,
    lat: null,
    lng: null,
    showLocations: false,
    height: `100px`,
  }

  let lastLocations

  $: if (locations && JSON.stringify(locations) !== lastLocations) {
    try {
      lastLocations = JSON.stringify(locations)
      initAndRender()
    } catch (e) {
      console.error(`Location change error`, e.message)
    }
  }

  async function initAndRender() {
    try {
      await methods.init()
      methods.renderMap()
    } catch (e) {
      console.error(`init and render error`, e.message)
    }
  }

  $: if (!locations.length && records.length) {
    try {
      let locs = records
        .filter((r) => r.lat)
        .map((record) => {
          return {
            lat: record.lat,
            lng: record.lng,
            name: record.location,
            log: record,
          }
        })
      locations = locs
    } catch (e) {
      console.error(`Location || record length reaction error`, e.mesasge)
    }
  }

  $: if (picker && MAP && locations.length == 0) {
    try {
      locate()
        .then((location: { latitude: number; longitude: number }) => {
          locations.push({
            lat: location.latitude,
            lng: location.longitude,
            name: 'Unnamed',
          })
          MAP.setView(L.latLng(location.latitude, location.longitude), 12)
        })
        .catch((e) => {})
    } catch (e) {
      console.error('Picker reaction error', e.message)
    }
  }

  async function selectSavedLocation() {
    let buttons = $LocationStore.map((loc: Location) => {
      return {
        title: loc.name,
        icon: NavigateCircleSolid,
        click: () => {
          methods.setLocation(loc)

          dispatch('change', loc)
        },
      }
    })

    Interact.popmenu({
      id: `locations-view`,
      title: `${Lang.t('location.saved-locations', 'Saved Locations')}`,
      buttons,
    })
  }

  let markers: Array<any> = []

  // methods
  export let methods = {
    init() {
      markers = []
      if (_el) {
        data.height = _el?.parentElement?.clientHeight
      }

      /** Initialize map **/
      return new Promise((resolve, reject) => {
        if (document.getElementById(id)) {
          MAP = new L.Map(id).fitWorld()

          var arcgisOnline = esri_geo.arcgisOnlineProvider()

          let searchController = esri_geo.geosearch({
            zoomToResult: true,
            placeholder: 'Search',
            useMapBounds: 25,
            providers: [
              arcgisOnline,
              esri_geo.mapServiceProvider({
                label: 'States and Counties',
                url: 'https://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer',
                layers: [2, 3],
                searchFields: ['NAME', 'STATE_NAME'],
              }),
            ],
          })

          searchController.on('results', (data) => {
            if (data.latlng) {
              let location = new Location({
                lat: data.latlng.lat,
                lng: data.latlng.lng,
                name: data.text,
              })
              methods.setLocation(location)
            }
          })

          let moveTimeout
          const onMove = () => {
            let center = MAP.getCenter()
            let lat = center.lat
            let lng = center.lng
            data.lat = lat
            data.lng = lng
            // Stop this from being called multiple times.

            /**
             * Fire the Move action -
             * encased so we can only do it so often
             **** */
            const fireMove = async () => {
              // let loc = await methods.getLocation(lat, lng);
              // data.locationName = loc.Match_addr;
              dispatch(
                'change',
                new Location({
                  ...MAP.getCenter(),
                  ...{ location: data.locationName },
                  ...{ name: data.locationName },
                })
              )
            }
            // Clear Timeout
            clearTimeout(moveTimeout)
            // Set 1s timeout
            moveTimeout = setTimeout(() => {
              // Fire Move
              fireMove()
            }, 1000)
          }

          // Clear any moveend listeners
          MAP.off('moveend', onMove)
          // If we're picking an address do the following
          if (picker) {
            // Add the Search Controller
            searchController.addTo(MAP)
            MAP.on('moveend', onMove)
          }

          // Clean up the layers
          MAP.eachLayer(function (layer) {
            MAP.removeLayer(layer)
          })

          // return map

          resolve(MAP)
        } // end no map
      })
    },
    deleteLocation(location) {
      Interact.confirm(`${Lang.t('general.delete')} ${location.name}?`).then((res) => {
        if (res) {
          LocationStore.remove(location)
        }
      })
    },
    editName(location) {
      Interact.prompt('Location Name', null, { value: location.name }).then((res) => {
        location.name = res
        LocationStore.upsert(location)
      })
    },
    setLocation(location) {
      data.locationName = location.name
      data.lat = location.lat
      data.lng = location.lng
      locations = [location]
      data.showLocations = false
      MAP.setView(L.latLng(location.lat, location.lng), 12)
      dispatch('location', location)
    },
    /**
     * Save the current Location
     */
    saveLocation() {
      LocationStore.upsert(
        new Location({
          name: data.locationName,
          lat: data.lat,
          lng: data.lng,
        })
      ).then((loc) => {
        showToast({ message: `${Lang.t('general.saved', 'Saved')}` })
      })
      // Locations.save({
      //   name: data.locationName,
      //   lat:
      // })
    },

    renderMap() {
      let copy =
        '&copy; <a href="https://www.openstreetmap.org/">OSM</a> <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
      let mapTheme = `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png`
      if (_el) {
        if (document.documentElement.classList.contains('mode-dark')) {
          mapTheme = `https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png`
        }
        // Add Attribution
        L.tileLayer(mapTheme, {
          attribution: copy,
          maxZoom: 18,
        }).addTo(MAP)

        var myIcon = L.icon({
          iconUrl: '/images/map/map-marker.svg',
          iconRetinaUrl: '/images/map/map-marker.svg',
          iconSize: [32, 32],
          iconAnchor: [9, 21],
          popupAnchor: [0, -14],
        })

        // let latLngArray = locations.map((loc) => {
        //   return new L.marker([loc.lat, loc.lng])
        // })

        // Quick Add Marker Function
        let addMarker = (latLng, name, click) => {
          let mkr = new L.marker(latLng, {
            icon: myIcon,
          })

          // If location name is present (TODO) show it in a popup
          if (name) {
            mkr.bindPopup(name)
          }
          mkr.on('click', click)
          mkr.addTo(MAP)

          markers.push(mkr)
        }

        /**
         * PIN RENDERING
         * If maxDistance between them is greater than 0.1 km
         */
        let latLngArray = locations.map((l: NLocationType): Array<number> => {
          return [l.lat, l.lng]
        })
        //@ts-ignore
        let maxDistance: any = distance.furthest(latLngArray, 'nm')

        if (maxDistance > 0.5) {
          // Loop over locaitons provided in props
          locations.forEach((loc) => {
            addMarker([loc.lat, loc.lng], loc.name, () => {
              // On Marker Click
              data.activeLocation = loc
              // If a log exists - show the Share Log popup
              if (loc.log) {
                // Interact.shareLog(loc.log)
                openLogDisplay(loc.log)
              }
            })
          })

          let connectTheDots = (data) => {
            // TODO: Look at making this curved dotted lines - and not just straight ones
            var c = []
            data.forEach((location) => {
              c.push([location.lat, location.lng])
            })
            return c
          }
          //let pathLine =
          L.polyline(connectTheDots(locations), {
            color: 'rgba(2.7%, 52.5%, 100%, 0.378)',
          }).addTo(MAP)
        } else {
          // Max Distance is not enough to justify rendering a bunch of pins
          if (locations.length) {
            let runner: any
            addMarker([locations[0].lat, locations[0].lng], locations[0].name, () => {
              data.activeLocation = locations[0]
              const megaNote = locations.map((l) => l.log.note).join('\n\n')
              const firstLog = locations.find((l) => l.log.end).log
              clearTimeout(runner)
              runner = setTimeout(() => {
                openLogDisplay(new NLog({ note: megaNote, created: firstLog?.end }))
              }, 100)
            })
          }
        }

        // Make the map fit the bounds of all locations provided

        MAP.invalidateSize()
        methods.centerMap()
      }
    },
    centerMap() {
      if (markers.length) {
        try {
          var group = new L.featureGroup(markers)
          MAP.fitBounds(group.getBounds())
        } catch (e) {
          console.error(`Caught error trying to center ma`, e)
        }
      }
    },
    getLocation(lat, lng) {
      return new Promise((resolve, reject) => {
        geocodeService
          .reverse()
          .latlng([lat, lng])
          .run((error, result) => {
            resolve((result || {}).address || 'Unknown')
          })
      })
    },
  }

  // Reactive Location Lookup
  // $: getLocation = () => {
  //   return new Promise(resolve => {
  //     // If activeLocation is not null
  //     if (data.activeLocation) {
  //       // Look up lat long
  //       methods
  //         .getLocation(data.activeLocation.lat, data.activeLocation.lng)
  //         .then(address => {
  //           resolve(address);
  //         });
  //     } else {
  //       resolve(null);
  //     }
  //   });
  // };

  // let check = 1

  // On Mount
  onMount(async () => {
    await wait(600)
    initAndRender()
  })
</script>

<div
  bind:this={_el}
  class="{className} n-map-container relative {small ? 'small ' : ''}"
  style="{height ? `height: ${height}px;` : `min-height: ${data.height}px;`}
  {style}"
>
  {#if lock}
    <button
      transition:slide|global={{ duration: 200, easing: quintOut }}
      on:click={() => {
        lock = false
      }}
      class="map-lock-cover absolute top-0 left-0 right-0 bottom-0 w-full flex bg-opacity-10 p-5 justify-end items-start bg-black  z-10"
    >
      <IonIcon icon={LockClosedSolid} />
    </button>
  {/if}
  {#if picker}
    <div class="picker-cover">
      <div class="picker-target">
        <svg
          version="1.1"
          id="Capa_1"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 60 60"
          height="120"
          style="enable-background:new 0 0 60 60;"
          xml:space="preserve"
        >
          <g>
            <path
              d="M42,29h-5.08c-0.441-3.059-2.861-5.479-5.92-5.92V18c0-0.553-0.447-1-1-1s-1,0.447-1,1v5.08
              c-3.059,0.441-5.479,2.862-5.92,5.92H18c-0.553,0-1,0.447-1,1s0.447,1,1,1h5.08c0.441,3.059,2.861,5.479,5.92,5.92V42
              c0,0.553,0.447,1,1,1s1-0.447,1-1v-5.08c3.059-0.441,5.479-2.862,5.92-5.92H42c0.553,0,1-0.447,1-1S42.553,29,42,29z
              M30,35
              c-2.757,0-5-2.243-5-5s2.243-5,5-5s5,2.243,5,5S32.757,35,30,35z"
            />
          </g>
        </svg>
      </div>
    </div>
  {/if}
  <div class="n-map-wrapper" style="bottom:{picker ? '1px' : '0'}">
    <div {id} class="n-map" />
    {#if picker && $LocationStore.length && !hideFavorite}
      <Button className="favorites-button tap-icon" shape="rounded" icon on:click={selectSavedLocation}>
        <IonIcon icon={StarSolid} size={18} />
      </Button>
    {/if}
  </div>
</div>

<style lang="postcss" global>
  .n-map-container {
  }

  .geocoder-control-input {
    @apply dark:bg-black bg-white;
    @apply text-black dark:text-white;
  }

  .leaflet-touch .geocoder-control::after {
    content: '🔎';
    display: block;
    z-index: 1000;
  }

  .n-map-container .n-map-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1;
  }
  .picker-cover {
    pointer-events: none;
    position: absolute;
    top: -27px;
    bottom: 0;
    left: 12px;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }
  .picker-cover svg {
    fill: red;
    opacity: 0.5;
  }
  .map-lock-cover {
  }
  .leaflet-control-attribution {
    @apply dark:bg-black dark:text-gray-600;
  }
  .leaflet-control-attribution a {
    @apply dark:text-primary-500 dark:text-opacity-50;
  }
  .leaflet-control-zoom {
    @apply dark:bg-black;
    @apply rounded-lg;
    @apply overflow-hidden;
  }
  .leaflet-control-zoom a {
    border: none !important;
    @apply dark:bg-black dark:text-white;
    @apply border-none;
  }
  .leaflet-control-zoom-in .leaflet-disabled {
    @apply dark:bg-black dark:text-white;
    @apply opacity-25;
  }
  .leaflet-control-zoom a.leaflet-disabled {
    @apply dark:text-gray-700;
    @apply border-none;
  }
  .leaflet-container .leaflet-control-attribution {
    @apply dark:bg-black;
  }
  .n-map-container .n-map {
    width: 100%;
    height: 100%;
    flex-grow: 1;
    flex-shrink: 1;
    z-index: 100;
  }
  .n-map-wrapper .favorites-button {
    position: absolute;
    top: 10px;
    right: 10px;
    z-index: 200;
    background-color: rgba(255, 255, 255, 0.7);
  }
  .geocoder-control {
    display: none;
  }
</style>
