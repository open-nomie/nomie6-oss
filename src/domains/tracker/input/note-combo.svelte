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
  // Contexts that the template gives an explicit value, such as +name(1), keep that value
  let explicitContexts = new Set<string>()

  async function main() {
    const noteElements: Array<Token> = tokenizeLite(tracker.note)
    explicitContexts = new Set(
      noteElements.filter((t) => t.type === 'context' && t.value !== undefined && `${t.value}` !== '').map((t) => t.id)
    )
    trackables = noteElements.map((token) => {
      const trackable = tokenToTrackable(token, $TrackableStore.trackables)
      if (trackable.person) trackable.value = 0
      if (trackable.tracker?.type == 'value' && trackable.value == 1) {
        trackable.value = 0
      }
      if (trackable.tracker?.type == 'tick' && trackable.value == 1) {
        trackable.value = 0
      }

      return trackable
    })

    // Trigger the change so the parent catches it.
    if (tempValue) {
      dispatch('change', parseInt(tempValue))
    }
  }

  const getNote = () => {
    return trackables
      .filter((f) => {
        // if (f.type == 'tracker' && f.tracker.type == 'tick') {
        //   console.log({ f })
        // }
        //@ts-ignore
        if (f.value === true) {
          return true
        } else if (f.value >= 0 || f.value < 0) {
          return true
        }
        return false
      })
      .map((trackable) => {
        //@ts-ignore
        if (trackable.value === true) {
          trackable.value = 1
        }
        // A checked context is logged as +name with no value, so the period set on the context is used
        if (trackable.type === 'context' && trackable.value === 1 && !explicitContexts.has(trackable.ctx?.tag)) {
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
      <ListItem bottomLine={64} className="bg-white dark:bg-gray-900">
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
            <div class="">
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
                on:change={(evt) => {
                  // trackable.value = evt.target?.value;

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
