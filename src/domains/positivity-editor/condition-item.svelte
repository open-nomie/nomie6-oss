<script lang="ts">
  import dayjs from 'dayjs'

  import { createEventDispatcher } from 'svelte'

  import appConfig from '../../config/appConfig'
  import { ConditionIfs, ICondition, IConditionIfUnit, IConditionIsUnit } from '../../modules/scoring/score-tracker'
  import { ConditionIs } from '../../modules/scoring/score-tracker'
  import Ordinal from '../../utils/ordinal/ordinal'
  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import { Prefs } from '../preferences/Preferences'
  import type { Trackable } from '../trackable/Trackable.class'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { getTrackableInputValue } from '../tracker/input/TrackerInputStore'
  export let condition: ICondition
  export let index: number
  export let trackable: Trackable

  let workingCondition: ICondition
  const dispatch = createEventDispatcher()

  $: if (!workingCondition && condition) {
    workingCondition = { ...condition }
  }

  $: if (workingCondition) {
    dispatch('change', workingCondition)
  }

  const getTrackableValue = async () => {
    const res = await getTrackableInputValue(trackable, $TrackableStore.trackables, 'Add Condition →', {
      value: condition.v,
    })

    workingCondition.v = res.value
  }

  const convertValueType = (type: IConditionIfUnit) => {
    if (type == 'value') return 'Value'
    if (type == 'hour') return 'Hour'
    if (type == 'month') return 'Day'
    return 'Value'
  }

  const convertCondition = (is: IConditionIsUnit) => {
    if (is === 'gt') return `>`
    if (is === 'gte') return `>=`
    if (is === 'lt') return '<'
    if (is === 'lte') return `<=`
    if (is === 'eq') return '='
    return '='
  }

  const getDays = () => {
    let days = []
    for (let i = 0; i < 31; i++) {
      days.push({
        value: Ordinal(i + 1),
        index: i + 1,
      })
    }
    return days
  }
  const getHours = () => {
    let hours = []
    for (let i = 0; i < 24; i++) {
      let date = dayjs().startOf('day').add(i, 'hour')

      hours.push({
        value: $Prefs.use24hour ? date.format('HH:mm') : date.format('h:mm a'),
        index: i + 1,
      })
    }
    return hours
  }
</script>

<div class="w-full py-2 flex flex-col items-center text-black dark:text-white">
  <header class="header px-2 flex w-full items-center justify-center">
    <slot name="left" />
    {#if index === 0}
      <div class="filler text-lg font-bold">If this:</div>
    {:else}
      <div class="filler text-lg font-bold">else this:</div>
    {/if}
    <div class="filler flex justify-end">
      <slot name="right" />
    </div>
  </header>
  <main class="condition-group px-8 w-full">
    <select aria-label="Compare to What?" bind:value={workingCondition.if} class="condition-select">
      {#each ConditionIfs as cif}
        <option value={cif}>{convertValueType(cif)}</option>
      {/each}
    </select>
    <select aria-label="Comparison Value IS" bind:value={workingCondition.is} class="condition-select">
      {#each ConditionIs as is}
        <option value={is}>{convertCondition(is)}</option>
      {/each}
    </select>
    {#if workingCondition.if === 'value'}
      {#if trackable?.type == 'tracker' && trackable?.tracker?.type == 'timer'}
        <input
          aria-label="Value to Compare against"
          class="condition-select w-12 lg:w-14"
          on:click={() => getTrackableValue()}
          readonly
          value={trackable.formatValue(workingCondition.v)}
        />
      {:else}
        <input
          class="condition-select w-12 lg:w-14"
          aria-label="Value to Compare against"
          bind:value={workingCondition.v}
        />
      {/if}
    {:else if workingCondition.if === 'hour'}
      <select aria-label="Hour of the Day" bind:value={workingCondition.v} class="condition-select w-12">
        {#each getHours() as hour}
          <option value={hour.index}>{hour.value}</option>
        {/each}
      </select>
    {:else if workingCondition.if === 'month'}
      <select aria-label="Day of the Month" bind:value={workingCondition.v} class="condition-select w-12">
        {#each getDays() as day}
          <option value={day.index}>{day.value}</option>
        {/each}
      </select>
    {/if}
    <select
      value={`${workingCondition.sc}`}
      class="condition-select emoji"
      on:change={(evt) => {
        //@ts-ignore
        workingCondition.sc = parseNumber(evt.target.value)
      }}
    >
      {#each appConfig.positivity as positivity}
        {`${positivity.score} === ${workingCondition.sc}`}
        <option selected={`${positivity.score}` == `${workingCondition.sc}`} value={`${positivity.score}`}
          >{positivity.emoji}</option
        >
      {/each}
    </select>
  </main>
</div>

<style lang="postcss" global>
  .condition-select {
    @apply text-base lg:text-lg appearance-none font-bold bg-gray-200;
    @apply text-center dark:bg-gray-800;
    @apply rounded-lg py-1 px-1 lg:px-2 text-primary-500;
    @apply focus:outline-none;
    @apply focus:ring-2 ring-primary-400 ring-opacity-75;
  }
  .condition-select.emoji {
    @apply text-2xl lg:text-3xl;
    @apply leading-none;
  }
  .condition-group {
    @apply space-x-2;
    @apply w-full;
    @apply flex items-center;
    @apply rounded-lg;
  }
</style>
