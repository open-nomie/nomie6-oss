<script lang="ts">
  // Svelte
  import { createEventDispatcher } from 'svelte'

  // components

  import NInput from '../../components/input/input.svelte'

  // Modules

  import PositivityCondition from '../../modules/tracker/positivity-condition'

  // Stores

  import { Lang } from '../../store/lang'
  import dayjs from 'dayjs'

  import { Ordinal } from '../../utils/ordinal/ordinal'
  import ListItem from '../../components/list-item/list-item.svelte'

  import Divider from '../../components/divider/divider.svelte'
  import appConfig from '../../config/appConfig'
  import { Prefs } from '../../domains/preferences/Preferences'
  import { saveTrackable, TrackableStore } from '../trackable/TrackableStore'
  import { openScoreEditor } from '../positivity-editor/PositivityEditorStore'
  import type TrackerClass from '../../modules/tracker/TrackerClass'
  import { wait } from '../../utils/tick/tick'
  import { showToast } from '../../components/toast/ToastStore'
  import { PermissionsStore } from '../my-account/PermissionsStore'

  // Prosp
  export let tracker: TrackerClass | undefined = undefined
  export let className = ''

  // consts
  const dispatch = createEventDispatcher()

  // State
  let state = {
    showConditionForm: false,
    genesisCalc: new PositivityCondition({}),
    selectedIndex: -1,
  }

  // const getTrackerInput = async () => {
  //   const response = await Interact.trackerInput(tracker, {
  //     value: state.genesisCalc.v,
  //     allowSave: false,
  //   })
  //   if (response.value) {
  //     state.genesisCalc.v = response.value
  //   }
  // }

  const methods = {
    async change() {
      await wait(10)
      dispatch('trackerChange', tracker)

      if (tracker.score == 'custom' && !tracker.score_calc) {
        openScoreEditor({
          trackable: tracker.toTrackable(),
          show: true,
          onComplete(calc) {
            tracker.score_calc = calc
          },
        })
      }
    },
    newCondition() {
      state.showConditionForm = true
      methods.change()
    },
    getDays() {
      let days = []
      for (let i = 0; i < 31; i++) {
        days.push({
          value: Ordinal(i + 1),
          index: i + 1,
        })
      }
      return days
    },
    getHours() {
      let hours = []
      for (let i = 0; i < 24; i++) {
        let date = dayjs().startOf('day').add(i, 'hour')

        hours.push({
          value: $Prefs.use24hour ? date.format('HH:mm') : date.format('h:mm a'),
          index: i + 1,
        })
      }
      return hours
    },
    saveCondition() {
      tracker.score_calc = tracker.score_calc || []
      //@ts-ignore
      tracker.score_calc.push({ ...state.genesisCalc })
      state.showConditionForm = false
      methods.change()
    },
    async save() {
      let saved = await saveTrackable({
        trackable: tracker.toTrackable(),
        known: $TrackableStore.trackables,
        permissions: $PermissionsStore,
      })
      if (saved) {
        dispatch('save', tracker)
        showToast({ message: Lang.t('general.saved', 'Saved') })
      }
    },
    removeCondition(index) {
      tracker.score_calc = tracker.score_calc.filter((row, ind) => {
        return ind !== index
      })
      methods.change()
    },
  }
</script>

{#if tracker}
  <div class={className}>
    <NInput
      listItem
      type="select"
      bind:value={tracker.score}
      placeholder="Select a Positivity"
      on:input={methods.change}
      label={Lang.t('tracker.positivity', 'Positivity')}
    >
      <div slot="left" class="pt-3 text-black dark:text-white">
        {#if !tracker.score}
          <div class="pl-2">😐 {Lang.t('tracker.neutral', 'Neutral')}</div>
        {/if}
      </div>
      {#each appConfig.positivity as positivity}
        <option value={`${positivity.score}`}>{positivity.emoji} {positivity.label}</option>
      {/each}
      <option value="custom">🛠 {Lang.t('general.customize', ' Custom')}</option>
    </NInput>
    {#if tracker.score === 'custom'}
      <section class="points-editor">
        {#if !state.showConditionForm}
          <Divider center />
          <ListItem
            on:click={() => {
              openScoreEditor({
                show: true,
                trackable: tracker.toTrackable(),
                onComplete(scoreCalc) {
                  tracker.score_calc = scoreCalc
                },
              })
            }}
          >
            <div class="text-center text-primary-500">Edit {tracker.score_calc?.length || ''} Conditions</div>
          </ListItem>
        {/if}
      </section>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .pos-label {
    font-size: 1.2em;
    display: none;
    min-width: 70px;
    text-transform: uppercase;
    text-align: center;
  }
</style>
