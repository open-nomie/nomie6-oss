<svelte:options runes={true} />

<script lang="ts">
  import { slide, fade } from 'svelte/transition'
  import { AwardStore } from '../../domains/awards/AwardsStore'
  import { getAwardById } from '../../domains/awards/helpers/usage-awards'
  import { Interact } from '../../store/interact'
  import Avatar from '../avatar/avatar.svelte'
  import IonIcon from '../icon/ion-icon.svelte'
  import './n-menu.css'

  import type { PopMenuButton } from '../pop-menu/usePopmenu'
  import MenuBlocker from './menu-blocker.svelte'
  import CheckmarkCircle from '../../n-icons/CheckmarkCircle.svelte'
import Divider from '../divider/divider.svelte'

  const { x, y, buttonClass, buttonStyle, id, title, compact, menuButtons } = $props()

  let accessorySize = $derived(compact ? 18 : 24)
  let open = $state(false)
  let activeIndex = $state(-1)
</script>

<div {id} class="id-{id} {compact ? 'compact' : ''} relative menu-inline">
  <button
    title={title}
    id="{id}-button"
    style={buttonStyle}
    class="{buttonClass} flex items-center justify-center {open ? 'isOpen' : ''}"
    on:click={() => (open = !open)}
  >
    <slot />
  </button>

  {#if open}
    <MenuBlocker on:click={() => (open = false)} />
    <div
      class="n-menu glass translate-all duration-200 isOpen y-{y} x-{x} z-50 absolute w-60 shadow-2xl"
      transition:fade={{ duration: 200 }}
    >
      {#each menuButtons as button, index}
        {#if button.divider}
          <div class="h-2 -mt-px bg-gray-200 dark:bg-gray-800"></div>
        {/if}
        <div
          class="menu-item {id}-{index} {button.disabled ? 'disabled' : ''}"
          on:click={async () => {
            if (button.disabled) {
              // do nothing
            } else if (button.awardRequired && !$AwardStore.awards.find((a) => a.id == button.awardRequired)) {
              Interact.alert(
                `You need the ${getAwardById(button.awardRequired).name} Award before you can use this feature`
              )
            } else {
              button.click()
              open = false
            }
          }}
          on:mouseenter={() => (activeIndex = index)}
          on:mouseleave={() => (activeIndex = -1)}
          role="menuitem"
        >
          {#if button.component}
            <svelte:component closeEvent={()=>{
              button.click()
              open = false
            }} this={button.component} />
          {:else}
          <button
            disabled={button.disabled}
            class="pop-button {activeIndex === index ? 'focused' : ''} nbtn-left pop-button-{index} {button.awardRequired
              ? $AwardStore.awards.find((a) => a.id == button.awardRequired)
                ? 'unlocked'
                : 'locked'
              : ''} {button.description ? 'nbtn-desc' : ''}"
          >
            {#if button.checked}
              <div class="w-5 flex items-center">
                <IonIcon size={compact ? 20 : 28} className="text-black dark:text-white" icon={CheckmarkCircle} />
              </div>
            {/if}
            <main class="flex-fill w-full">
              <h1
                class="{button.title.length > 25
                  ? 'text-sm'
                  : 'text-lg'} leading-tight line-clamp-1 text-black font-medium dark:text-white"
              >
                {button.title}
              </h1>
              {#if button.description}
                <p class="text-sm text-gray-500 leading-snug">{button.description}</p>
              {/if}
            </main>
            <div class="flex items-center">
              {#if button.icon}
                <IonIcon icon={button.icon} className="text-black dark:text-white" size={accessorySize} />
              {:else if button.emoji}
                <Avatar emoji={button.emoji} size={compact ? 22 : 32} />
              {/if}
            </div>
          </button>
          {/if}
        </div>
        {#if index < menuButtons.length - 1}
        <Divider left={16} />
        {/if}

      {/each}
    </div>
  {/if}
</div>

<style global lang="postcss">
  .menu-inline {
    @apply flex items-center;
    @apply z-50;
  }
  .menu-inline .n-menu:focus {
    @apply ring-2 ring-gray-500 ring-opacity-20;
    @apply outline-none;
  }
  .menu-inline .n-menu {
    max-height: 445px;
  }
  .menu-inline .n-menu.isOpen {
    @apply bg-white dark:bg-black;
    @apply ring-2 ring-black dark:ring-gray-800 ring-opacity-0;
    /* max-height: calc(100vh-90px); */
  }
  .menu-inline .n-menu.isClosed {
  }
  .menu-inline .n-menu.x-right {
    @apply right-4;
  }

  .menu-inline .n-menu.y-top {
    top: auto;
    bottom: calc(100% + 8px);
  }
  .menu-inline .n-menu.y-bottom {
    bottom: auto;
    top: calc(100% + 8px);
  }
  .menu-inline .menu-icon-button {
    @apply rounded-full flex items-center justify-center;
    @apply h-9 w-9;

    @apply overflow-hidden;
  }
  .menu-inline button[disabled] {
    @apply opacity-20;
  }
  .menu-inline .menu-icon-button.isOpen {
    @apply text-white bg-primary-500 bg-opacity-30;
  }
  .menu-inline .n-menu .pop-button.focused {
    @apply bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-20;
    @apply ring-0;
  }
  .menu-inline .n-menu .pop-button {
    @apply overflow-hidden;
    @apply rounded-none;
    @apply border-b border-gray-500 dark:border-gray-700
  }
  .menu-inline.compact .n-menu .pop-button,
  .menu-inline.compact .n-menu .pop-button h1 {
    font-size:0.9rem !important;
  }
  .menu-inline .n-menu .pop-button:hover {
    @apply bg-black dark:bg-white bg-opacity-10 dark:bg-opacity-20;
  }
  .menu-inline .n-menu .menu-item:first-child .pop-button {
    @apply rounded-t-2xl;
  }
  .menu-inline button {
    @apply w-full;
  }

  .n-menu .menu-item .pop-button.locked::after {
    content: 'Locked';
    @apply absolute right-2;
    @apply bg-red-500 bg-opacity-80;
    @apply flex items-center justify-center;
    @apply text-xs font-bold text-white;
    @apply rounded-full;
    @apply py-1 px-2;
  }

  .menu-inline .n-menu .menu-item:last-child .pop-button {
    @apply rounded-b-2xl;
  }
</style>
