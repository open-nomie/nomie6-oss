<script lang="ts">
  import type { Dayjs } from 'dayjs'
  import dayjs from 'dayjs'
  import { createEventDispatcher } from 'svelte'

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronBackOutline, ChevronForwardOutline } from '../../components/icon/nicons'

  import { getDateFormats } from '../../domains/preferences/Preferences'

  $: dateFormats = getDateFormats()
  export let start: Dayjs | undefined = undefined
  export let end: Dayjs | undefined = undefined
  export let date: Dayjs | undefined = dayjs()
  export let className: string = ''
  export let dateClass: string = 'text-center text-gray-600 dark:text-gray-400 text-xs md:text-sm my-1'
  const dispatch = createEventDispatcher()
</script>

<div class="flex items-center py-2 justify-center {className}">
  <div class="filler" />
  <Button
    className="bg-gray-500 bg-opacity-20"
    size="lg"
    on:click={() => {
      dispatch('previous')
    }}
    primary
    icon><IonIcon size={30} icon={ChevronBackOutline} /></Button
  >
  <div class="filler">
    <slot />
    <div class="title text-center"><slot name="title" /></div>
    <p class=" {dateClass}">
      {#if start && end}
        {start.format(dateFormats.mmm_d_yyyy)} -
        {end.format(dateFormats.mmm_d_yyyy)}
      {:else}
        {date.format(dateFormats.mmm_d_yyyy)}
      {/if}
    </p>
  </div>
  <Button
    className="bg-gray-500 bg-opacity-20"
    size="lg"
    primary
    icon
    on:click={() => {
      dispatch('next')
    }}><IonIcon size={30} icon={ChevronForwardOutline} /></Button
  >
  <div class="filler" />
</div>
