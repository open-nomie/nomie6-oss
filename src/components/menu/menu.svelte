<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  
  import { AwardStore } from '../../domains/awards/AwardsStore'
  import CheckmarkCircle from '../../n-icons/CheckmarkCircle.svelte'
  import { wait } from '../../utils/tick/tick'
  import Avatar from '../avatar/avatar.svelte'

  import IonIcon from '../icon/ion-icon.svelte'
  import type { PopMenuButton } from '../pop-menu/usePopmenu'
  import './n-menu.css'

  type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

  export let buttons: Array<PopMenuButton> = []
  export let size: Sizes = 'lg'
  export let className: string = ''
  export let style: string = ''
  export let id: string = ''

  const dispatch = createEventDispatcher()
  let buttonGroup: Array<Array<PopMenuButton>> = []
  let accessorySize: number = 24

  $: if (buttons) {
    buttonGroup = [[]]
    let current: number = buttonGroup.length - 1
    buttons.forEach((button: PopMenuButton) => {
      if (button.divider) {
        buttonGroup.push([])
        current = buttonGroup.length - 1
      }
      buttonGroup[current].push(button)
    })
  }

  $: if (size) {
    if (size == 'xs') {
      accessorySize = 14
    } else if (size == 'sm') {
      accessorySize = 18
    } else if (size == 'md') {
      accessorySize = 22
    } else if (size == 'lg') {
      accessorySize = 26
    } else if (size == 'xl') {
      accessorySize = 32
    }
  }
</script>

<div role="menu" {id} class="n-menu size-{size} {className}" {style}>
  {#each buttons as button, index (index)}
    <button
      role="menuitem"
      data-award-required={button.awardRequired}
      aria-label={button.title}
      disabled={button.disabled}
      class="pop-button  {button.checked
        ? 'active'
        : ''} bg-white dark:bg-black bg-opacity-80 dark:bg-opacity-80 nbtn-left pop-button-{index} {button.awardRequired
        ? $AwardStore.awards.find((a) => a.id == button.awardRequired)
          ? 'unlocked'
          : 'locked'
        : ''}
            {button.description ? 'nbtn-desc' : ''}"
      on:click={async () => {
        await wait(200)
        button.click()
        dispatch('click', button)
      }}
    >
      {#if button.checked}
        <div>
          <IonIcon className="text-gray-800 dark:text-gray-200" icon={CheckmarkCircle} />
        </div>
      {/if}
      <main class="flex-fill w-full transition-all">
        <h1
          class="{button.title.length > 25 || size == 'sm'
            ? 'text-sm'
            : 'text-lg'} leading-tight title"
        >
          {button.title}
        </h1>
        {#if button.description}
          <p class="{size == 'sm' ? 'text-xs' : 'text-sm'} description">{button.description}</p>
        {/if}
      </main>
      <div class="flex items-center">
        {#if button.icon}
          <IonIcon icon={button.icon} className="text-black dark:text-white" size={accessorySize} />
        {:else if button.emoji}
          <Avatar emoji={button.emoji} size={32} />
        {/if}
      </div>
    </button>
  {/each}
</div>

<style global lang="postcss">
  .n-menu > button:first-child {
    @apply rounded-t-2xl;
  }
  .n-menu > button:last-child {
    @apply rounded-b-2xl;
  }
</style>
