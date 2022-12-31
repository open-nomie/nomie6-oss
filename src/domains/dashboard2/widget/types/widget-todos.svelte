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
  export let logs:Array<NLog> = [];
  // export let trackable: Trackable
  // export let usage: TrackableUsage

  let activeIndex: number = -1
  let dateFormats = getDateFormats()

  let todoLogs:Array<NLog> = []

  $: if (todoLogs.length > 0) {
    activeIndex = 0
  }

  const previousNote = () => {
    if (activeIndex == 0) {
      activeIndex = todoLogs.length - 1
    } else {
      activeIndex = activeIndex - 1
    }
  }

  const nextNote = () => {
    if (activeIndex >= todoLogs.length - 1) {
      activeIndex = 0
    } else {
      activeIndex = activeIndex + 1
    }
  }

  $: {
    todoLogs = logs.filter((l)=>{
      return l.hasTodo
    })
  }
</script>

{#if !todoLogs || !todoLogs.length}
  <div class="text-center px-4 -mt-2 empty value flex items-center justify-center text-gray-500 h-full text-xs">
    {Lang.t('general.no-todos-found', 'No todos found.')}
    <br />Include [] or [x] to turn an entry into a todo
  </div>
{:else}
  <div class="note-navigator flex items-start px-2 sm:px-0 h-full space-x-1">
    {#if todoLogs.length > 1}
      <Button title="Previous Note" className="tap-icon" icon on:click={previousNote}>
        <IonIcon icon={ChevronBackCircleOutline} />
      </Button>
    {/if}
    {#if activeIndex > -1}
      <div
        class="note-wrapper pb-4 px-2 lg:px-4 pt-2 flex flex-col h-full w-full max-h-full "
        style="font-size:12px;"
      >
        <div class="text-xs overflow-y-auto max-h-36">
          <NoteTextualizer
            on:noteChange={(evt)=>{
              onLogNoteChange(evt.detail, todoLogs[activeIndex]);
            }}
            className="{widget.size === 'sm' ? 'text-xs' : 'text-sm'} leading-1"
            note={todoLogs[activeIndex].note}
          />
        </div>
        <div class="leading-tight text-xs line-clamp-2 w-full mt-2 text-gray-500">
          {todoLogs[activeIndex].endDayjs().format(`${dateFormats.date}`)}
          - {todoLogs[activeIndex].endDayjs().fromNow()}
        </div>
      </div>
    {/if}
    {#if todoLogs.length > 1}
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
