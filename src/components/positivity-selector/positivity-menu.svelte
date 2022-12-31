<script lang="ts">
  import { getEmojiFromScore } from '../../utils/positivity/positivity'

  import Button from '../button/button.svelte'
  import PositivitySelector from './positivity-selector.svelte'
  import IonIcon from '../icon/ion-icon.svelte'
  import { CloseOutline } from '../icon/nicons'
  export let score = 0
  export let closeBackgroundTap: boolean = false
  export let className = ''
  export let size = 'lg'
  export let y = '60%'
  export let direction: 'horizontal' | 'vertical' = 'horizontal'

  let selected: any
  let showMenu: boolean = false
  $: selected = getEmojiFromScore(score)
  let triggerButton

  let id: string = `ps-${Math.random()}`

  let x: number
  // let y: string = `60%`

  function toggle(evt?) {
    y = `${document.getElementById(id).offsetTop}px`

    if (evt && !showMenu) {
      x = evt.detail.pageX - 240
    }
    showMenu = !showMenu
  }
</script>

<div
  class="positivity-menu-pop animate up dir-{direction}"
  style="left:{x}px; top:{y}; z-index:4000"
  class:visible={showMenu}
  class:hidden={!showMenu}
>
  <div class="flex items-center pr-4 rounded-full bg-primary-600">
    <PositivitySelector
      {size}
      {id}
      bind:score
      on:change={() => {
        toggle()
      }}
    />
    <button class="flex items-center flex-shrink-0 w-8 px-2 text-white" on:click={toggle}>
      <IonIcon icon={CloseOutline} />
    </button>
  </div>
</div>

{#if showMenu && closeBackgroundTap}
  <div class="opacity-0 full-screen" on:click={toggle} />
{/if}

<Button
  {id}
  bind:this={triggerButton}
  size="sm"
  shape="round"
  color="transparent"
  className="positivity-emoji-btn {className}"
  on:mouseover={toggle}
  on:click={toggle}
>
  {#if selected && selected.emoji}{selected.emoji}{/if}
</Button>

<style global>
  .positivity-menu-pop {
    position: absolute;
    width: 260px;
    bottom: calc(50px + env(safe-area-inset-bottom));
    z-index: 4000;
  }
  .positivity-emoji-btn {
    margin: 6px;
    text-align: center;
  }
</style>
