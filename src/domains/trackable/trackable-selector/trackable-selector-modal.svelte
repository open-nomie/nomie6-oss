<svelte:options runes={true} />

<script lang="ts">
  import TrackableAvatar from '../../../components/avatar/trackable-avatar.svelte'
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'
  import Button from '../../../components/button/button.svelte'
  import Divider from '../../../components/divider/divider.svelte'
  import ListItem from '../../../components/list-item/list-item.svelte'

  import RadioButton from '../../../components/radio-button/radio-button.svelte'
  import SearchBar from '../../../components/search-bar/search-bar.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'

  import Toolbar from '../../../components/toolbar/toolbar.svelte'
  import TrackerClass from '../../../modules/tracker/TrackerClass'
  import { Lang } from '../../../store/lang'
  import { wait } from '../../../utils/tick/tick'
  import Person from '../../people/Person.class'

  import { toTrackableArray } from '../trackable-utils'
  import type { TrackableTypes } from '../Trackable.class'
  import { Trackable } from '../Trackable.class'
  import type {ITrackerType} from '../../../modules/tracker/TrackerClass'

  import { TrackableStore } from '../TrackableStore'
  import type { TrackableSelectorProps } from './TrackableSelectorStore'

  const { id, payload } = $props<{ id: string, payload: TrackableSelectorProps }>()

  let selected: Array<Trackable> = $state([])
  let searchTerm: string | undefined = $state(undefined)
  let cleanSearchTerm: string | undefined = $state(undefined)

  let known: Array<Trackable> = $state([])
  let unknownTrackables: Array<Trackable> = $state([])
  let type: TrackableTypes = $state(undefined)
  let subtype: ITrackerType = $state(undefined)

  const getHeaderKey = (label) => {
    return label.substring(0, 1).toUpperCase()
  }

  let groupedTrackables: Array<[string, Array<Trackable>]> = $state([])

  $effect(() => {
    if (payload) {
      type = payload.type
      subtype = payload.subtype
      let tempknown = toTrackableArray($TrackableStore.trackables).sort((a, b) => {
        return a.label.toLowerCase() > b.label.toLowerCase() ? 1 : -1
      })
      if (subtype) {
        known = tempknown.filter(function (el) {
          if (el.tracker) {
            return el.tracker.type === subtype
          }
        })
      } else {
        known = tempknown
      }
    }
  })

  /**
   * Close Modal
   */
  const close = async () => {
    closeModal(id)
  }

  const toggleTrackable = async (trackable) => {
    if (payload.multiple) {
      let foundIndex = selected.findIndex((d) => d == trackable)
      if (foundIndex > -1) {
        selected = selected.filter((d) => d !== trackable)
      } else {
        selected.push(trackable)
      }
    } else {
      selected = [trackable]
      await wait(100)
      onSelect()
    }
    selected = selected
  }

  const cleanTerm = (str:string):string => {
    return `${str || ''}`.replace(/(\@|\+|\#)/g, '')
  }

  const onSearchTerm = (term: string): void => {
    if (term && term.length > 0) {
      searchTerm = term.toLowerCase()
      cleanSearchTerm = searchTerm.replace(/(\@|\+|\#|\^)/g, '')
      unknownTrackables = [
        getUnknownTrackable('tracker'),
        getUnknownTrackable('person'),
        getUnknownTrackable('context'),
        getUnknownTrackable('pointer'),
      ]
    } else {
      searchTerm = undefined
      cleanSearchTerm = undefined
    }
  }
  let cleanedTerm = $derived(cleanTerm(searchTerm))
  let filtered = $derived(known.filter((t) => {
    if (cleanedTerm && payload.type) {
      return JSON.stringify(t).toLowerCase().search(cleanedTerm) > 1 && t.type === payload.type
    } else if (payload.type) {
      return t.type === payload.type
    } else if (searchTerm) {
      return JSON.stringify(t).toLowerCase().search(cleanedTerm) > 1
    }
    return t
  }))

  $effect(() => {
    if (filtered) {
      const groups = new Map<string, Array<Trackable>>()
      filtered.forEach((t) => {
        const key = getHeaderKey(t.label)
        if (!groups.has(key)) {
          groups.set(key, [])
        }
        groups.get(key).push(t)
      })
      groupedTrackables = Array.from(groups.entries())
    }
  })

  /**
   * On User Select
   */
  const onSelect = () => {
    payload.onSelect(selected)
    close()
  }

  /**
   * Generate a trackable based on the search term
   * if the user wants to select an unknown trackable
   * they should be allow to - this lets them
   * @param type
   */
  const getUnknownTrackable = (type: string): Trackable => {
    if (type === 'person') {
      return new Trackable({
        type: 'person',
        person: new Person({ username: cleanSearchTerm }),
      })
    } else if (type === 'context') {
      return new Trackable({
        type: 'context',
        context: cleanSearchTerm,
      })
    } else if (type === 'pointer') {
      return new Trackable({
        type: 'pointer',
        pointer: cleanSearchTerm,
      })
    } else {
      return new Trackable({
        type: 'tracker',
        tracker: new TrackerClass({
          tag: cleanSearchTerm,
        }),
      })
    }
  }
</script>

<BackdropModal className="bg-gray-100 dark:bg-gray-900">
  <header slot="header" class="bg-white dark:bg-black">
    <ToolbarGrid>
      <Button slot="left" clear primary on:click={close}>Close</Button>
      <h1 class="ntitle">{Lang.t('general.trackables', 'Trackables')}</h1>
      <Button on:click={onSelect} slot="right" className="whitespace-nowrap" disabled={!selected.length} clear primary
        >Select {selected.length ? `(${selected.length})` : ''}</Button
      >
    </ToolbarGrid>
    <Toolbar className="-mt-2 mb-2">
      <SearchBar
        autocomplete
        compact
        showClose={true}
        className="p-0 px-2 mt-1"
        on:clear={() => {
          searchTerm = undefined
          cleanSearchTerm = undefined
        }}
        on:change={(evt) => {
          onSearchTerm(evt.detail)
        }}
      >
        <select
          slot="right-inside"
          value={type || ''}
          on:input={(evt) => {
            //@ts-ignore
            payload.type = evt.target.value
          }}
          class="appearance-none text-right text-base text-primary-500 px-4 bg-transparent focus:outline-none rounded-md h-9 ring-inset focus:ring-1 ring-primary-500"
        >
          <option value="" selected>All Types</option>
          <option value="tracker">{Lang.t('general.trackers', 'Trackers')}</option>
          <option value="person">{Lang.t('general.people')}</option>
          <option value="context">{Lang.t('general.context')}</option>
          <option value="pointer">{Lang.t('general.pointer', 'Pointers')}</option>
        </select>
      </SearchBar>
    </Toolbar>
  </header>

  <section class="trackable-list relative">
    {#each groupedTrackables as [headerKey, trackables] (headerKey)}
      <header class="sticky top-0 z-50 text-gray-900 dark:text-gray-100 font-bold px-4 py-2 glass">
        {headerKey}
      </header>
      {#each trackables.filter((t) => t.tag) as trackable (trackable.tag)}
        <ListItem bottomLine={70} clickable on:click={() => toggleTrackable(trackable)}>
          <TrackableAvatar slot="left" size={42} {trackable} />
          <div>
            <h1 class="line-clamp-1">{trackable.label}</h1>
            <div class="flex items-center space-x-2">
              <div class="text-sm text-gray-500 line-clamp-1">{trackable.tag}</div>
            </div>
          </div>
          <RadioButton slot="right" className="pointer-events-none" checked={selected.indexOf(trackable) > -1} />
        </ListItem>
      {/each}
    {/each}
    {#if filtered.length === 0}
      <div class="px-4 text-center text-gray-500 py-4">No Known Trackers</div>

      {#each unknownTrackables as trackable}
        <button
          class="relative flex w-full text-left items-center py-2 px-4 space-x-4 justify-between z-20"
          on:click={() => toggleTrackable(trackable)}
        >
          {#if trackable.type == 'tracker'}
            <h2 class="ntitle filler">As tracker: #{cleanSearchTerm}</h2>
          {:else if trackable.type === 'context'}
            <h2 class="ntitle filler">As context: +{cleanSearchTerm}</h2>
            {:else if trackable.type === 'pointer'}
            <h2 class="ntitle filler">As pointer: ^{cleanSearchTerm}</h2>
          {:else if trackable.type === 'person'}
            <h2 class="ntitle filler">As person: @{cleanSearchTerm}</h2>
          {/if}
          <RadioButton className="pointer-events-none" checked={selected.indexOf(trackable) > -1} />
        </button>
        <Divider left={70} />
      {/each}
    {/if}
  </section>
</BackdropModal>
