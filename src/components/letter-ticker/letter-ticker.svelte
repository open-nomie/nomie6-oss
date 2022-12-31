<script lang="ts">
  export let text: string = ''
  export let className: string = ''
  export let style: string = ''

  let items: Array<string> = []
  let lastItems: Array<string> = []

  $: if (text) {
    lastItems = items || []
    items = `${text || ''}`.split('')
  }
</script>

{#if text}
  <span class="letter-ticker {className}" {style}>
    {#each items as bit, index (Math.random())}
      <span class={lastItems[index] == bit ? 'letter-stay' : 'letter-up'} class:empty={bit === ' '}
        >{bit === ' ' ? '  ' : bit}</span
      >
    {/each}
  </span>
{/if}

<style lang="postcss" global>
  .letter-ticker {
    white-space: nowrap;
  }
  .letter-ticker .empty {
    min-width: 4px;
  }
  @keyframes letterUp {
    from {
      transform: translateY(10px) scale(0.96);
      opacity: 0.3;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  .letter-up {
    display: inline-block;
    animation: letterUp 0.1s cubic-bezier(0.19, -0.53, 0.78, 1.32);
    -webkit-animation: letterUp 0.1s cubic-bezier(0.19, -0.53, 0.78, 1.32);
  }
</style>
