<script lang="ts">
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import NMap from '../../domains/map/map.svelte'

  import NItem from '../../components/list-item/list-item.svelte'

  import { Interact } from '../../store/interact'

  import Location from '../locations/LocationClass'
  import locate from '../../modules/locate/locate'
  import math from '../../utils/math/math'

  import { Lang } from '../../store/lang'
  import Button from '../../components/button/button.svelte'

  import Spinner from '../../components/spinner/spinner.svelte'
  import List from '../../components/list/list.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CheckmarkCircle, MenuOutline, PencilOutline, StarFilled, TrashOutline } from '../../components/icon/nicons'
  import SortableList2 from '../../components/sortable-list/sortable-list2.svelte'
  import {
    LocationStore,
    lookupLocationToLocation,
    LookupLocationType,
    searchForLocations,
  } from '../locations/LocationStore'
  import SearchBar from '../../components/search-bar/search-bar.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'

  import StarSolid from '../../n-icons/StarSolid.svelte'
  import { wait } from '../../utils/tick/tick'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import Empty from '../../components/empty/empty.svelte'

  export let id: string
  export let onSelect: Function

  const state = {
    locations: [],
    active: null,
    mode: 'view',
    mapLocation: null,
    locating: false,
  }

  // $: state.locations = $LocationStore

  $: {
    state.locations = $LocationStore
  }

  let lastLocation = null
  let mapLocation = null

  let showMap = false
  let locationSearchTerm: string | undefined = undefined
  let resultsHidden = true
  let searchResults: Array<LookupLocationType> = []
  let ready = true

  // function goto(location) {
  //   state.active = location;
  //   state.mapLocation = null;
  // }

  const close = async () => {
    closeModal(id)
  }

  /**
   * If Location changes
   */
  // $: if (mapLocation || state.active) {
  //   let loc = !mapLocation ? new Location(state.active) : new Location(mapLocation)
  //   let exists = state.locations.find((l) => l.hash == loc.hash) ? true : false
  //   // showFavoriteButton = !exists
  // }

  let sortedTimeout

  let saving = false

  function sorted(evt): void {
    clearTimeout(sortedTimeout)
    if (state.mode == 'edit') {
      saving = true
      let locations = evt.detail
      sortedTimeout = setTimeout(() => {
        LocationStore.updateSync((state) => {
          return locations
        }).then(() => {
          saving = false
        })
      }, 300)
    }
  }

  const setViewMode = async (view) => {
    ready = false
    state.mode = view
    await wait(100)
    ready = true
  }

  function mapChange(evt) {
    let location = evt.detail
    if (lastLocation !== location.hash) {
      lastLocation = location.hash
      mapLocation = location
    }
  }

  async function unfavorite(location) {
    let confirmed = await Interact.confirm('Remove Location?', 'You can add it later')
    if (confirmed) {
      state.mode = 'view'
      ready = false
      await LocationStore.remove(location)
      await wait(100)
      setViewMode('edit')
    }
    // removing = false
  }

  async function currentLocation() {
    state.locating = true
    try {
      let rawLoc: any = await locate()
      if (rawLoc) {
        let location = new Location({
          lat: rawLoc.latitude,
          lng: rawLoc.longitude,
          name: rawLoc.location,
        })
        select(location)
      }
    } catch (e) {
      Interact.error(`${Lang.t('location.unable-to-get-your-location', 'Unable to get your location')}`)
    }
    state.locating = false
  }

  async function rename(location) {
    let name = await Interact.prompt('New Name', null, {
      value: location.name,
    })
    if (name) {
      location.name = name
      LocationStore.upsert(location)
    }
  }

  function select(location) {
    if ($Interact.locationFinder.onInteract) {
      $Interact.locationFinder.onInteract(location)
    }
    if (onSelect) {
      onSelect(location)
    }
    close()
  }

  async function favorite(item?: Location) {
    let loc
    if (item || mapLocation) {
      loc = item || mapLocation
    } else if (state.active) {
      loc = state.active
    }

    if (loc) {
      if (!loc.name) {
        let name = await Interact.prompt('📍 Name this location', null, {
          value: loc.name,
        })
        loc.name = name
      }
      if(loc.name) {
        await LocationStore.upsert(loc)
      }
    }
  }

  const search = async (term: string) => {
    let networkResults = await searchForLocations(term)
    let localResults = $LocationStore
      .filter((l: Location) => {
        return JSON.stringify(l).toLowerCase().search(term.toLowerCase()) > -1
      })
      .map((l: Location) => {
        return {
          name: l.name,
          lat: l.lat,
          lng: l.lng,
          magicKey: null,
          saved: true,
        }
      })

    searchResults = [...localResults, ...networkResults]
  }

  const addLocationByResultItem = async (item: LookupLocationType) => {
    const location = await lookupLocationToLocation(item)
    if (location && !item.saved) {
      await favorite(location)
    }
    select(location)
    resultsHidden = true
  }
</script>

