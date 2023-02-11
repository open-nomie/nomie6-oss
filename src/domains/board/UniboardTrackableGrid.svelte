<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { LedgerStore } from '../ledger/LedgerStore'

  import ShortcutButton from '../../components/shortcut-button/shortcut-button.svelte'

  import Counter from '../../components/counter/counter.svelte'

  import time from '../../utils/time/time'

  import type { Trackable } from '../trackable/Trackable.class'
  import { Prefs } from '../preferences/Preferences'
  import { loadToday, TodayStore } from '../usage/today/TodayStore'
  import { TrackableStore } from '../trackable/TrackableStore'

  import { UsageLast } from '../usage/UsageStore'
  import { removePrefix } from '../../utils/text/text'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import AddIcon from '../../n-icons/AddIcon.svelte'

  const dispatch = createEventDispatcher()

  export let trackables: Array<Trackable> = []
  export let hideMore: boolean = false
  export let hideAdd: boolean = false
  export let searching: boolean = false

  /**
   * Gets Todays Usage for a given Trackable
   * @param trackable
   * @param format
   */

  let lastLedgerHash: string = ''
  $: if ($LedgerStore.hash !== lastLedgerHash) {
    lastLedgerHash = $LedgerStore.hash
    loadToday({ knownTrackables: $TrackableStore.trackables, date: $TodayStore.date })
  }
</script>

<!-- Short Cut Button Style -->
{#if !trackables.length}
  <slot name="no-results" />
{/if}
<div class="item-grid">
  {#each trackables as trackable, index}
    {#if trackable && trackable.tag}
      <ShortcutButton
        compact={$Prefs.compactTrackers}
        id="{trackable.type}-{`${trackable.tag}`.replace(/(\#|\@|\+)/gi, '')}"
        title={trackable.label}
        hoursUsed={$TodayStore.usage[trackable.tag] ? $TodayStore.usage[trackable.tag].hours : []}
        subtitle={$UsageLast[trackable.tag] ? time.fromNow($UsageLast[trackable.tag]?.d) : undefined}
        emoji={trackable.emoji}
        avatar={trackable.avatar}
        value={$TodayStore.usage[trackable.tag] ? $TodayStore.usage[trackable.tag].displayValue : undefined}
        oneTap={trackable.tracker?.one_tap}
        color={trackable.color}
        on:longpress={() => {
          dispatch('longpress', trackable)
        }}
        className="{trackable.type}-{removePrefix(trackable.tag)} tracker-board-button"
        {hideMore}
        on:click={() => {
          dispatch('tap', trackable)
        }}
        on:more={() => {
          dispatch('more', trackable)
        }}
      >
        <div slot="subtitle">
          {#if trackable.tracker?.started}
            <Counter initialDuration={trackable.tracker.timeTracked} started={trackable.tracker.started} color={trackable.tracker.color} />
          {/if}
        </div>
      </ShortcutButton>
    {/if}
  {/each}

  {#if !hideAdd && !searching}
    <button
      class="addButton filler border border-gray-500 rounded-2xl flex items-center justify-center opacity-25 hover:opacity-100 {$Prefs.compactTrackers
        ? 'h-14'
        : 'h-28 lg:h-32'}"
      on:click={() => {
        dispatch('add')
      }}
    >
      <IonIcon className="text-gray-500" icon={AddIcon} />
    </button>
  {/if}
</div>

<style lang="postcss" global>
  .tracker-list-item.in-note .tracker-label {
    font-weight: bold;
    color: var(--tracker-color);
  }
  .tracker-list-item .highlight {
    position: absolute;
    left: 3px;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 2px;
  }
  .tracker-list-item.no-value {
    background-color: transparent;
  }
  .tracker-list-item.no-value .highlight {
    display: none;
  }
</style>
