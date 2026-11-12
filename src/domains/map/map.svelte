<svelte:options runes={true} />

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

  // Configure Leaflet default icon paths for PWA compatibility
  L.Icon.Default.mergeOptions({
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
  })

  // consts
  const dispatch = createEventDispatcher()
  const id = `map-${Math.random().toString().replace('.', '')}`

  // Setup GeoCode SErvice
  const geocodeService = esri_geo.geocodeService()

  // Leaflet Map Holder
  let MAP = $state(undefined)
  let _el = $state(undefined)

  type NLocationType = {
    name: string
    lat: number
    lng: number
    log?: NLog
  }

  // Local State
  let data = $state({
    locationName: null,
    activeLocation: null,
    locating: false,
    lat: null,
    lng: null,
    showLocations: false,
    height: `100px`,
  })

  let lastLocations = $state(undefined)
  let markers = $state<Array<any>>([])

  let { locations = $bindable(), records = $bindable(), small, picker, height, className, style, lock = $bindable(), hideFavorite, methods } = $props()

  $effect(() => {
    if (locations && JSON.stringify(locations) !== lastLocations) {
      try {
        lastLocations = JSON.stringify(locations)
        initAndRender()
      } catch (e) {
        console.error(`Location change error`, e.message)
      }
    }
  })

  async function initAndRender() {
    try {
      if (methods) {
        await methods.init()
        methods.renderMap()
      } else if (_el && (locations.length > 0 || picker)) {
        // Default map initialization when methods not provided
        // Initialize for: (1) locations to display, (2) picker mode to select location
        const mapElement = _el.querySelector('.n-map')
        if (mapElement && !MAP) {
          // Use requestAnimationFrame to ensure element is laid out before Leaflet initializes
          requestAnimationFrame(() => {
            const rect = mapElement.getBoundingClientRect()
            if (rect.width > 0 && rect.height > 0) {
              // Default view: first location, or center of map for picker mode
              const centerLat = locations.length > 0 ? locations[0].lat : 20
              const centerLng = locations.length > 0 ? locations[0].lng : 0
              const zoom = locations.length > 0 ? 8 : 2

              MAP = L.map(mapElement).setView([centerLat, centerLng], zoom)
              L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
              }).addTo(MAP)

              // Add markers for each location
              locations.forEach((loc) => {
                L.marker([loc.lat, loc.lng]).addTo(MAP).bindPopup(loc.name || 'Location')
              })

              // Fit map to show all locations
              if (locations.length > 1) {
                const bounds = L.latLngBounds(
                  locations.map((loc) => [loc.lat, loc.lng])
                )
                MAP.fitBounds(bounds, { padding: [50, 50] })
              }
            }
          })
        }
      }
    } catch (e) {
      console.error(`init and render error`, e.message)
    }
  }

  $effect(() => {
    if ((!locations || !locations.length) && records && records.length) {
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
        console.error(`Location || record length reaction error`, e.message)
      }
    }
  })

  $effect(() => {
    if (picker && MAP && locations.length == 0) {
      try {
        locate()
          .then((location: { latitude: number; longitude: number }) => {
            locations.push({
              lat: location.latitude,
              lng: location.longitude,
              name: 'Unnamed',
            })
            MAP.setView(L.latLng(location.latitude, location.longitude), 8)
          })
          .catch((e) => {})
      } catch (e) {
        console.error('Picker reaction error', e.message)
      }
    }
  })

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
    height: 100%;
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
    bottom: 0;
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
