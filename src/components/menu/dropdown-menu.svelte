<script lang="ts">
  // import { createEventDispatcher } from "svelte";

  import Menu from './menu.svelte'

  import { DropdownMenuStore } from './dropdown-menu.store'

  import { getElementPositionMap } from '../../utils/dom/dom-utils'
  import { wait } from '../../utils/tick/tick'
  // import { App } from "../../app.store";

  let caller: Element
  let top: number | undefined = undefined
  let bottom: number | undefined = undefined
  let left: number
  let right: number

  let showMenu: boolean = false
  let showMenuFull: boolean = false

  $: caller = $DropdownMenuStore.caller

  $: if ($DropdownMenuStore.visible) {
    left = undefined
    right = undefined
    setTimeout(() => {
      main()
    }, 10)
  }

  async function main() {
    showMenu = false
    if (caller) {
      const callerPosition = getElementPositionMap(caller)
      let menuWidth = 250
      showMenu = true

      let menuPosition = getElementPositionMap(document.getElementById('dropdown-store-menu'))

      if (menuPosition && callerPosition) {
        top = Math.abs(callerPosition.y + callerPosition.height) + 10
        left = Math.abs(callerPosition.x)

        await wait(40)
        // Check again now that it's shown
        // menuPosition = getElementPositionMap(document.getElementById('dropdown-store-menu'))

        if (top + (menuPosition.height || 200) > window.innerHeight) {
          // top = window.innerHeight - (menuPosition.height + callerPosition.height)
          top = undefined
          bottom = 10
        }

        if (left + menuWidth > window.innerWidth) {
          right = 10
        } else if (left < 0) {
          left = 10
        }

        showMenuFull = true
      }
    }
  }

  const closeMenu = async () => {
    showMenu = false
    showMenuFull = false
    await wait(200)
    DropdownMenuStore.close()
  }
</script>

{#if $DropdownMenuStore.visible}
  <div
    class="drop-menu-background cursor-pointer "
    id="drop-menu"
    on:click|self={() => {
      wait(200).then(() => {
        closeMenu()
      })
      // App.allowScroll();
    }}
  >
    <Menu
      id="dropdown-store-menu"
      className="dropmenu shadow-2xl rounded-xl {showMenu ? 'open' : 'closed'} {showMenuFull
        ? 'opacity-100'
        : 'opacity-0'}"
      style="{top ? `top:${top}px` : `bottom:${bottom}px`}; {right ? `right:${right}px;` : `left:${left}px;`}"
      size="md"
      buttons={$DropdownMenuStore.buttons}
      on:click={() => {
        closeMenu()
        // App.allowScroll();
      }}
    />
  </div>
{/if}

<style global lang="postcss">
  .drop-menu-background {
    z-index: 6000 !important;
  }
  .dropdown-menu {
    @apply z-50;
  }
  .dropmenu {
    @apply fixed;
    @apply shadow-2xl;

    width: 250px;
    @apply rounded-xl;
  }

  .dropmenu .n-menu-group:first-child {
    @apply rounded-t-xl;
  }
  .dropmenu .n-menu-group:last-child {
    @apply rounded-b-xl;
  }
  .dropmenu .n-menu-group {
    @apply rounded-none;
    @apply bg-transparent;
  }

  .drop-menu-background {
    @apply fixed top-0 bottom-0 left-0 right-0;
    @apply bg-gray-300 bg-opacity-10 z-50;
  }

  .dropmenu {
    @apply transition-all transform duration-75;
  }
  .dropmenu.closed {
    @apply scale-0 -translate-y-20;
  }
  .dropmenu.open {
    @apply scale-100  translate-y-0;
  }
</style>
