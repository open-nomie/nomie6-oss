<script lang="ts">
  import { showConfetti } from './ConfettiStore'
  // Pulled from https://svelte.dev/tutorial/congratulations
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  onMount(() => {
    showConfetti()
  })
</script>

<div class="confetti-wrapper" transition:fade>
  <canvas class="confetti" id="confetti" />
</div>

<style global lang="postcss">
  .confetti-wrapper {
    @apply pointer-events-none;
    z-index: 8600;
    @apply absolute top-0 left-0 right-0 bottom-0;
    @apply flex items-center justify-center overflow-hidden;
  }
  .confetti {
    @apply relative;
    @apply z-50;
    pointer-events: none;
  }

  /* .confetti span {
    position: absolute;
    font-size: 8vw;
  } */
</style>
