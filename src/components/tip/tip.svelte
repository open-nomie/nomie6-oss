<script lang="ts">
  import Storage from '../../domains/storage/storage'

  import nid from '../../modules/nid/nid'
  import Button from '../button/button.svelte'

  import tips from '../../config/tips'
  import IonIcon from '../icon/ion-icon.svelte'
  import { ChevronBackOutline, ChevronForwardOutline } from '../icon/nicons'

  export let className = ''

  let hiddenTips = Storage.local.get('hidden-tips') || []

  let id = null
  let show = false

  const state = {
    activeTip: 0,
  }

  $: if (tips) {
    id = nid(JSON.stringify(tips))
    show = hiddenTips.indexOf(id) == -1
  } else {
    show = false
  }

  async function hideTips() {
    hiddenTips.push(id)
    Storage.local.put('hidden-tips', hiddenTips)
    show = false
  }

  function nextTip() {
    if (state.activeTip == tips.length - 1) {
      state.activeTip = 0
    } else {
      state.activeTip++
    }
  }
  function previousTip() {
    if (state.activeTip == 0) {
      state.activeTip = tips.length - 1
    } else {
      state.activeTip--
    }
  }
</script>

{#if show}
  <section
    class="n-tip-wrapper mt-10 dark:text-white text-gray-600 px-4 {className}
    relative"
  >
    <Button className="px-2 opacity-60" title="PrviousTip Tip" color="clear" icon on:click={previousTip}>
      <IonIcon icon={ChevronBackOutline} size={32} className="text-gray-500" />
    </Button>
    <div class="p-2 mx-auto rounded-md n-tips bg-solid" style="max-width:280px;">
      <div class="flex px-4 mb-2">
        <div class="text-base leading-tight tip filler">
          <strong>Tip #{state.activeTip + 1}</strong>
          {tips[state.activeTip]}
        </div>
      </div>

      <nav class="flex items-center justify-center px-2" aria-label="Navigate the Nomie tips">
        <Button confirm size="sm" title="Hide Tips" primary clear on:click={hideTips}>Hide Tips</Button>
      </nav>
    </div>
    <Button className="px-2 opacity-60" title="Next Tip" color="clear" icon on:click={nextTip}>
      <IonIcon icon={ChevronForwardOutline} size={32} className="text-gray-500" />
    </Button>
  </section>
{/if}

<style lang="postcss">
  .n-tip-wrapper {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
  }
  .btn-close {
    position: relative;
    top: auto;
    bottom: auto;
    left: auto;
    right: auto;
    width: 14px;
    height: 14px;
    background-color: transparent;
    box-shadow: none;
  }
  .n-tips {
    margin: 16px;
    width: 100%;
    max-width: 400px;
    padding: 16px 0;
    flex-grow: 1;
    position: relative;
    border-radius: 6px;
  }
  .n-tips .tip {
    text-align: center;
    @apply text-sm;
  }
</style>
