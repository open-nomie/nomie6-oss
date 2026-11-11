<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte'

  import LetterTicker from '../../../components/letter-ticker/letter-ticker.svelte'
  import ListItem from '../../../components/list-item/list-item.svelte'

  import ToggleSwitch from '../../../components/toggle-switch/toggle-switch.svelte'
  import ManualTime from '../../../components/counter/manual-time.svelte'
  import { TrackableStore } from '../../trackable/TrackableStore'
  import { Trackable } from '../../trackable/Trackable.class'
  import TrackableAvatar from '../../../components/avatar/trackable-avatar.svelte'
  import type TrackerClass from '../../../modules/tracker/TrackerClass'
  // import InputSlider from '../../../components/input-slider/input-slider.svelte'
  import InputSlider2 from '../../../components/input-slider/input-slider2.svelte'
  import { type Token, tokenizeLite } from '../../../modules/tokenizer/lite'
  import { tokenToTrackable } from '../../../modules/tokenizer/tokenToTrackable'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import Button from '../../../components/button/button.svelte'
  import AddCircleOutline from '../../../n-icons/AddCircleOutline.svelte'
  import { getTrackableInputValue } from './TrackerInputStore'

  import { isTruthy } from '../../../utils/truthy/truthy'
  import List from '../../../components/list/list.svelte'
  import Title from '../../../components/title/title.svelte'

  const { value, tracker } = $props()

  let tempValue = $state(value)
  $effect(() => {
    tempValue = value
  })

  const dispatch = createEventDispatcher()

  let trackables = $state<Array<Trackable>>([])
  // Trackers the user changed in this input. Only these are tracked.
  let touched = $state(new Set<string>())
  const markTouched = (trackable: Trackable) => {
    if (trackable.tag) touched = new Set([...touched, trackable.tag])
  }
  // Selected means the user changed it and it has a value. Anything else is greyed out.
  // Range and value items: touched, or (unless the combo is touch only) logged at their default
  const isSelected = (t: Trackable): boolean => {
    if (t.value === true) return true
    const n = Number(t.value)
    if (isNaN(n) || n === 0) return false
    if (touched.has(t.tag)) return true
    const isValueItem = t.tracker?.type === 'range' || t.tracker?.type === 'value'
    return tracker.combo_touch_only !== true && isValueItem
  }

  async function main() {
    const noteElements: Array<Token> = tokenizeLite(tracker.note)
    trackables = noteElements.map((token) => {
      const trackable = tokenToTrackable(token, $TrackableStore.trackables)
      if (trackable.person) trackable.value = 0
      if (trackable.tracker?.type == 'value' && trackable.value == 1) {
        trackable.value = 0
      }
      if (trackable.tracker?.type == 'tick' && trackable.value == 1) {
        trackable.value = 0
      }
      // A #name without a value starts at the tracker's configured default. The editor writes #name(1)
      // into the template, and a (1) is treated as no value, like the context rule.
      const givenValue = (token.raw || '').replace('(1)', '').includes('(')
      if (trackable.tracker && !givenValue && !isNaN(Number(trackable.tracker.default))) {
        trackable.value = trackable.tracker.default
      }

      return trackable
    })

    // Trigger the change so the parent catches it.
    if (tempValue) {
      dispatch('change', parseInt(tempValue))
    }
    // Send the starting note, so an untouched combo with automatic defaults still logs them
    fireChange()
  }

  const getNote = () => {
    return trackables
      .filter((f) => {
        // if (f.type == 'tracker' && f.tracker.type == 'tick') {
        //   console.log({ f })
        // }
        // Only what the user selected is tracked. A range slider starts at its minimum, so an untouched
        // tracker is left out.
        return isSelected(f)
      })
      .map((trackable) => {
        //@ts-ignore
        if (trackable.value === true) {
          trackable.value = 1
        }
        // A checked context is logged as +name with no value, so the period set on the context is used
        if (trackable.type === 'context' && Number(trackable.value) === 1) {
          return trackable.tag
        }
        return trackable.getNoteValue()
      })
      .join(' ')
  }

  const fireChange = () => {
    const note = getNote()
    dispatch('note', note)
    dispatch('change', 1)
  }

  onMount(main)
