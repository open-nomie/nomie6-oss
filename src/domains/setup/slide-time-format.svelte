<script lang="ts">
  import { Lang } from '../../store/lang'

  import dayjs from 'dayjs'
  import Button from '../../components/button/button.svelte'
  import { Prefs } from '../preferences/Preferences'
  import { onMount } from 'svelte'
  import Container from '../../components/container/container.svelte'
import Badge from '../../components/badge/badge.svelte'
import { Interact } from '../../store/interact';

  let initialized: boolean = false

  onMount(() => {
    if (!initialized) {
      if (new Date(new Date().setHours(20)).toLocaleTimeString().search('PM') === -1) {
        $Prefs.use24hour = true
        $Prefs.useMetric = true
        $Prefs.weekStarts = 'monday'
      }
      initialized = true
    }
  })
</script>

<Container className="filler px-5 flex items-center justify-center flex-col slide-location -mt-10">
  <div class="pt-3 mx-auto top center-grow min-w-full max-w-xl">
    
    <p class="mb-4 text-gray-500 dark:text-gray-400 text-center text-sm">Which looks right?</p>

    <div class="big-group p-2 bg-white dark:bg-black flex items-center shadow-lg rounded-2xl">
      <Button
        className="whitespace-no-wrap {!$Prefs.use24hour
          ? 'bg-primary text-white font-bold'
          : 'bg-white dark:bg-black text-gray-500'}"
        block
        size="md"
        type="clear"
        delay={20}
        on:click={() => {
          $Prefs.use24hour = false
        }}
      >
        {dayjs().format('h:mma')}
      </Button>
      <Button
        className="whitespace-nowrap {$Prefs.use24hour
          ? 'bg-primary text-white font-bold'
          : 'bg-white dark:bg-black text-gray-500'}"
        type="clear"
        block
        size="md"
        delay={20}
        on:click={() => {
          $Prefs.use24hour = true
        }}
      >
        {dayjs().format('HH:mm')}
      </Button>
    </div>

    <div class="big-group p-2 mt-4 bg-white dark:bg-black flex items-center shadow-lg rounded-2xl">
      <Button
        className={!$Prefs.useMetric ? 'bg-primary text-white font-bold' : 'bg-white dark:bg-black text-gray-500'}
        block
        size="md"
        type="clear"
        delay={20}
        on:click={() => {
          $Prefs.useMetric = false
        }}
      >
        10 lbs
      </Button>
      <Button
        className=" {$Prefs.useMetric ? 'bg-primary text-white font-bold' : 'bg-white dark:bg-black text-gray-500'}"
        type="clear"
        block
        size="md"
        delay={20}
        on:click={() => {
          $Prefs.useMetric = true
        }}
      >
        4.5 kg
      </Button>
    </div>

    <p class="mt-4 mb-1 text-gray-500 dark:text-gray-400 text-center text-sm">Week Starts On:</p>

    <div class="big-group p-2 mt-2 bg-white dark:bg-black flex items-center shadow-lg rounded-2xl">
      <Button
      className={$Prefs.weekStarts == 'sunday'
          ? 'bg-primary text-white font-bold'
          : 'bg-white dark:bg-black text-gray-500'}
        block
        size="md"
        type="clear"
        delay={20}
        on:click={() => {
          $Prefs.weekStarts = 'sunday'
        }}
      >
      Sun
    </Button>
    <Button
    className=" {$Prefs.weekStarts == 'monday'
          ? 'bg-primary text-white font-bold'
          : 'bg-white dark:bg-black text-gray-500'}"
        type="clear"
        block
        size="md"
        delay={20}
        on:click={() => {
          $Prefs.weekStarts = 'monday'
        }}
      >
      Mon
    </Button>
  </div>
  <p class="mt-4 mb-1 text-gray-500 dark:text-gray-400 text-center text-sm">Location Tracking <Badge on:click={()=>{
    Interact.alert(`Location Tracking`,'Have Nomie save your current location (lat,long) each time you record data.')
  }} value="?" /></p>
  
  
    <div class="big-group p-2 bg-white dark:bg-black flex items-center shadow-lg rounded-2xl">
      <Button
        className="whitespace-no-wrap {!$Prefs.alwaysLocate
          ? 'bg-primary text-white font-bold'
          : 'bg-white dark:bg-black text-gray-500'}"
        block
        size="md"
        type="clear"
        delay={20}
        on:click={() => {
          $Prefs.alwaysLocate = false
        }}
      >
        Disabled
      </Button>
      <Button
        className="whitespace-nowrap {$Prefs.alwaysLocate
          ? 'bg-primary text-white font-bold'
          : 'bg-white dark:bg-black text-gray-500'}"
        type="clear"
        block
        size="md"
        delay={20}
        on:click={() => {
          $Prefs.alwaysLocate = true
        }}
      >
        Enabled
      </Button>
    </div>
      
</div>
</Container>


<style lang="postcss" global>
  .big-group {
    @apply max-w-sm;
    @apply w-full;
    @apply mx-auto;
  }
</style>