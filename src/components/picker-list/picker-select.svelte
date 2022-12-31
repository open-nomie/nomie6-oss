<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import ListItem from '../list-item/list-item.svelte'

  import LabelMeta from '../label-meta/label-meta.svelte'

  import type { ITracker } from '../../modules/tracker/TrackerClass'
  import SearchBar from '../search-bar/search-bar.svelte'
  import Empty from '../empty/empty.svelte'
  import { Lang } from '../../store/lang'
  import type TrackerClass from '../../modules/tracker/TrackerClass'
import ToggleSwitch from '../toggle-switch/toggle-switch.svelte'


  const dispatch = createEventDispatcher()

  export let tracker: ITracker | TrackerClass

  export let active = []

  let picks = []
  let searchFilter: string

  $: {
    picks = tracker && tracker.picks ? tracker.picks : []
    if (searchFilter) {
      picks = picks.filter((p) => {
        return p.toLowerCase().search(`${searchFilter}`.toLowerCase()) > -1
      })
    }
  }

  function toggle(pick) {
    if (active.indexOf(pick) > -1) {
      active = active.filter((p) => {
        return p !== pick
      })
    } else {
      active.push(pick)
    }
    active = active
    setTimeout(() => {
      try {
        const active: any = document.activeElement
        active.blur()
      } catch (e) {}
    }, 120)
    fireChange()
  }

  function fireChange() {
    dispatch('change', active)
  }

  function isHeader(pick) {
    let lastCharacter = pick.trim().substr(pick.trim().length - 1, 1)
    return lastCharacter === ':'
  }
</script>

<div class="w-full p-2 bg-gray-100 dark:bg-gray-800 ">
  {#if tracker.picks.length > 10}
    <SearchBar
      autocomplete
      compact
      showClose={true}
      className="p-0 px-2"
      on:clear={() => {
        searchFilter = undefined
      }}
      on:change={(evt) => {
        if (evt.detail && evt.detail.length > 0) {
          searchFilter = evt.detail
        } else {
          searchFilter = undefined
        }
      }}
    />
  {/if}
  {#if picks.length == 0 && searchFilter}
    <Empty title={Lang.t('general.no-matches-found', 'No matches found')} />
  {/if}
  {#each picks || [] as pick, index (index)}
    {#if isHeader(pick)}
      <div class="text-gray-800 dark:text-gray-200 text-lg font-bold pt-5 pb-1 px-3 mt-1">
        {pick.replace(':', '')}
      </div>
    {:else}
      <ListItem
        bottomLine={54}
        style="min-height:40px;"
        compact
        clickable
        className="pl-3 pr-2 compact duration-75  {active.indexOf(pick) > -1
          ? 'bg-primary-500 bg-opacity-10 text-white'
          : 'bg-gray-200 dark:bg-gray-800'}"
        on:click={() => {
          toggle(pick)
        }}
      >
        <div slot="right" class="stiff flex items-center">
          <ToggleSwitch title={pick} value={active.indexOf(pick) > -1} />
          <!-- {#if active.indexOf(pick) > -1}
            <IonIcon icon={CheckmarkCircle} className="text-white" size={28} />
          {:else}
            <IonIcon
              icon={CircleOutline}
              className="text-gray-300 rounded-full bg-white dark:bg-black dark:text-gray-700 "
              size={28}
            />
          {/if} -->
        </div>
        <div class="flex items-center">
          <LabelMeta
            selected={active.indexOf(pick) > -1}
            className="w-full space-x-2"
            str={pick}
            titleClass={active.indexOf(pick) > -1 ? '' : ''}
          />
        </div>
      </ListItem>
    {/if}
  {/each}

  <div class="flex">
    <slot name="bottom" />
  </div>

  <!-- <div class="value">{tempValue}</div>
  <input
    type="range"
    bind:value={tempValue}
    {min}
    {max}
    on:change={() => {
      dispatch('change', parseInt(tempValue));
    }} /> -->
</div>

<style lang="postcss" global>
  .n-animate-pop {
    @apply transform transition-all duration-200;
    @apply scale-0;
    @apply opacity-0;
    @apply w-0;
  }
  .n-animate-pop.n-animate-show {
    @apply transform transition-all duration-200;
    @apply scale-100;
    @apply opacity-100;
    @apply w-12;
  }
</style>