</script>

<div class="h-full tracker-input-combo">
  <List solo>
    {#each trackables as trackable, index}
      <article class="flex flex-col justify-center items-center" />
      <ListItem
        bottomLine={64}
        className="bg-white dark:bg-gray-900 {(trackable.tracker?.type === 'range' || trackable.tracker?.type === 'value') && !isSelected(trackable) ? 'opacity-40' : ''}"
      >
        <TrackableAvatar slot="left" {trackable} size={46} />
        <main class="filler">
          <header class="flex items-center justify-between">
            <Title>{trackable.label}</Title>
            {#if trackable.tracker?.type == 'range'}
              <LetterTicker className="text-lg font-bold" text={trackable.tracker?.displayValue(trackable.value)} />
            {/if}
          </header>
          {#if trackable.tracker?.type === 'note'}
            <div class="dark:text-white filler  py-1 text-sm ">Nested Combos are currently not supported</div>
          {/if}
          {#if trackable.tracker?.type === 'range'}
            <div class="" on:pointerdown={() => markTouched(trackable)} on:keydown={() => markTouched(trackable)} role="presentation">
              <InputSlider2
                {trackable}
                step={trackable.tracker.step || 1}
                value={trackable.value}
                min={parseFloat(`${trackable.tracker.min}`) || 0}
                max={parseFloat(`${trackable.tracker.max}`) || 100}
                on:input={(evt) => {
                  const index = trackables.indexOf(trackable)
                  const updated = new Trackable({ ...trackable, value: evt.detail })
                  trackables[index] = updated
                  trackables = trackables
                  fireChange()
                }}
                className="w-full"
              />
            </div>
          {/if}
        </main>
        <div slot="right" class="pr-2 text-right ">
          {#if trackable.tracker?.type === 'value'}
            <div class="flex items-center">
              <input
                aria-label={trackable.label}
                on:input={() => markTouched(trackable)}
                on:change={(evt) => {
                  // trackable.value = evt.target?.value;
                  markTouched(trackable)
                  fireChange()
                }}
                on:focus={(evt) => {
                  const target = evt.target
                  //@ts-ignore
                  target.select()
                }}
                class="bg-gray-100 pr-10 stiff mr-2 dark:bg-gray-800 text-black dark:text-white text-lg rounded-md p-2 flex-shrink text-right w-24 font-bold"
                type="number"
                bind:value={trackable.value}
              />
              <Button
                className="-ml-8"
                on:click={async () => {
                  const res = await getTrackableInputValue(trackable, $TrackableStore.trackables, 'Next')
                  trackable.value = res.value
                  fireChange()
                }}
                icon
                primary
                title="Add value"><IonIcon icon={AddCircleOutline} /></Button
              >
            </div>
          {:else if trackable.tracker?.type === 'tick' || trackable.type === 'context' || trackable.type === 'pointer'}
            <ToggleSwitch
              title={`input`}
              on:change={(evt) => {
                trackable.value = evt.detail ? 1 : 0
                markTouched(trackable)
                fireChange()
              }}
            />
            
          {:else if trackable.tracker?.type === 'timer'}
            <ManualTime size="sm" bind:value={trackable.value} />
            <!-- {:else if trackable.tracker?.type === 'note'} -->
          {:else if trackable.person || trackable.context || trackable.pointer}
            <ToggleSwitch
              title="value"
              on:change={(evt) => {
                trackable.value = evt.detail ? 1 : 0
                markTouched(trackable)
                fireChange()
              }}
            />
          {/if}
        </div>
      </ListItem>
    {/each}
  </List>
</div>

<style lang="postcss" global>
  .input-modal.type-note {
    @apply overflow-y-auto;
    max-height: 75vh;
  }
</style>
