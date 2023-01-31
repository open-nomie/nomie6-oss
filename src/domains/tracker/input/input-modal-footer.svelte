<script lang="ts">
  import Button from '../../../components/button/button.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import { createEventDispatcher } from 'svelte'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import { StopSolid } from '../../../components/icon/nicons'
  import { Lang } from '../../../store/lang'
  import type { ITracker } from '../../../modules/tracker/TrackerClass'
  import Spinner from '../../../components/spinner/spinner.svelte'
  import type TrackerClass from '../../../modules/tracker/TrackerClass'

  export let tracker: ITracker | TrackerClass
  export let value: number | undefined
  export let allowSave: boolean
  export let saving: boolean
  export let saveLabel: string = Lang.t('general.save', 'Save')
  export let nextLabel: string = Lang.t('general.next', 'Next')

  const dispatch = createEventDispatcher()
</script>

<footer class=" tracker-input-footer py-3 stiff  glass-lite z-50 w-full rounded-b-2xl">
  <ToolbarGrid>
    <div slot="left" class="pr-2">
      <Button
        type="clear"
        size="lg"
        className="px-2 -ml-2 text-lg md:text-xl text-gray-900 dark:text-white"
        on:click={() => {
          dispatch('cancel')
        }}
      >
        {Lang.t('general.close', 'Close')}
      </Button>
    </div>
    <!-- end left toolbar -->
    <div class="flex items-center justify-center w-full px-2">
      {#if !saving}
        <!-- {#if (tracker.type == "timer" && value && $TrackerInputStore.allowSave !== false) || (tracker.type != "timer" && $TrackerInputStore.allowSave !== false)} -->
        {#if tracker.type === 'timer' && allowSave !== false}
          {#if tracker.started}
            <!-- Stop Button -->
            <!-- svelte-ignore a11y-autofocus -->
            <button
              type="button"
              aria-label="Save"
              autofocus
              on:click={() => dispatch('stopTimer')}
              class="action-button bg-red-500 text-white"
            >
              <IonIcon icon={StopSolid} size={32} className="text-white" />
            </button>
          {:else if !tracker.started && !tracker.timeTracked}
            <button
              aria-label="Start Timer"
              type="button"
              on:click={() => {
                dispatch('startTimer')
              }}
              autofocus
              class="action-button bg-primary-500 text-white"
            >
              {Lang.t('general.start', 'Start')}
            </button>
          {:else if !tracker.started && value}
            <button
              aria-label="Save"
              autofocus
              type="button"
              on:click={() => {
                dispatch('save')
              }}
              class="action-button bg-primary-500 text-white"
            >
              {saveLabel}
            </button>
          {/if}
        {:else if allowSave}
          <button
            aria-label="Save"
            type="button"
            on:click={() => {
              dispatch('save')
            }}
            class="action-button bg-primary-500 text-white"
          >
            {saveLabel}
          </button>
        {/if}
      {:else}
        <Spinner />
      {/if}
      <!-- end if timer -->
    </div>
    <!-- end main toolbar-grid-->

    <div slot="right">
      {#if value !== undefined && !tracker.started}
        <Button
          id="input-insert-button"
          clear
          autofocus
          primary={!allowSave}
          size="lg"
          title="Add this to the note without immediately saving."
          className="-mr-2 whitespace-nowrap text-lg md:text-xl 
                {!allowSave ? '' : 'text-gray-900 dark:text-white'}
                {tracker.started ? 'hidden' : ''}"
          on:click={() => {
            dispatch('add')
          }}
        >
          {#if !allowSave}
            {nextLabel || Lang.t('general.next', 'Next')}
          {:else}
            {Lang.t('general.Insert', 'Insert')}
          {/if}
        </Button>
      {:else}
        <Button className="w-16" clear />
      {/if}
    </div>
  </ToolbarGrid>
</footer>

<style lang="postcss" global>
  .tracker-input-footer button {
    @apply focus:outline-none;
    @apply focus:ring-4  ring-gray-500 ring-opacity-60 ring-inset;
  }
</style>
