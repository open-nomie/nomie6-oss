<svelte:options runes={true} />

<script lang="ts">
  import { wait } from '../../../../utils/tick/tick'
  import { untrack } from 'svelte'

  /**
   * Welcome to the Editor - this is a mess... but I'm trying to simplify the whole process
   * this version will be removing the multistep tracker designer and replace it with
   * this view only.
   *
   * God speed.
   */
  import ListItem from '../../../../components/list-item/list-item.svelte'

  import NToggle from '../../../../components/toggle-switch/toggle-switch.svelte'
  import NInput from '../../../../components/input/input.svelte'
  import AutoComplete from '../../../../components/auto-complete/auto-complete.svelte'
  import PickerListEditor from '../../../../components/picker-list/picker-editor.svelte'

  // Utils

  import '../tracker/editor.css'

  // modules
  import { toTag } from '../../../../modules/tracker/TrackerClass'
  import type { ITrackerType } from '../../../../modules/tracker/TrackerClass'
  import { getTypeDetails } from '../../../../modules/tracker-types/tracker-types'

  // containers

  // Stores
  import { Interact } from '../../../../store/interact'

  import { Lang } from '../../../../store/lang'
  import Text from '../../../../components/text/text.svelte'

  import Button from '../../../../components/button/button.svelte'
  import trackerTypes from '../../../../modules/tracker-types/tracker-types'

  import List from '../../../../components/list/list.svelte'
  import Divider from '../../../../components/divider/divider.svelte'

  import { getGroupedUoms, uomPlural, uomSymbol } from '../../../uom/uom-utils'

  import { focusTypes } from '../../../focus/focus-utils'

  import IonIcon from '../../../../components/icon/ion-icon.svelte'
  import { AddOutline, ChevronDownOutline, ChevronUpOutline, RemoveOutline } from '../../../../components/icon/nicons'

  import type { Trackable } from '../../Trackable.class'
  import type TrackerClass from '../../../../modules/tracker/TrackerClass'
  import PositivityEditor from '../../positivity-editor/positivity-editor.svelte'
  import TrackableListBuilder from '../../TrackableListBuilder.svelte'

  let { trackable = $bindable() } = $props<{ trackable: Trackable }>()
  let updateTrigger: number = $state(0)
  let tracker: TrackerClass = $state(trackable.tracker)
  let lastTrackerRef = $state<TrackerClass | undefined>(undefined)
  let focusList: Array<string> = $state([])
  // The default value as typed, so a comma can be entered and kept while typing
  let defaultText: string = $state('')

  // Sync when tracker reference changes or when updateTrigger changes
  $effect(() => {
    updateTrigger // depend on trigger to detect external changes
    if (trackable?.tracker !== lastTrackerRef) {
      tracker = trackable.tracker
      lastTrackerRef = trackable.tracker
      focusList = [...(tracker?.focus || [])]
      defaultText = formatDefault(tracker.default)
    }
  })

  // Initialize focus list from tracker
  $effect(() => {
    if (tracker) {
      focusList = [...(tracker.focus || [])]
    }
  })

  // Initialize note field if undefined
  $effect(() => {
    if (tracker && tracker.type === 'note' && tracker.note === undefined) {
      tracker.note = ''
    }
  })

  const groupedUOM = getGroupedUoms()

  let advanced: boolean = $state(false)
  let forceAdvancedView: boolean = $state(false)
  let advancedCanToggle: boolean = $state(true)
  let tagHardcoded: boolean = $state(false)
  let alsoInclude: boolean = $state(false)

  $effect(() => {
    if (tracker && !forceAdvancedView) {
      if (tracker.include) {
        alsoInclude = true
      }
      // For habit type, always allow toggling - don't force advanced based on properties
      if (tracker.type === 'habit') {
        advancedCanToggle = true
        advanced = false
      } else {
        // For other types, check if they have advanced properties set
        const mathCheck = tracker.math !== 'sum'
        const hasAdvancedProps =
          tracker.include ||
          tracker.default ||
          mathCheck ||
          tracker.uom !== 'num' ||
          tracker.step ||
          tracker.one_tap

        if (hasAdvancedProps) {
          advanced = true
          advancedCanToggle = false
        } else {
          advancedCanToggle = true
          advanced = false
        }
      }
    } else if (forceAdvancedView) {
      advanced = true
    }
  })

  $effect(() => {
    if (tracker.type === 'timer') {
      tracker.uom = 'timer'
      tracker.min = null
      tracker.max = null
    } else if (tracker.uom == 'timer') {
      tracker.uom = 'num'
    } else if (tracker.type === 'range' && isNaN(tracker.min)) {
      tracker.min = 1
      tracker.max = 10
    }
  })

  $effect(() => {
    if (tracker.label && tracker._dirty && !tagHardcoded) {
      tracker.tag = toTag(tracker.label)
    }
  })

  const toNumber = (v) => parseFloat(`${v ?? ''}`.replace(',', '.'))

  /**
   * Step the min, max or default value up or down by the range step.
   * Min never goes above max and max never goes below min.
   * The default stays within the range.
   */
  function nudge(field: 'min' | 'max' | 'default', direction: 1 | -1) {
    const step = toNumber(tracker.step) || 1
    const min = toNumber(tracker.min)
    const max = toNumber(tracker.max)
    const current = toNumber(tracker[field])
    let next = isNaN(current) ? (isNaN(min) ? 0 : min) : current + direction * step
    if (field !== 'max' && !isNaN(max)) next = Math.min(max, next)
    if (field !== 'min' && !isNaN(min)) next = Math.max(min, next)
    tracker[field] = Math.round(next * 1e6) / 1e6
    if (field === 'default') defaultText = formatDefault(tracker.default)
    updateTrigger++
  }

  const formatDefault = (value: any): string => {
    const n = toNumber(value)
    return value === undefined || value === null || isNaN(n) ? '' : `${n}`
  }

  /**
   * The default field is a text input, so a comma works as the decimal point.
   * The typed text is kept as it is; the default is stored as a number.
   */
  function onDefaultInput(text: string) {
    defaultText = text
    if (text.trim() === '') {
      tracker.default = undefined
      return
    }
    const n = toNumber(text)
    if (!isNaN(n)) tracker.default = n
  }

  async function setType(type: ITrackerType) {
    await wait(200)
    tracker.type = type
    if (tracker.type == 'habit') {tracker.math = 'mean'}
    // Force reactivity update
    updateTrigger++
  }

  const methods = {
    /**
     * Save The Tracker
     */

    /**
     * Select Tracker Type
     * Opens Popmenu for selection
     */
    selectType() {
      const buttons = Object.keys(trackerTypes).map((typeKey: ITrackerType) => {
        let type = trackerTypes[typeKey]

        return {
          emoji: type.emoji,
          checked: typeKey === tracker.type,
          title: `${type.label}`,
          description: `${type.description}`,
          id: type.id,
          click: () => setType(typeKey),
        }
      })

      Interact.popmenu({
        id: `tracker-type`,
        title: Lang.t('tracker.type', 'Type'),
        buttons,
      })
    },
  }
