<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import CheckmarkCircle from '../../n-icons/CheckmarkCircle.svelte'
import CheckmarkCircleOutline from '../../n-icons/CheckmarkCircleOutline.svelte';
  import IonIcon from '../icon/ion-icon.svelte'

  export let value
  export let colors: Array<string> = ['green', 'orange', 'red', 'blue']
  export let size = 24
  export let className = ''
  const dispatch = createEventDispatcher()

  let selected
  $: if (value && value !== selected) {
    selected = value
  }
</script>

<div class="tiny-color-picker flex {className}">
  {#each colors as color}
    <button
      aria-label={color}
      style={`height:${size}px;width:${size}px;`}
      on:click={() => {
        dispatch('change', color)
      }}
      class={`${selected == color ? `selected ${color}` : `not-selected ${color}`}`}
    >
      {#if selected === color}
        <IonIcon className="text-white" icon={CheckmarkCircleOutline} size={20} />
      {/if}
    </button>
  {/each}
</div>

<style global lang="postcss">
  .tiny-color-picker {
    @apply space-x-2;
    @apply flex items-center justify-center;
  }
  .tiny-color-picker button {
    @apply rounded-full;
    @apply flex items-center justify-center;
  }
  .tiny-color-picker button.not-selected {
    background-color: transparent !important;
    @apply border border-2;
  }
  .tiny-color-picker button.green {
    @apply border-green-500;
    @apply bg-green-500;
  }
  .tiny-color-picker button.blue {
    @apply border-primary-500;
    @apply bg-primary-500;
  }
  .tiny-color-picker button.red {
    @apply border-red-500;
    @apply bg-red-500;
  }
  .tiny-color-picker button.orange {
    @apply border-yellow-500;
    @apply bg-yellow-500;
  }
</style>
