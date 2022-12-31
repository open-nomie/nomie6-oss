<script lang="ts">
  import Button from '../../components/button/button.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import Text from '../../components/text/text.svelte'
  import { Lang } from '../../store/lang'
  import { SearchStore } from './search-store'
  import type { SearchTerm } from './search-store'

  // import TrackerClass from '../../modules/tracker/TrackerClass'

  // import { TrackerStore } from '../tracker/TrackerStore'

  let mode = 'view'
  let savedTerms: Array<SearchTerm>
  // let savedTrackers: Array<TrackerClass>

  $: if ($SearchStore.saved.length || $SearchStore.view) {
    // Get SavedTerms array
    savedTerms = $SearchStore.saved
      .filter((st: SearchTerm) => {
        return st.type === $SearchStore.view
      })
      .reverse()

    // if ($SearchStore.view === 'trackers') {
    //   savedTrackers = savedTerms.map((searchTerm: SearchTerm) => {
    //     let tag: string = searchTerm.term.replace('#', '')
    //     return $TrackerStore[tag] || new TrackerClass({ tag })
    //   })
    // } else if ($SearchStore.view === 'people') {
    // }

    savedTerms = savedTerms
  }

  function toggleEditMode() {
    mode = mode === 'view' ? 'edit' : 'view'
  }
</script>

{#if savedTerms.length}
  <ListItem itemDivider compact className="bg-transparent">
    {Lang.t('search.previous-searches', 'Previous Searches')}
    <div slot="right">
      {#if mode != 'edit'}
        <Button
          color="transparent"
          size="sm"
          on:click={() => {
            toggleEditMode()
          }}
        >
          {Lang.t('general.edit', 'Edit')}
        </Button>
      {:else}
        <Button
          size="sm"
          color="transparent"
          className="text-red"
          on:click={() => {
            toggleEditMode()
          }}
        >
          {Lang.t('general.done', 'Done')}
        </Button>
      {/if}
    </div>
  </ListItem>

  {#if $SearchStore.view === 'trackers'}
    {#if mode !== 'edit'}
      <!-- <div class="n-list">
        <TrackerList
          view="list"
          hideAdd
          trackers={savedTrackers.reverse()}
          on:more={(evt) => {
            const tracker = evt.detail
            showTrackablePopmenu(tracker.toTrackable())
            SearchStore.close()
            evt.stopPropagation()
            evt.preventDefault()
          }}
          on:tap={(evt) => {
            onTrackerTap(evt.detail, $TrackableStore.trackables)
            SearchStore.close()
          }}
        />
      </div> -->
    {:else}
      {#each savedTerms.reverse() as searchTerm (searchTerm.term)}
        <ListItem title={searchTerm.term}>
          <div slot="right">
            <Button
              text
              size="sm"
              style="color:var(--color-red)"
              on:click={() => {
                SearchStore.remove(searchTerm)
              }}
            >
              Delete
            </Button>
          </div>
        </ListItem>
      {/each}
    {/if}
  {:else}
    {#each savedTerms as searchTerm (searchTerm.term)}
      <ListItem
        clickable={mode !== 'edit'}
        bottomLine={42}
        on:click={(evt) => {
          if (mode == 'view') {
            SearchStore.update((state) => {
              state.active = searchTerm
              state.view = searchTerm.type
              return state
            })
          }
        }}
      >
        <Text>{searchTerm.term}</Text>
        <div slot="right">
          {#if mode == 'edit'}
            <Button
              size="sm"
              color="danger"
              on:click={() => {
                SearchStore.remove(searchTerm)
              }}
            >
              Delete
            </Button>
          {/if}
        </div>
      </ListItem>
    {/each}
  {/if}
{/if}
