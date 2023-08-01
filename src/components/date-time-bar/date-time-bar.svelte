<script lang="ts">
  import { slide } from 'svelte/transition'
  import dayjs from 'dayjs'
  import type { Dayjs } from 'dayjs'

  import { onMount, createEventDispatcher } from 'svelte'

  import tick from '../../utils/tick/tick'
  import { Prefs } from '../../domains/preferences/Preferences'

  import TimeSelect from '../time-select/time-select.svelte'
  import Calendar from '../calendar/calendar.svelte'
  import { quintOut } from 'svelte/easing'
// import Calendar4 from '../calendar4/calendar4.svelte';

  const dispatch = createEventDispatcher()

  export let date: any = new Date().getTime() // prop
  export let opened: boolean = false
  export let style: string = ''
  export let calendarClass: string = ''
  export let calendarPosition: 'top' | 'bottom' = 'bottom'

  let lastDate
  let _date: Dayjs // local
  let _opened: boolean = opened
  let hide = false

  $: if (date && date !== lastDate) {
    init()
  } else if (!date && lastDate) {
    init()
  }

  async function toggleOpen(): Promise<void> {
    _opened = !_opened
  }

  function init() {
    // Get provided date - default to today
    date = date || new Date().getTime()
    // SEt local date to maniuplate
    _date = date instanceof Date ? dayjs(date) : dayjs(new Date(date))
    // Set local opened
    _opened = opened
    // Set last date to avoid uneeded reaction
    lastDate = date
  }

  /**
   * Set the Date
   * Sets month, day, year - leaving time alone
   */
  async function setDate(d: Dayjs) {
    // _date = _date.set("month", d.get("month")).set("date", d.get("date")).set("year", d.get("year"));
    _date = d
    _date = _date

    if (!opened && _opened) {
      await tick(300)
      hide = true
      await tick(200)
      _opened = false
      hide = undefined
    }
    dispatch('change', _date)
  }
  onMount(init)
</script>

{#if _date}
  <div class="date-time-bar-wrapper  {calendarPosition == 'top' ? 'calendar-top' : 'calendar-bottom'}">
    <div class="date-time-bar" {style}>
      <div class="flex">
        <slot name="left" />
        <button
          class="justify-content-start flex-grow text-sm"
          on:click={() => {
            toggleOpen()
          }}
        >
          {$Prefs.use24hour ? _date.format('ddd D MMM YYYY') : _date.format('ddd MMM D YYYY')}
        </button>
      </div>

      <TimeSelect
        is24Hour={$Prefs.use24hour}
        bind:time={date}
        on:change={(evt) => {
          setDate(dayjs(new Date(evt.detail)))
        }}
      />
    </div>
    {#if _opened}
      <div class="view date" transition:slide|global={{ delay: 0, duration: 300, easing: quintOut }}>
        <!-- <Calendar4 date={_date.toDate()} on:dateChange={(evt)=>{
          let calDate = dayjs(evt.detail).hour(_date.hour()).minute(_date.minute())
            setDate(calDate)
        }}  /> -->
        <Calendar
          className={calendarClass}
          initialDate={_date}
          showCalControl={true}
          on:dayClick={(evt) => {
            let calDate = evt.detail.hour(_date.hour()).minute(_date.minute())
            setDate(calDate)
          }}
        />
      </div>
    {/if}
  </div>
{/if}

<style global lang="postcss">
  .alert-dialog-window .date-time-bar-wrapper {
    margin-left: -16px;
    margin-right: -16px;
    width: calc(100% + 32px) !important;
    margin-top: 6px;
    @apply overflow-hidden;
  }
  .date-time-bar-wrapper {
    flex-grow: 1;
    flex-shrink: 1;
    width: 100%;
    display: flex;
    flex-direction: column;
  }
  .date-time-bar-wrapper.calendar-top {
    flex-direction: column-reverse;
  }
  .date-time-bar {
    @apply flex items-center space-x-2;
    @apply bg-white dark:bg-black;

    @apply justify-center items-center;
  }
  .date-time-bar button {
  }
  .date-time-bar button.date {
    text-align: left;
    padding-left: 10px;
  }
  .date-time-bar-wrapper .view.visible {
    margin-bottom: 8px;
  }
  .date-time-bar-wrapper .no-left-slot > .left {
    display: none;
  }
</style>
