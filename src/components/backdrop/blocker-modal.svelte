<script lang="ts">
  import ProgressBar from '../../components/progress-bar/progress-bar.svelte'

  import Spinner from '../../components/spinner/spinner.svelte'

  import { Interact } from './../../store/interact'
</script>

{#if $Interact.blocker.show}
  <div style="min-width:100px; min-height:100px;" class="w-28 h-28">
    <div
      class="w-28 h-28 dark:bg-black border glass dark:border-gray-700 bg-white dark:bg-opacity-80  bg-opacity-60 flex flex-col items-center justify-center space-y-4 p-4 rounded-lg"
    >
      {#if !$Interact.blocker.percent}
        <div class="flex-shrink-0"><Spinner size={32} /></div>
      {:else}
        <div class="py-2">
          <ProgressBar
            percentage={$Interact.blocker.percent}
            className="w-20 h-4 flex-shrink-0 bg-gray-200 dark:bg-gray-800"
          />
        </div>
      {/if}
      {#if $Interact.blocker.message}
        <div class="leading-tight text-center line-clamp-3 text-xs dark:text-white ">
          {$Interact.blocker.message || ''}
        </div>
      {/if}
    </div>
  </div>
{/if}
