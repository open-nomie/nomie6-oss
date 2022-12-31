<script lang="ts">
  /** Timer.svelte
   *
   * Used to show either the Active Counter (if tracker.started is set)
   * or to show a manual time entry component
   *
   */

  // svelte
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  // Components
  import Counter from '../../../components/counter/counter.svelte'
  import ManualTime from '../../../components/counter/manual-time.svelte'

  // Stores

  import { Lang } from '../../../store/lang'

  // Consts
  const dispatch = createEventDispatcher()

  // Props
  export let value
  export let tracker: any

  // Data
  let data = {
    tempValue: (value || '') + '' || '',
    changed: false,
    started: tracker.started,
  }

  onMount(() => {
    data.tempValue = value
  })
</script>

<div class="n-timer-input w-full">
  {#if tracker.started}
    <div class="flex flex-col items-center justify-center">
      <div class="filler" />
      <Counter started={tracker.started} lg className="py-5 bg-light" on:change={(event) => {}} />
      <div class="filler" />
    </div>
  {:else}
    <div class="flex flex-col items-center justify-center">
      <div class="filler" />
      <div class="filler" />
      <ManualTime
        {value}
        on:change={(event) => {
          dispatch('change', event.detail)
        }}
      />
      {#if !tracker.started && value}
        <button
          aria-label="Start Timer"
          on:click={() => {
            dispatch('forceStart')
          }}
          class="bg-gray-300 rounded-md px-3 py-1 mt-2 font-medium dark:bg-gray-700 dark:text-white"
        >
          {Lang.t('general.resume', 'Resume')}
        </button>
      {/if}
      <!-- <div class="filler" />
      {#if value}
        <Button
          on:click={() => {
            dispatch("forceStart");
          }}
          title="Resume Counting"
          size="sm"
          type="clear"
          className="shadow-none mt-4 {value
            ? 'visible'
            : 'hidden'} text-primary-500"
        >
          Resume Timer
          <IonIcon icon={PlayCircleSolid} className="text-primary-500 ml-1" />
        </Button>
      {/if} -->
      <div class="filler" />
    </div>
  {/if}
</div>