</script>

{#key updateTrigger}
  <!-- Tracker Label input -->
  <main class="flex flex-col space-y-4">
    <!-- Tracker Type Selector -->

    <List solo>
    <ListItem
      id="tracker-type-selector"
      clickable
      on:click={() => {
        methods.selectType()
      }}
      className="tracker-type py-2"
    >
      {Lang.t('tracker.input-type', 'Input Type')}
      <div slot="right" class="flex h-12 items-center">
        <Text bold>{(getTypeDetails(tracker?.type) || {}).label}</Text>

        <IonIcon icon={ChevronDownOutline} className="text-gray-500 mr-3 ml-2" size={16} />
      </div>
    </ListItem>
  </List>

  {#if tracker.type == 'picker'}
    <List solo>
      <!-- canSelect={false} -->
      <PickerListEditor
        bind:list={tracker.picks}
        className="tracker-picker"
        itemClass=""
        on:change={(evt) => {
          tracker.picks = (evt.detail || []).filter((d) => d.length)
        }}
      />
    </List>
  {/if}

  {#if tracker.type == 'habit'}
  <List solo>
    <NInput
      placeholder="Label for Achieved Habit"
      type="text"
      className="tracker-math mb-3"
      bind:value={tracker.habitChoice[0]}
    >
    </NInput>
    <Divider center />
    <NInput
      type="text"
      className="tracker-math mb-3"
      name="False"
      placeholder="Label for Missed Habit"
      bind:value={tracker.habitChoice[1]}
    >
     
    </NInput>
  </List>
  
    {/if}

  {#if tracker.type == 'range'}
    <List solo>
      <div class="flex px-1">
        <NInput
          listItem
          inputmode="decimal"
          className="mr-2 tracker-min bg-transparent"
          style="width:45%;"
          name="min"
          placeholder={Lang.t('tracker.min', 'Min Value')}
          label={Lang.t('tracker.min', 'Min Value')}
          on:focus={(e) => {
            e.detail.target.select()
          }}
          bind:value={tracker.min}
        >
          <div slot="right" class="flex items-center">
            <Button icon on:click={() => nudge('min', -1)}>
              <IonIcon icon={RemoveOutline} className="text-gray-500" />
            </Button>
            <Button className="pr-1" icon on:click={() => nudge('min', 1)}>
              <IonIcon icon={AddOutline} className="text-gray-500" />
            </Button>
          </div>
        </NInput>
        <NInput
          listItem
          inputmode="decimal"
          className="tracker-max"
          style="width:45%;"
          name="max"
          label={Lang.t('tracker.max', 'Max Value')}
          placeholder={Lang.t('tracker.max', 'Max Value')}
          on:focus={(e) => e.detail.target.select()}
          bind:value={tracker.max}
        >
          <div slot="right" class="flex items-center">
            <Button icon on:click={() => nudge('max', -1)}>
              <IonIcon icon={RemoveOutline} className="text-gray-500" />
            </Button>
            <Button className="pr-1" icon on:click={() => nudge('max', 1)}>
              <IonIcon icon={AddOutline} className="text-gray-500" />
            </Button>
          </div>
        </NInput>
      </div>
      <Divider left={1} />
      <div class="flex px-1">
        <NInput
          listItem
          className="mr-2 tracker-min bg-transparent"
          style="width:45%;"
          name="minLabel"
          placeholder={Lang.t('tracker.min-label', 'Min Label')}
          label={Lang.t('tracker.min-label', 'Min Label')}
          on:focus={(e) => {
            e.detail.target.select()
          }}
          bind:value={tracker.minLabel}
        />
        <NInput
          listItem
          className="tracker-max-label"
          style="width:45%;"
          name="max-label"
          label={Lang.t('tracker.max-label', 'Max Label')}
          placeholder={Lang.t('tracker.max-label', 'Max Label')}
          on:focus={(e) => e.detail.target.select()}
          bind:value={tracker.maxLabel}
        />
      </div>
    </List>
  {/if}

  {#if tracker.type == 'note'}
    <List solo>
      <TrackableListBuilder
        value={tracker.note}
        onValueChange={(newValue) => {
          if (trackable?.tracker) {
            trackable.tracker.note = newValue
            // Increment trigger to force parent effect to re-run and detect the change
            updateTrigger++
          }
        }}
      />
      <!-- <ListItem
            transparent
            description={Lang.t(
              'tracker.note-description',
              'Combine multiple trackers together using their #hashtags. For example, #mood #sleep_quality. Nomie will then ask for values one by one.'
            )}
          /> -->
    </List>
  {/if}

  {#if tracker.type !== 'timer' && tracker.type !== 'note' && tracker.type !== 'picker' && tracker.type !== 'habit'}
    <List solo>
      <NInput
        listItem
        placeholder={Lang.t('tracker.measure-by', 'Measure By')}
        type="select"
        className="tracker-uom"
        bind:value={tracker.uom}
      >
        {#each Object.keys(groupedUOM) as groupKey (groupKey)}
          {#if tracker.type !== 'timer' && groupKey !== 'Timer'}
            <option disabled>-- {groupKey}</option>
            {#each groupedUOM[groupKey] as uom (`${groupKey}-${uom.key}`)}
              <option value={uom.key} disabled={uom.key == 'time' && tracker.type != 'timer'}>
                {uomPlural(uom.key)}
                {#if uomPlural(uom.key).toLowerCase() !== uomSymbol(uom.key).toLowerCase()}
                  {#if uomSymbol(uom.key).length > 0}
                    ({uomSymbol(uom.key)})
                  {/if}
                {/if}
              </option>
            {/each}
          {/if}
        {/each}
      </NInput>
      <Divider center />
      <NInput
        listItem
        type="select"
        className="tracker-math mb-3"
        name="math"
        placeholder={Lang.t('tracker.calculate-total', 'Calculate Totals')}
        bind:value={tracker.math}
      >
        {#each [{ value: 'sum', label: Lang.t('general.sum', 'Sum') }, { value: 'mean', label: Lang.t('general.avg', 'Average') }] as math_key}
          <option value={math_key.value}>{math_key.label}</option>
        {/each}
      </NInput>
    </List>
  {/if}

  <!-- ADVANCED OPTIONS -->

  {#if advancedCanToggle}
    <div class="px-4">
      <Button
        block
        text
        color="clear"
        size="sm"
        className="mt-2 mb-3 advanced-toggler text-gray-600 dark:text-gray-200"
        on:click={() => (forceAdvancedView = !forceAdvancedView)}
      >
        {#if advanced}Less Options{:else}More Options{/if}
        <IonIcon name={advanced ? ChevronUpOutline : ChevronDownOutline} size={12} className="ml-2 text-gray-500" />
      </Button>
    </div>
  {/if}

  {#if advanced}
    {#if tracker.type == 'tick'}
      <List solo className="p-1">
        <ListItem
          title={Lang.t('tracker.save-on-tap', 'Save on Tap')}
          className="tracker-one-tap leading1"
          description={Lang.t('tracker.save-on-tap-description', 'Save note immediately after tapping the button.')}
        >
          <div slot="right">
            <NToggle bind:value={tracker.one_tap} />
          </div>
        </ListItem>
      </List>
    {/if}

    {#if tracker.type === 'range'}
      <List solo>
        <NInput
          listItem
          className="tracker-step mb-3"
          inputmode="decimal"
          label={Lang.t('tracker.step', 'Range Step')}
          placeholder={Lang.t('tracker.step', 'Range Step')}
          bind:value={tracker.step}
        />
      </List>
    {/if}

    <!-- Advanced -->

    <!-- End Advanced -->
  {/if}
  <List solo>
    <!-- {#if tracker.type !== 'note' && tracker.type !== 'picker' && advanced}
          <ListItem className="px-4 pt-3" title="Ignore Zeros" description="Ignore zero values when averaging">
            <div slot="right">
              <NToggle bind:value={tracker.ignore_zeros} />
            </div>
          </ListItem>
        {/if} -->

    {#if advanced && ['note', 'picker'].indexOf(tracker.type) === -1 && tracker.type != 'habit'}
      <NInput
        listItem
        className="tracker-default mb-3 error"
        inputmode="decimal"
        label={Lang.t('tracker.value', 'Default Value')}
        placeholder={Lang.t('tracker.default-value', 'Default Value')}
        value={defaultText}
        on:input={(evt) => onDefaultInput(evt.detail)}
      >
        <div slot="right" class="flex items-center">
          {#if tracker.default}
            <Text size="xs" className="text-right text-primary-500 mr-1">
              {tracker.displayValue(tracker.default)}
            </Text>
          {/if}
          <Button icon on:click={() => nudge('default', -1)}>
            <IonIcon icon={RemoveOutline} className="text-gray-500" />
          </Button>
          <Button className="pr-1" icon on:click={() => nudge('default', 1)}>
            <IonIcon icon={AddOutline} className="text-gray-500" />
          </Button>
        </div>
      </NInput>
    {/if}
    {#if advanced && tracker.type === 'habit'}
    <NInput
    listItem
    type="select"
    className="tracker-math mb-3"
    name="default habit"
    placeholder="Choose Default Habit Result"
    bind:value={tracker.default}
  >
    {#each [{ value: 1, label: tracker.habitChoice[0]}, { value: -1, label: tracker.habitChoice[1]}] as habit_key}
      <option value={habit_key.value}>{habit_key.label}</option>
    {/each}
  </NInput>
    {/if}
  </List>

  {#if advanced}
    <List solo>
      <PositivityEditor {tracker} />
    </List>
  {/if}

  <!-- Also Include
  This is how you can include additional data each time you track with this trackable  -->

  {#if tracker.type !== 'note' && tracker.type !== 'picker' && advanced}
    <section class="also-include">
      <List solo>
        <ListItem bg="transparent" id="hide-all-board" title={Lang.t('tracker.also-include', 'Also Include')}>
          <NToggle slot="right" bind:value={alsoInclude} />
        </ListItem>
        {#if alsoInclude}
          <Divider left={16} />
          <NInput
            listItem
            className="tracker-include"
            type="textarea"
            rows={2}
            label={Lang.t('tracker.include', 'Also Include')}
            placeholder={Lang.t(
              'tracker.include-placeholder',
              'Insert additional #trackers, @people, ^pointers and +context when using this tracker'
            )}
            bind:value={tracker.include}
          />
          <AutoComplete
            input={tracker.include}
            scroller
            on:select={async (evt) => {
              tracker.include = evt.detail.note + ''
            }}
          />
        {/if}
      </List>

      <p class="list-note">
        Automatically include other trackers, people, and data. For example, you could include <code
          >{`#alcohol({value}*0.5)`}</code
        >
        in a Beer Tracker. Then when you track your beer drinking, the percentage of alchol with also be tracked.
        <!-- Automatically include other trackers, people and data when using this tracker. For example, including <code
              class="text-semibold text-black dark:text-white">{`#alcohol({value}*0.5)`}</code
            > in a Beer tracker will also track the percentage of the ciders value, as the value of alcohol. -->
      </p>
    </section>

    <section aria-label="Mind, Body, Spirit selection">
      <List className="" solo>
        <div class="grid p-2 grid-cols-3 gap-2">
          {#each focusTypes as focus}
            <button
              type="button"
              on:click={() => {
                let foundIndex = focusList.indexOf(focus.id)
                if (foundIndex > -1) {
                  focusList = focusList.filter((f) => f !== focus.id)
                } else {
                  focusList = [...focusList, focus.id]
                }
                tracker.focus = focusList
                updateTrigger++
              }}
              class=" flex text-center justify-center py-1 px-2 rounded-md items-center {focusList.indexOf(
                focus.id
              ) > -1
                ? 'ring-2 ring-primary-500 dark:text-white font-bold'
                : 'dark:text-gray-300'}"
            >
              <span class="mr-3 -ml-1">{focus.emoji}</span>
              <span class="text-sm">{focus.label}</span>
            </button>
          {/each}
        </div>
      </List>
      <p class="list-note">
        Does this tracker affect your mind, or body, or spirit, or a combination? Select which one, and Nomie will keep
        track.
      </p>
    </section>
  {/if}

  <!-- {#if advanced}
    <section>
      <List solo>
        <ListItem bg="transparent" id="hide-all-board" title={Lang.t('tracker.hide-on-all-board', 'Hide on All Board')}>
          <div slot="right">
            <NToggle bind:value={tracker.hidden} />
          </div>
        </ListItem>
        <p class="list-note" slot="bottom">Exclude this tracker from showing up on the 'All Board'</p>
      </List>
    </section>
  {/if} -->
  </main>
{/key}
