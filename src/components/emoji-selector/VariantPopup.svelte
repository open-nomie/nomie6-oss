<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import IonIcon from '../icon/ion-icon.svelte'
  import { CloseOutline } from '../icon/nicons'
  import Emoji from './Emoji.svelte'

  export let variants: any

  const dispatch = createEventDispatcher()

  function onClickClose() {
    dispatch('close')
  }

  function onClickContainer(event?: any) {
    dispatch('close', event)
  }
</script>

<div class="svelte-emoji-picker__variants-container frosted" on:click={onClickContainer}>
  <div class="svelte-emoji-picker__variants">
    {#each Object.keys(variants) as variant}
      <Emoji emoji={variants[variant]} on:emojiclick />
    {/each}
    <div class="close-button" role="button" on:click={onClickClose}>
      <IonIcon icon={CloseOutline} />
    </div>
  </div>
</div>

<style lang="postcss" global>
  .svelte-emoji-picker__variants-container {
    position: absolute;
    top: 0;
    left: 0;
    @apply w-full;
    @apply h-full;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
    @apply bg-black bg-opacity-25 backdrop-filter backdrop-blur-sm;
  }

  .svelte-emoji-picker__variants {
    @apply relative;
    @apply mx-4;
    @apply p-2;
    @apply text-2xl;
    @apply text-center;
    @apply rounded-lg;
    @apply bg-white dark:bg-black;
    @apply shadow-xl;
    @apply z-50;
  }

  .svelte-emoji-picker__variants button {
    @apply m-1;
  }

  .svelte-emoji-picker__variants .close-button {
    position: absolute;
    font-size: 1em;
    right: 20px;
    top: 10px;
    cursor: pointer;
  }
</style>
