<script lang="ts">
import dayjs from 'dayjs';

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
import LetterTicker from '../../components/letter-ticker/letter-ticker.svelte';
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Lang } from '../../store/lang'
import { getDateFormats } from '../preferences/Preferences';
import TimelineLoader from './timeline-loader.svelte';
import type { TimelineFilterProps } from './timeline-utils';

  export let id: string
  export let filters: TimelineFilterProps = {};
  export let startingDate: Date = new Date();
  const dateFormats = getDateFormats();

  let titleDate = dayjs(startingDate || new Date())

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal>
  <ToolbarGrid slot="header" className="bg-white dark:bg-black">
    <Button slot="left" primary clear on:click={close}>
      {Lang.t('general.close', 'Close')}
    </Button>
    <div>
      <LetterTicker className="font-bold ntitle" text={titleDate.fromNow()} />
    </div>
    <!-- <Button slot="right" primary clear on:click={() => openGoalEditor(goal)}>
      {Lang.t('general.Edit', 'Edit')}
    </Button> -->
  </ToolbarGrid>
  <div class="pb-10">
    <TimelineLoader bind:startingDate={startingDate} bind:filters={filters} on:topItem={(evt)=>{
      titleDate = dayjs(evt.detail.time);
    }} />
  </div>
</BackdropModal>
