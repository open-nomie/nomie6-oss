<svelte:options runes={true} />

<script lang="ts">

  const { steps, current, dark, stepClass, single, style } = $props()

  let _steps = $derived.by(() => {
    const result = []
    for (let i = 0; i < steps; i++) {
      if (!single) {
        result.push(current >= i)
      } else {
        result.push(current == i)
      }
    }
    return result
  })
</script>

<div class="n-stepper {dark ? 'dark' : 'light'}" {style}>
  {#each _steps as step}
    <div class="step {stepClass} {step ? 'active' : 'inactive'}" />
  {/each}
</div>

<style lang="postcss" global>
  .n-stepper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: stretch;
    padding: 4px;
  }
  .n-stepper .step {
    transition: all 0.2s ease-in-out;
    border: solid 1px var(--color-translucent);
    opacity: 0.5;
    height: 8px;
    width: 8px;
    flex-grow: 0;
    flex-shrink: 0;
    margin: 0 2px;
    min-width: 8px;
    border-radius: 4px;
  }
  .n-stepper .step.primary-bright {
    @apply border border-primary-500;
  }
  .n-stepper .step.active {
    background-color: var(--color-translucent);
    opacity: 1;
    height: 8px;
  }
  .n-stepper .step.active.primary-bright {
    @apply bg-primary;
  }
  .n-stepper.dark .step {
    @apply bg-primary;
    opacity: 0.2;
  }
  .n-stepper.dark .step.active {
    opacity: 1;
  }
</style>
