<script lang="ts">
  import Panel from '../../components/panel/panel.svelte'
  import LogListLoader from '../../components/log-list/log-list-loader.svelte'

  import type NLog from '../nomie-log/nomie-log'
  import { Interact } from '../../store/interact'

  import { showTrackablePopmenu } from '../board/boardActions'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { TrackableStore } from '../trackable/TrackableStore'

  export let term: string

  let results: Array<NLog> = []
</script>

<Panel className="h-full">
  <main class="h-full mb-4 bg-gray-200 filler dark:bg-gray-800"> 
    {#if term}
      <section class="h-full p-4 search-results">
        <LogListLoader
          fullDate={true}
          showTimeDiff={true}
          bind:results
          {term}
          limit={20}
          className="bg-transparent"
          on:textClick={(event) => {
            showTrackablePopmenu(tokenToTrackable(event.detail, $TrackableStore.trackables))
          }}
          on:moreClick={(event) => {
            Interact.logOptions(event.detail).then(() => {})
          }}
        />
      </section>
    {/if}
  </main>
</Panel>
