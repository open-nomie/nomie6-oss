<script lang="ts">
  import Container from '../../components/container/container.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ListItemLog from '../../components/list-item-log/list-item-log.svelte'
  import dayjs from 'dayjs'
  import ChevronForwardOutline from '../../n-icons/ChevronForwardOutline.svelte'
  import { createEventDispatcher, onMount } from 'svelte'

  import { LedgerStore } from './LedgerStore'
  const dispatch = createEventDispatcher()

  onMount(async () => {
    await LedgerStore.getMemories()
  })
</script>

{#if $LedgerStore.memories.length > 0}
  <section class="mt-3 bg-primary-500">
    <Container className="px-4 pb-4">
      <!-- Show History if exists -->

      <div class="memories">
        {#each $LedgerStore.memories as log}
          <div class="py-3 text-center memories-log-header">
            <button
              aria-label="View logs from {dayjs(log.end).format('ddd MM YYYY')}"
              class="flex items-center justify-center w-full py-2
                  font-medium text-black bg-primary-500"
              on:click={() => {
                dispatch('date', log.end)
              }}
            >
              <span class="text-sm">{dayjs(log.end).fromNow()}</span>
              <IonIcon icon={ChevronForwardOutline} className="fill-white" size={16} />
            </button>
          </div>
          <ListItemLog
            fullDate
            className="aged"
            {log}
            on:textClick={(event) => {
              dispatch('text', event)
            }}
          />
        {/each}
      </div>
      <!-- end history -->
    </Container>
  </section>
{/if}
