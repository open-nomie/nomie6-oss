<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import Button from '../button/button.svelte'
  import IonIcon from '../icon/ion-icon.svelte'
  import { CalendarOutline, ChevronBackOutline, ChevronForwardOutline } from '../icon/nicons'

  export let isToday = true
  export let hideCal = false
  export let style = ''
  export let className = ''

  const dispatch = createEventDispatcher()
</script>

<div class="flex items-center flex-grow-0 flex-shrink-0 next-prev-cal {className}" {style}>
  <Button
    className="previous-action"
    icon
    delay={0}
    on:click={() => {
      dispatch('previous')
    }}
  >
    <IonIcon icon={ChevronBackOutline} size={24} className="text-primary-500" />
  </Button>
  {#if !hideCal}
    <Button
      className="calendar-action {isToday ? 'tap-icon' : 'text-white bg-primary-500'}"
      delay={0}
      icon
      color="transparent"
      shape="round"
      on:click={() => {
        dispatch('calendar')
      }}
    >
      <IonIcon icon={CalendarOutline} size={24} />
    </Button>
  {/if}
  <slot />
  <Button
    className="next-action"
    delay={0}
    icon
    on:click={() => {
      dispatch('next')
    }}
  >
    <IonIcon icon={ChevronForwardOutline} size={24} className="text-primary-500" />
  </Button>
</div>

<style lang="postcss">
  .next-prev-cal {
    flex-shrink: 1;
    flex-grow: 0;
  }
</style>
