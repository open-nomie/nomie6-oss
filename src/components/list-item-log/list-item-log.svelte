<script lang="ts">
  import { getDateFormats } from '../../domains/preferences/Preferences'
  import { getEmojiFromScore, selectPositivity, selectPositivityPopmenu } from '../../utils/positivity/positivity'
  import { getTrackerInputAsString } from '../../domains/tracker/input/TrackerInputStore'
  import { Interact } from '../../store/interact'
  import { objectHash } from '../../modules/object-hash/object-hash'
  import { onLogNoteChange } from '../../domains/ledger/LedgerStore'
  import { openLocationViewer } from '../../domains/map/LocationModalStore'
  import { parseNumber } from '../../utils/parseNumber/parseNumber'
  import { selectTrackable } from '../../domains/trackable/trackable-selector/TrackableSelectorStore'
  import { showTrackablePopmenu } from '../../domains/board/boardActions'
  import { tokenToTrackable } from '../../modules/tokenizer/tokenToTrackable'
  import { TrackableStore } from '../../domains/trackable/TrackableStore'
  import { wait } from '../../utils/tick/tick'
  import IonIcon from '../icon/ion-icon.svelte'
  import MapOutline from '../../n-icons/MapOutline.svelte'
  import More from '../../n-icons/More.svelte'
  import NLog from '../../domains/nomie-log/nomie-log'
  import NoteTextualizer from '../note-textualizer/note-textualizer.svelte'
  import TinyTrackable from '../tiny-trackable/tiny-trackable.svelte'
  import type { Token } from '../../modules/tokenizer/lite'
  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import is from '../../utils/is/is'

  // props
  export let log = undefined
  // export let trackers = {};
  export let fullDate: boolean = false
  export let hideTrackables = false
  export let className = ''

  // consts

  let displayLog: NLog
  // let editMode:boolean = true;

  let lastLog: string | undefined = undefined
  let logElements: Array<{ token: Token; trackable: Trackable; value: number }> = []

  /**
   * Watches for a Log Change
   * If the log changes then do this
   * expensive function, otherwise don't
   * do it!
   */
  $: if (log && objectHash(log) !== lastLog) {
    lastLog = objectHash(log)
    // Setup the display log
    displayLog = new NLog(log)

    // Format the log Elements
    logElements = log.elements
      .filter((t) => t.type !== 'generic')
      .map((token, index) => {
        const trk = tokenToTrackable(token, $TrackableStore.trackables)
        return {
          trackable: trk,
          token,
          value: parseNumber(token.value || trk?.value || 0),
        }
      })
      .filter((le) => le.trackable)
  }

  const changePositivity = async (log: NLog) => {
    const results: any = await selectPositivityPopmenu(log.score)
    if (results && is.truthy(results.score)) {
      log.score = results.score
      console.log({ score: log.score })
      await onLogNoteChange(log.note, log)
    }
  }

  /**
   * Add an Item
   * This will let the user seleect a trackable and add it to the
   * this note
   */
  const addItem = async () => {
    const trackable = await selectTrackable()
    let inputResults: string
    await wait(100)
    if (trackable && trackable.type == 'tracker') {
      const res = await getTrackerInputAsString({
        allowSave: false,
        expandNote: true,
        trackables: $TrackableStore.trackables,
        tracker: trackable.tracker,
        nextLabel: 'Add',
      })

      if (res?.raw) {
        inputResults = res.raw
      }
    } else if (trackable.type == 'person') {
      inputResults = trackable.tag
    } else if (trackable.type == 'context') {
      inputResults = trackable.tag
    }
    if (inputResults) {
      let newNote = `${displayLog.note} ${inputResults}`
      displayLog = await onLogNoteChange(newNote, displayLog)
    }
  }

  let dateFormats = getDateFormats()
</script>

{#if displayLog}
  <div id="log-{displayLog._id}" class:pinned={displayLog.pinned} class="note-bubble space-y-2 bubble {className}">
    <div class="flex items-center justify-between text-xs  space-x-3 -mt-2">
      <button on:click={() => changePositivity(log)} class="text-base text-gray-600 dark:text-gray-400"
        >{getEmojiFromScore(log.score).emoji}</button
      >
      <div class="text-gray-500 stiff line-clamp-1">
        {#if fullDate}
          {log.endDayjs().format(`${dateFormats.date} ${dateFormats.time}`)}
        {:else}
          {log.endDayjs().format(dateFormats.time)}
          <span class="pl-2 text-gray-300 dark:text-gray-700">{log.endDayjs().fromNow()}</span>
        {/if}
      </div>
      <div class="text-right flex items-center  filler text-gray-500">
        <button
          aria-label="View Location"
          on:click={() => {
            return openLocationViewer([log.geoType], [log])
          }}
          class="w-full text-right flex items-center justify-end"
        >
          {#if log.location}
            <div class="line-clamp-1 text-green-500">{log.location}</div>
          {:else if log.lng}
            <IonIcon icon={MapOutline} className="text-green-500" size={16} />
          {/if}
        </button>
      </div>
      <button
        type="button"
        style="margin-right:-10px"
        class="text-gray-800  dark:text-white h-7 w-7 rounded-full  flex items-center justify-center"
        on:click={() => {
          Interact.logOptions(log, {
            description: log.note,
          })
        }}><IonIcon size={22} icon={More} /></button
      >
    </div>

    {#if log.hasNote}
      <p class="text-base leading-5">
        <NoteTextualizer
          note={log.note}
          on:noteChange={(evt) => {
            onLogNoteChange(evt.detail, log)
          }}
          className=" dark:text-gray-300 text-gray-700 leading-snug"
          on:textClick={(evt) => {
            const trackable = tokenToTrackable(evt.detail, $TrackableStore.trackables)
            showTrackablePopmenu(trackable)
          }}
        />
      </p>
    {/if}

    {#if !hideTrackables}
      <div class="trackables -px-1 w-full flex flex-wrap">
        {#each logElements as logElement, index (`${logElement.trackable.tag}-${index}`)}
          <TinyTrackable
            trackable={logElement.trackable}
            value={logElement.value}
            date={log.end}
            on:click={() => {
              showTrackablePopmenu(logElement.trackable, { date: log.endDayjs() })
            }}
          />
        {/each}
        <button on:click={() => addItem()} class="tiny-trackable bg-transparent">
          <span class="value w-5">+</span>
        </button>
      </div>
    {/if}
    <slot name="item-footer" />
  </div>
{/if}

<style global lang="postcss">
  .note-bubble.pinned {
    @apply ring ring-primary-500;
  }
  .note-bubble {
    @apply bg-white dark:bg-gray-950;
    @apply rounded-xl;
    @apply shadow-sm;
    @apply p-4;
    @apply font-medium;
  }
</style>
