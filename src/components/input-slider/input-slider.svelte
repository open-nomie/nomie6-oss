<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import RangeSlider from 'svelte-range-slider-pips'
  import appConfig from '../../config/appConfig'

  export let value: any = 0
  export let min: number = 0
  export let max: number = 10
  export let steps: number = 1
  export let className: string = ''

  let color: string = appConfig.primary_color
  const dispatch = createEventDispatcher()

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
