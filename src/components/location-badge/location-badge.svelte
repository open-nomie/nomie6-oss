<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import IonIcon from '../icon/ion-icon.svelte'
  import { NavigateCircleSolid } from '../icon/nicons'
  import { findNearestLocation, LocationStore } from '../../domains/locations/LocationStore'
  export let location

  export let className = undefined

  const dispatch = createEventDispatcher()

  let name = null
  let lat = null
  let lng = null

  $: if (location) {
    lat = location.lat
    lng = location.lng
    name = location.location
    if (!name) {
      let nearest = findNearestLocation({ lat, lng }, $LocationStore)
      if (nearest && nearest.name) {
        name = nearest.name
      } else if (lat) {
        name = `${lat.toFixed(2)},${lng.toFixed(2)}`
      }
    }
  }
</script>

{#if location}
  <button
    class={className || 'flex items-center text-xs text-left location-badge'}
    on:click={(evt) => {
      dispatch('click', evt)
    }}
  >
    <IonIcon icon={NavigateCircleSolid} size={18} className="text-primary-600 mr-1" />
    {#if name}
      <span class="font-medium line-clamp-1">{name}</span>
    {/if}
  </button>
{/if}
