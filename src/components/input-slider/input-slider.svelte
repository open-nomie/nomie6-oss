<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import RangeSlider from 'svelte-range-slider-pips'
  import appConfig from '../../config/appConfig'

  let color: string = appConfig.primary_color
  const dispatch = createEventDispatcher()


  const { value, min, max, steps, className } = $props()
</script>

<div class="{className || ''} range-slider-wrap" style="--range-handle-focus:{color}">
  <RangeSlider
    on:change={(evt) => {
      dispatch('change', evt.detail)
    }}
    values={[value]}
    {steps}
    {min}
    {max}
    pips
  />
</div>
