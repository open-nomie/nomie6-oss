<script lang="ts">
  import { Lang } from '../../../../store/lang'

  import type { TrackableUsage } from '../../../usage/trackable-usage.class'
  // import type { Trackable } from '../../../trackable/Trackable.class'
  import type { WidgetClass } from '../widget-class'
  import NoteTextualizer from '../../../../components/note-textualizer/note-textualizer.svelte'
  import Button from '../../../../components/button/button.svelte'
  import IonIcon from '../../../../components/icon/ion-icon.svelte'
  import { ChevronBackCircleOutline, ChevronForwardCircleOutline } from '../../../../components/icon/nicons'
  import { getDateFormats } from '../../../preferences/Preferences'
import { onLogNoteChange } from '../../../ledger/LedgerStore';
import type NLog from '../../../nomie-log/nomie-log';

  export let widget: WidgetClass
  // export let trackable: Trackable
  export let usage: TrackableUsage

  let activeIndex: number = -1
  let dateFormats = getDateFormats()
  let sortedLogs:Array<NLog> = []
  $: if (usage && usage.logs.length > 0) {
    activeIndex = 0
    sortedLogs = usage.logs.sort((a,b)=>{
      return a.end < b.end ? 1 : -1;
    })
  }

  const previousNote = () => {
    if (activeIndex == 0) {
      activeIndex = sortedLogs.length - 1
    } else {
      activeIndex = activeIndex - 1
    }
  }

  const nextNote = () => {
    if (activeIndex >= sortedLogs.length - 1) {
      activeIndex = 0
    } else {
      activeIndex = activeIndex + 1
    }
  }
</script>

{#if !usage}
  <div class="empty value">
    {Lang.t('general.no-note-found', 'No note found')}
  </div>
{:else}
  <div class="note-navigator flex items-start px-2 sm:px-0 h-full space-x-1">
    {#if sortedLogs.length > 1}
      <Button title="Previous Note" className="tap-icon" icon on:click={previousNote}>
        <IonIcon icon={ChevronBackCircleOutline} />
      </Button>
    {/if}
    {#if activeIndex > -1}
      <div
        class="note-wrapper flex flex-col h-full w-full max-h-full items-center justify-center "
        style="font-size:12px;"
      >
        <div class="text-center overflow-y-auto max-h-36">
          <NoteTextualizer
            on:noteChange={(evt)=>{
              onLogNoteChange(evt.detail, sortedLogs[activeIndex]);
            }}
            className="{widget.size === 'sm' ? 'text-xs' : 'text-sm'} leading-tight"
            note={sortedLogs[activeIndex].note}
          />
        </div>
        <div class="text-center leading-tight text-xs line-clamp-2 w-full mt-2 text-gray-500">
          {sortedLogs[activeIndex].endDayjs().format(`${dateFormats.date}`)}
          - {sortedLogs[activeIndex].endDayjs().fromNow()}
        </div>
      </div>
    {/if}
    {#if sortedLogs.length > 1}
      <Button title="Next note" className="tap-icon" icon on:click={nextNote}>
        <IonIcon icon={ChevronForwardCircleOutline} />
      </Button>
    {/if}
  </div>
{/if}

<style global lang="postcss">
  .widget-note.value {
    max-height: 120px;
    overflow-y: auto;
  }
  .widget-note .n-note-textualized {
    @apply text-lg;
  }
  .widget-note.value {
    @apply text-black dark:text-white;
  }
</style>
