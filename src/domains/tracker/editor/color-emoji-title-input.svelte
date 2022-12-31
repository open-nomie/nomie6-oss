<script lang="ts">
  import { Interact } from '../../../store/interact'
  import { Lang } from '../../../store/lang'
  import type { ITracker } from 'modules/tracker/TrackerClass'
  import { onMount, createEventDispatcher } from 'svelte'
  import NInput from '../../../components/input/input.svelte'

  import Avatar from '../../../components/avatar/avatar.svelte'
  import TrackerClass from '../../../modules/tracker/TrackerClass'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import { PencilOutline } from '../../../components/icon/nicons'
  import { strToTagSafe } from '../../trackable/trackable-utils'

  export let tracker: ITracker | any
  export let className: string = ''

  const dispatch = createEventDispatcher()

  let isDirty: boolean = false
  let localTracker: TrackerClass

  const getFreshTracker = () => {
    return new TrackerClass(tracker)
  }

  $: if (
    ((tracker?.emoji || '').length && localTracker?.emoji !== tracker.emoji) ||
    ((tracker?.avatar || '').length && localTracker?.avatar !== tracker.avatar)
  ) {
    localTracker = getFreshTracker()
  }

  $: if ((tracker?.color || '').length && localTracker?.color !== tracker.color) {
    localTracker = getFreshTracker()
  }

  onMount(() => {
    localTracker = getFreshTracker()
    isDirty = localTracker.tag?.length === 0
    setTimeout(() => {
      document.getElementById('trackable-label-input').focus()
    }, 10)
  })

  const labelChanged = (evt: any) => {
    const input = evt.detail.target
    if (input) localTracker.label = input.value
    if (isDirty && input) {
      let tag = strToTagSafe(input.value)
      localTracker.tag = tag
    }
    dispatch('label', localTracker.label)
  }

  const editTag = async () => {
    let tag: any = await Interact.prompt(
      `${Lang.t('general.notice', 'Notice')}`,
      `${Lang.t(
        'tracker.tag-no-change-message',
        'Once a tracker is saved, its tag can no longer be changed (easily). Make sure you like it!'
      )}`,
      {
        value: localTracker.tag,
      }
    )
    if (tag) {
      // tagHardcoded = true
      localTracker.tag = tag
    }
  }
</script>

{#if localTracker}
  <div class="flex items-center w-full px-2 py-1 {className}">
    <button
      style="background-color:{localTracker.color};"
      class="p-1 rounded-2xl"
      on:click={() => {
        dispatch('selectEmoji')
      }}
    >
      {#key localTracker.avatar}
        <Avatar size={50} className="rounded-2xl" src={localTracker.avatar} emoji={localTracker.emoji || '?'} />
      {/key}
    </button>
    <div class="relative w-full flex-grow flex-shink">
      <NInput
        id="trackable-label-input"
        listItem
        className="z-10"
        type="text"
        name="label"
        solo
        placeholder={Lang.t('tracker.label', 'Tracker Label')}
        value={localTracker.label}
        on:keyup={(evt) => {
          labelChanged(evt)
        }}
      />
      {#if localTracker.tag}
        <button
          on:click={editTag}
          class="absolute right-0 z-20 flex items-center justify-start w-auto h-6 px-2 py-1 space-x-2 text-xs font-semibold text-black bg-gray-100 bg-opacity-50 rounded-lg dark:bg-black top-1 dark:text-white dark:bg-opacity-50"
        >
          <span>#{localTracker.tag}</span>
          {#if isDirty}
            <IonIcon icon={PencilOutline} size={14} />
          {/if}
        </button>
      {/if}
    </div>
  </div>
{/if}

<style global lang="postcss">
  #trackable-label-input {
    @apply shadow-lg;
    @apply rounded-md;
  }
</style>