<BackdropModal className="h-full bg-white dark:bg-gray-900 w-full">
  <header slot="header" class="bg-white relative dark:bg-black pb-2 shadow-md z-40">
    <ToolbarGrid className="w-full stiff">
      <div slot="left">
        <Button on:click={close} primary clear>{Lang.t('general.close', 'Close')}</Button>
      </div>
      <h1 class="ntitle">
        {#if state.active}
          {state.active.name}
        {:else if state.mapLocation}
          {state.mapLocation.lat},{state.mapLocation.lng}
        {:else}{Lang.t('location.pick-a-location', 'Pick a Location')}{/if}
      </h1>
      <div slot="right">
        {#if state.mode == 'edit'}
          {#if saving}
            <Spinner size={24} />
          {:else}
            <Button
              clear
              primary
              type="clear"
              on:click={() => {
                setViewMode('view')
              }}
            >
              Done
            </Button>
          {/if}
        {:else if state.locations.length}
          <Button
            clear
            primary
            on:click={() => {
              setViewMode('edit')
            }}
          >
            {Lang.t('general.edit', 'Edit')}
          </Button>
        {/if}
      </div>
    </ToolbarGrid>
    <div class="searchbar-results relative">
      <SearchBar
        bind:searchTerm={locationSearchTerm}
        on:focus={() => {
          resultsHidden = false
        }}
        on:blur={() => {
          resultsHidden = true
        }}
        on:change={(evt) => {
          search(evt.detail)
        }}
      />
      {#if searchResults.length && locationSearchTerm?.length && !resultsHidden}
        <div value={1} class="absolute left-4 right-4 top-8 z-50">
          <List solo className="my-2  shadow-lg ring-1 ring-gray-500 ring-opacity-25">
            {#each searchResults as locationType, index}
              <ListItem
                bottomLine={24}
                autofocus
                on:click={() => {
                  addLocationByResultItem(locationType)
                }}
              >
                <div slot="left">
                  {#if locationType.saved}
                    <IonIcon icon={StarSolid} className="text-yellow-500" />
                  {/if}
                </div>
                {locationType.name}
              </ListItem>
            {/each}
          </List>
        </div>
      {/if}
    </div>
  </header>

  <main class="pt-4 pb-4">
    <section class="flex flex-col h-full relative h-50vh">
      {#if showMap}
        <div style="height:225px;" class="flex-grow-0 flex-shrink-0 relative">
          <!-- MAP -->
          <div style="height: 200px;" class="relative">
            <NMap hideFavorite on:change={mapChange} locations={state.active ? [state.active] : []} picker={true} />
          </div>
        </div>
      {/if}
      <!-- List Panel -->
      <div class="flex-grow flex-shrink h-full overflow-y-auto ">
        <div class="list-wrapper px-2 lg:px-4 space-y-4">
          {#if mapLocation && mapLocation.lat}
            <List solo className="mb-2">
              <NItem bottomLine={18}
                clickable
                aria-label="Save this Location"
                on:click={() => {
                  favorite(mapLocation)
                }}
              >
                Favorite <strong>{math.round(mapLocation.lat, 10000)},{math.round(mapLocation.lng, 10000)}</strong>
              </NItem>
              <NItem
                clickable
                aria-label="Use this area"
                on:click={() => {
                  
                  select(mapLocation)
                }}
              >
                Select <strong>{math.round(mapLocation.lat, 10000)},{math.round(mapLocation.lng, 10000)}</strong>
              </NItem>
            </List>
          {/if}
          <List solo className="mb-2">
            <NItem
              clickable
              className="clickable py-1 dark:bg-gray-900 bg-white text-primary {state.locating ? 'opacity-50' : ''}"
              on:click={() => {
                currentLocation()
              }}
            >
              {#if !state.locating}
                {Lang.t('location.use-current-location', 'Use Current Location')}...
              {:else}{Lang.t('location.locating', 'Locating...')}{/if}
              <div slot="right">
                {#if state.locating}
                  <Spinner size={24} />
                {/if}
              </div>
            </NItem>
            <Divider center />
            <NItem
              clickable
              on:click={() => {
                showMap = !showMap
              }}>Find on Map...</NItem
            >
          </List>

          {#if state.locations.length == 0}
            <Empty className="text-gray-500">
              {Lang.t('general.no-favorites-found', 'No Favorites Found')}
            </Empty>
          {/if}

          {#if ready}
            <List solo>
              <SortableList2
                key="id"
                direction="y"
                enabled={state.mode == 'edit'}
                bind:items={state.locations}
                handleClass=".menu"
                on:update={sorted}
                let:item
              >
                <div class="item-wrapper">
                  <!-- Edit -->
                  {#if state.mode === 'edit'}
                    <NItem bottomLine={14} className="dark:bg-gray-900 bg-white">
                      <div class="menu" slot="left">
                        <IonIcon icon={MenuOutline} />
                      </div>

                      <h2 class="ntitle">
                        {item.name}
                        {#if state.active && item.hash == state.active.hash}
                          <IonIcon icon={CheckmarkCircle} className="text-primary-500" />
                        {/if}
                      </h2>

                      <div slot="right" class="flex">
                        <Button
                          icon
                          className="tap-icon"
                          on:click={() => {
                            rename(item)
                          }}
                        >
                          <IonIcon icon={PencilOutline} />
                        </Button>
                        <Button
                          icon
                          on:click={(evt) => {
                            unfavorite(item)
                          }}
                        >
                          <IonIcon icon={TrashOutline} className="text-red-500" />
                        </Button>
                      </div>
                    </NItem>
                  {:else}
                    <NItem
                      clickable
                      bottomLine={14}
                      className=" dark:bg-gray-900 bg-white"
                      on:click={() => {
                        if (state.mode == 'view') {
                          select(item)
                        }
                      }}
                    >
                      <div slot="left">
                        <IonIcon icon={StarFilled} className="text-yellow-500" size={22} />
                      </div>
                      <h2 class="text-base font-bold leading-tight text-black dark:text-white">
                        {item.name}
                        {#if state.active && item.hash == state.active.hash}
                          <IonIcon icon={CheckmarkCircle} className="fill-primary" />
                        {/if}
                      </h2>
                    </NItem>
                  {/if}
                </div>
              </SortableList2>
            </List>
          {/if}
        </div>
      </div>
    </section>
  </main>
</BackdropModal>
