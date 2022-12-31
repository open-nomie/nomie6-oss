<script lang="ts">
  import type { Dayjs } from 'dayjs'
  import { createEventDispatcher } from 'svelte'

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronBackOutline, ChevronForwardOutline } from '../../components/icon/nicons'

  import { getDateFormats } from '../preferences/Preferences'

  $: dateFormats = getDateFormats()
  export let start: Dayjs | undefined = undefined
  export let end: Dayjs | undefined = undefined
  const dispatch = createEventDispatcher()
</script>

<div class="flex items-center py-2 justify-center">
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
    <div class="title text-center"><slot name="title" /></div>
    <p class="text-center text-gray-600 dark:text-gray-400 text-sm">
      {start.format(dateFormats.mmm_d_yyyy)} -
      {end.format(dateFormats.mmm_d_yyyy)}
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
