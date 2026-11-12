<svelte:options runes={true} />

<script lang="ts">
  import LetterTicker from '../../../components/letter-ticker/letter-ticker.svelte'
  import { createEventDispatcher, onMount } from 'svelte'
  import RangeSlider from 'svelte-range-slider-pips'
  import is from '../../../utils/is/is'

  const { min, max, value, tracker, step } = $props()

  // Numbers typed on a decimal keypad may use a comma (0,5); read both 0,5 and 0.5 the same way
  const toNumber = (v: any): number => parseFloat(`${v ?? ''}`.replace(',', '.'))

  // Decimal places in the step, so 0.5 keeps its half and a whole-number step stays whole
  const decimalsOfStep = (): number => {
    const parts = `${toNumber(tracker.step) || 1}`.split('.')
    return parts[1] ? parts[1].length : 0
  }
  const toStepValue = (v: any): number => Number(toNumber(v).toFixed(decimalsOfStep()))

  let values = $state([Number(value) || toNumber(tracker.min) || 0])

  const dispatch = createEventDispatcher()


  $effect(() => {
    const newValue = Number(value) || toNumber(tracker.min) || 0
    if (values[0] !== newValue) {
      values = [newValue]
    }
  })

  onMount(() => {
    // Trigger initial change event
    if (values[0]) {
      dispatch('change', toStepValue(values[0]))
    }
  })
</script>

<div class="tracker-input-slider relative">
  <div
    style="--range-handle-inactive: {tracker.color}; --range-handle: {tracker.color}; --range-handle-focus: {tracker.color}"
    class="relative range-holder pt-5 pb-2 pl-4 flex flex-col items-center justify-center h-full w-full"
  >
    {#if tracker.minLabel}
      <span class="min-label range-label {is.emoji(tracker.minLabel) ? 'text-2xl' : 'text-xs'}">{tracker.minLabel}</span
      >
    {/if}
    {#if tracker.maxLabel}
      <span class="max-label range-label {is.emoji(tracker.maxLabel) ? 'text-2xl' : 'text-xs'}">{tracker.maxLabel}</span
      >
    {/if}

    <RangeSlider
      bind:values={values}
      on:input={() => {
        dispatch('input', values[0])
      }}
      on:change={() => {
        dispatch('change', toStepValue(values[0]))
      }}
      style="--range-slider:{tracker.color};"
      springValues={{
        stiffness: 0.5,
        damping: 0.7,
      }}
      formatter={(v) => {
        return tracker.displayValue(v)
      }}
      first={tracker.minLabel}
      last={tracker.maxLabel}
      vertical={true}
      min={toNumber(tracker.min)}
      max={toNumber(tracker.max)}
      step={toNumber(tracker.step) || 1}
      pips
    />
    <div class="value dark:bg-gray-700 bg-gray-300 px-2 pt-3 pb-1 w-20 -ml-3 -mt-6 rounded-b-xl text-center">
      {#if tracker && tracker.uom !== 'num'}
        <LetterTicker
          text={`${tracker.displayValue(values[0])}`}
          className=" font-bold text-gray-800 dark:text-white"
        />
      {:else if tracker}
        <LetterTicker text={`${values[0]}`} className="font-bold text-gray-800 dark:text-white" />
      {/if}
    </div>
  </div>
</div>

<style global lang="postcss">
  .tracker-input-slider {
    --nub-width: 78px;
  }

  .tracker-input-slider .rangeNub {
    @apply dark:bg-white;
    width: var(--nub-width);
  }

  .tracker-input-slider .rangeSlider {
    @apply bg-gray-100 border-gray-500 border border-opacity-30 dark:bg-gray-900;
  }

  .tracker-input-slider .rangeHandle {
    @apply ml-9;
    width: var(--nub-width);
  }

  .tracker-input-slider .rangeSlider.vertical {
    @apply w-20;
    @apply rounded-xl;
    @apply h-40 md:h-48 lg:h-72;
  }

  .tracker-input-slider .range-label {
    @apply block;
    @apply text-gray-500 dark:text-gray-500;
    @apply absolute;
    @apply pointer-events-none;
    @apply pl-40;
    @apply text-left;
    @apply line-clamp-1;

    @apply uppercase;
    @apply font-semibold;
  }
  .tracker-input-slider .range-label.min-label {
    @apply bottom-8;
  }
  .tracker-input-slider .range-label.max-label {
    @apply top-8;
  }

  .input-modal.type-range {
    @apply flex-grow flex-shrink-0;
    @apply min-h-full;
    @apply overflow-hidden;
  }
  .tracker-input-slider {
    @apply relative;
    @apply flex;
    @apply flex-grow flex-shrink;
    @apply justify-center items-center;
    min-height: 50vh;
  }
  /* .tracker-input-slider input[type='range'] {
    @apply bg-transparent;
  }
  .tracker-input-slider .value {
    @apply text-center;
    @apply absolute;
    @apply left-20;
    @apply lg:-bottom-2 bottom-1;
  }
  .tracker-input-slider input[type='range'] {
    padding: 0 5px;
    margin: 0 auto;
    -webkit-appearance: none;
    width: 100%;
    max-width: 400px;
    min-width: 200px;
    margin: -5.5px 0;
  }
  .tracker-input-slider input[type='range']:focus {
    outline: none;
  }
  .tracker-input-slider input[type='range']::-webkit-slider-runnable-track {
    width: 43vh;
    height: 100px;
    cursor: pointer;

    @apply bg-gray-500 dark:bg-black;
    border-radius: 50px;
    padding: 0 6px;
    @apply border border-gray-500;
    position: relative;
    margin-left: 20px;
  } */
  /* .tracker-input-slider input[type='range']::-webkit-slider-thumb {
    height: 90px;
    width: 90px;
    border: solid 1px var(--color-faded-2);
    border-radius: 50px;
    background: var(--color-solid);
    box-shadow: var(--box-shadow-float);
    transform: rotate(90deg);
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: 4px;
    margin-bottom: 10px;
  }
  .tracker-input-slider input[type='range']:focus::-webkit-slider-runnable-track {
    @apply ring-2 ring-primary-500;
  }
  .tracker-input-slider input[type='range']::-moz-range-track {
    width: 48vh;
    height: 100px;
    cursor: pointer;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0), 0px 0px 1px rgba(13, 13, 13, 0);
    @apply bg-gray-300 dark:bg-gray-700;
    border-radius: 50px;
    border: 0px solid var(--color-solid-2);
  }
  .tracker-input-slider input[type='range']::-moz-range-thumb {
    @apply shadow-xl;

    height: 90px;
    width: 90px;
    border-radius: 45px;
    @apply bg-white dark:bg-black;
    cursor: pointer;
  }
  .tracker-input-slider input[type='range'] {
    transform: rotate(-90deg);
    @apply mb-4;
  } */
</style>
