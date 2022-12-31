<script lang="ts">
  export let emojis: Array<string> = []
  export let size: number = 42
  export let className: string = ''
</script>

<div class="many-emoji {className}" style="--size:{size}px">
  {#each emojis as emoji}
    <span>{emoji}</span>
  {/each}
</div>

<style lang="postcss" global>
  .many-emoji {
    width: var(--size);
    height: var(--size);
    @apply overflow-hidden;
    @apply leading-tight;
    @apply gap-1;
    font-size: calc(var(--size) * 0.3);
    @apply justify-center items-center;
    @apply grid grid-cols-2;
  }
</style>
