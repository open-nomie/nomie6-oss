<script lang="ts">
  import './classic-button.css'
  // svelte
  import { createEventDispatcher } from 'svelte'

  // modules
  import Tracker from '../../modules/tracker/TrackerClass'
  import TimeBalls from '../time-balls/time-balls.svelte'

  // Components
  import Counter from '../counter/counter.svelte'

  import ScorePill from './score-pill.svelte'
  import Ball from './ball.svelte'
  import Text from '../text/text.svelte'
  import Button from '../button/button.svelte'
  import { Prefs } from '../../domains/preferences/Preferences'
  import IonIcon from '../icon/ion-icon.svelte'
  import { MoreVertical } from '../icon/nicons'

  // Props
  export let tracker: Tracker = new Tracker({})
  export let value = null
  // export let refreshing = false;
  export let id = undefined
  export let className = ''
  export let labelClass = ''
  export let disabled = undefined
  export let hideMore = false
  export let hoursUsed = []
  // export let hideMore = false;
  // export let lastUsed = null; // or dayjs object
  export let positivity = 0

  // Define Dispatch
  const dispatch = createEventDispatcher()

  let clickSkip

  let data = {
    pressing: false,
  }

  let timeout = null
  // Functions
  const methods = {
    // Clicked
    click() {
      dispatch('click', {})
    },
    moreClicked(evt) {
      evt.stopPropagation()
      evt.preventDefault()

      // methods.longPress();
    },
    rightclick(evt) {
      evt.preventDefault()
      return false
    },
    longPress() {
      dispatch('longpress', {})
    },
    // On Mouse Release / Touch Stop
    mouseup() {
      data.pressing = false
    },
    mousedown() {
      data.pressing = true
    },
  }
</script>

<div
  {id}
  on:longtap={() => {
    dispatch('longpress')
    clickSkip = true
  }}
  on:click={() => {
    if (!clickSkip) {
      dispatch('click')
    }
    clickSkip = undefined
  }}
  style="--tracker-color:{tracker.color}"
  class="tracker-button-wrapper tracker-{tracker.tag}
  {$Prefs.compactTrackers ? 'compact' : ''}
  {data.pressing ? 'pressing' : ''}
  {className}
  {disabled ? 'disabled' : ''}"
>
  <button class={`item-ball ${className} ${$Prefs.compactTrackers == true ? 'item-ball-small' : ''}`}>
    <!-- -->
    <div class="avatar-ball ">
      {#if hoursUsed.length}
        <div class="balls">
          <TimeBalls hours={hoursUsed} />
        </div>
      {/if}
      {#if tracker.one_tap}
        <div class="one-tap" />
      {/if}
      <ScorePill {positivity} score={value} />
      <Ball
        username={tracker.label}
        avatar={tracker.avatar}
        emoji={tracker.emoji}
        color={tracker.color}
        size={$Prefs.compactTrackers ? 80 : 120}
      />
    </div>

    <Text className="ball-label truncate-2">
      <span class={labelClass}>{tracker.label}</span>
    </Text>
    {#if tracker.started}
      <div class="center">
        <Counter initialDuration={tracker.timeTracked} started={tracker.started} />
      </div>
    {/if}
  </button>
  {#if !hideMore}
    <Button icon size="sm" className="more" on:click={() => dispatch('more', tracker)}>
      <IonIcon name={MoreVertical} size={22} />
    </Button>
  {/if}
</div>
<!-- last.log.end -->
