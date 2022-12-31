<script lang="ts">
  import dayjs from 'dayjs'

  import { createEventDispatcher } from 'svelte'
  import { Prefs } from '../../domains/preferences/Preferences'
  import IonIcon from '../icon/ion-icon.svelte'
  import { ChevronBackOutline, ChevronForwardOutline } from '../icon/nicons'

  export let date: number

  const dispatch = createEventDispatcher()
  let theDate = new Date()

  const dayMonth = $Prefs.use24hour ? 'DD/MM' : 'MM/DD'

  $: if (date && date !== theDate.getTime()) {
    theDate = new Date(date)
  } else if (!date && theDate.getTime()) {
    theDate = new Date()
  }

  const addDate = () => {
    theDate = dayjs(theDate).add(1, 'day').toDate()
    date = theDate.getTime()
    dispatch('click', date)
  }
  const subtractDate = () => {
    theDate = dayjs(theDate).subtract(1, 'day').toDate()
    date = theDate.getTime()
    dispatch('click', date)
  }
</script>

<div class="flex items-center text-xs space-x- date-stepper" aria-label="Control the Date">
  <button on:click={subtractDate} class="stepper-button">
    <IonIcon icon={ChevronBackOutline} size={14} />
  </button>
  <div class="w-12 font-semibold leading-none text-center" aria-label={dayjs(theDate).format(`${dayMonth} YYYY`)}>
    <div class="font-semibold dark:text-white">
      {dayjs(theDate).format(dayMonth)}
    </div>
    <div class="text-gray-500">{dayjs(theDate).format('YYYY')}</div>
  </div>
  <button on:click={addDate} class="stepper-button">
    <IonIcon icon={ChevronForwardOutline} size={14} />
  </button>
</div>

<style global>
  .stepper-button {
    @apply bg-white dark:bg-gray-500;
    @apply text-black;
    @apply shadow-sm;
    @apply rounded-md;
    @apply h-5;
    @apply border border-gray-500 border-opacity-40;
    @apply flex items-center;
  }
</style>
