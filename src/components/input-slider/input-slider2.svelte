<svelte:options runes={true} />

<script lang="ts">
  //@ts-ignore
  import RangePure from 'rangeslider-pure'
  import { createEventDispatcher, onMount } from 'svelte'
  import type { Trackable } from '../../domains/trackable/Trackable.class'

  const { min, max, value, className, trackable, mini, step } = $props()

  let smallInput = $state<HTMLInputElement>(undefined)
  let tempValue = $state(Number(value) || 0)
  let lastPropValue = Number(value) || 0

  $effect(() => {
    const newValue = Number(value) || 0
    if (newValue !== lastPropValue) {
      tempValue = newValue
      lastPropValue = newValue
    }
  })

  const dispatch = createEventDispatcher()
  async function main() {
    // Trigger the change so the parent catches it.
    if (tempValue) {
      dispatch('change', parseInt(tempValue))
    }
    RangePure.create(smallInput)
  }

  onMount(main)
</script>

<div
  class="tracker-input slider py-2 {className}"
  class:vertical={!mini}
  class:mini
  style={`--trackable-color:${trackable.color};`}
>
  <div class="slider-wrapper">

    <input
      aria-label={trackable.label}
      type="text"
      class="w-full n-range"
      {min}
      {max}
      {step}
      bind:this={smallInput}
      bind:value={tempValue}
      on:input={() => dispatch('input', parseFloat(tempValue))}
      on:change={() => dispatch('change', parseFloat(tempValue))}
    />

    {#if trackable.tracker.minLabel || trackable.tracker.maxLabel}
      <div class="flex items-center w-full justify-between -mb-2 mt-2 opacity-50 text-xs">
        {#if trackable.tracker.minLabel}
          <span class="label-min">{trackable.tracker.minLabel}</span>
        {/if}
        {#if trackable.tracker.maxLabel}
          <span class="label-max">{trackable.tracker.maxLabel}</span>
        {/if}
      </div>
    {/if}
  </div>

  <!--  -->
</div>

<style global lang="postcss">
  .slider-wrapper .rangeSlider,
  .slider-wrapper .rangeSlider__fill {
    display: block;
    box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.3);
    border-radius: 10px;
  }

  .slider-wrapper .rangeSlider {
    @apply dark:bg-gray-700 bg-gray-300;
    @apply m-0;
  }

  .slider-wrapper .rangeSlider {
    @apply h-4;
    @apply w-full;
    @apply relative;
  }

  .slider-wrapper .rangeSlider--disabled {
    opacity: 0.4;
  }

  .slider-wrapper .rangeSlider__fill {
    position: absolute;
  }

  .slider-wrapper .rangeSlider__fill__horizontal {
    height: 100%;
    top: 0;
    left: 0;
  }

  .slider-wrapper .rangeSlider__fill__vertical {
    width: 100%;
    bottom: 0;
    left: 0;
  }

  .slider-wrapper .rangeSlider__handle {
    cursor: pointer;
    @apply inline-flex;
    @apply absolute;
    @apply h-6 w-6;
    @apply -mt-1;
    @apply rounded-full;
    @apply shadow-md;
    @apply bg-white;
  }

 
  .tracker-input .slider-wrapper .rangeSlider__fill {
    background-color: var(--trackable-color);
  }

  .tracker-input.mini {
    @apply py-1;
  }

  .tracker-input .slider-wrapper .rangeSlider__handle {
    @apply shadow-md;
  }
  .tracker-input .slider-wrapper .rangeSlider__handle::after {
    display: none !important;
  }
</style>
