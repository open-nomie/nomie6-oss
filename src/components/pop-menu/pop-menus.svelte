<script lang="ts">
  import KeyDown from '../../modules/keyDown/keyDown.svelte'
  import { Device } from '../../store/device-store'

  import Backdrop from '../backdrop/backdrop.svelte'

  import PopMenu2 from './pop-menu2.svelte'
  import { closePopMenu, PopMenuStore } from './usePopmenu'

  let visible = false
  $: if ($PopMenuStore.length) {
    setTimeout(() => {
      visible = true
    }, 10)
  } else {
    visible = false
  }

  const closeNext = () => {
    closePopMenu($PopMenuStore[$PopMenuStore.length - 1])
  }
</script>

<Backdrop
  on:closed={() => {
    closePopMenu($PopMenuStore[$PopMenuStore.length - 1])
  }}
  position={$Device.width < 500 ? 'bottom' : undefined}
  id="pop-menus"
  {visible}
  tappable
  className="pop-menus z-50"
>
  {#each $PopMenuStore as menu}
    <PopMenu2 {menu} on:click={() => closeNext()} on:close={() => closeNext()} />
  {/each}

  <KeyDown
    on:Escape={() => {
      closeNext()
    }}
  />
</Backdrop>
