<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import CheckmarkCircle from '../../n-icons/CheckmarkCircle.svelte'
  import Avatar from '../avatar/avatar.svelte'

  import { fly } from 'svelte/transition'
  import Button from '../button/button.svelte'

  import IonIcon from '../icon/ion-icon.svelte'

  import List from '../list/list.svelte'

  import type { PopMenuButton } from './usePopmenu'
  import { wait } from '../../utils/tick/tick'
  import { AwardStore } from '../../domains/awards/AwardsStore'
  import { Interact } from '../../store/interact'
  import { getAwardById } from '../../domains/awards/helpers/usage-awards'

  export let buttons: Array<PopMenuButton> = []
  export let listType: 'grid' | 'list' = 'list'

  let dispatch = createEventDispatcher()

  let buttonGroup: Array<Array<PopMenuButton>> = []

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
</script>

{#each buttonGroup as group, gIndex}
  <List className="rounded-xl pop-buttons  {listType == 'grid' ? 'list-grid' : ''} overflow-y-auto">
    {#each group as button, index}
      {#if button.title}
        <Button
          role="menuitem"
          id={`${button.id || `button-id-${index}`}`}
          size="lg"
          ariaLabel={button.title}
          disabled={button.disabled}
          on:click={async (evt) => {
            if (button.disabled) {
              // do nothing
            } else if (button.awardRequired && !$AwardStore.awards.find((a) => a.id == button.awardRequired)) {
              Interact.alert(
                `You need the ${getAwardById(button.awardRequired).name} Award before you can use this feature`
              )
            } else {
              await wait(200)
              button.click()
              dispatch('clicked', evt)
              if (!button.skipClosing) {
                dispatch('close')
              }
            }
          }}
          mainClass="flex items-center space-between"
          className="pm2-button h-auto flex items-center {button.awardRequired
            ? $AwardStore.awards.find((a) => a.id == button.awardRequired)
              ? 'unlocked'
              : 'locked'
            : ''}"
        >
          <div slot="left" class="text-gray-500">
            {#if button.checked}
              <div in:fly|global={{ y: 50 }} class="mr-4">
                <IonIcon className="text-gray-800 dark:text-gray-200" icon={CheckmarkCircle} />
              </div>
            {/if}
          </div>
          <div class="w-full pr-4">
            <div class="title">
              {button.title}
            </div>
            {#if button.description}
              <div class="text-sm text-gray-500 leading-tight font-base text-left pr-4 mt-1" aria-label="Description">
                <p class="line-clamp-3 leading-tight">{button.description}</p>
              </div>
            {/if}
          </div>

          <div slot="right" class="flex items-center">
            {#if button.icon}
              <IonIcon icon={button.icon} className="text-gray-500" />
            {:else if button.emoji}
              <Avatar emoji={button.emoji} size={42} />
            {/if}
          </div>
          {#if button.right}
            <div class="right-text">{button.right}</div>
          {/if}
        </Button>
      {/if}
    {/each}
  </List>
{/each}

<style lang="postcss" global>
  .pm2-button {
    @apply w-full;
    @apply text-left;
    @apply h-auto;
    min-height: 2.6rem;
    @apply py-3;
    @apply rounded-none;
  }
  .pm2-button .button-main {
    @apply flex-col;
    @apply w-full;
  }
  .pm2-button .right-text {
    @apply absolute right-5;
    @apply font-semibold;
    @apply text-gray-500;
    @apply bg-gray-500 rounded-md;
    min-width: 28px;
    @apply py-1;
    @apply text-center;
    @apply bg-opacity-20;
    @apply -mr-2;
  }
  .pm2-button .title {
    @apply text-black text-base leading-tight dark:text-white font-medium line-clamp-1 block w-full;
    @apply text-left;
    @apply text-lg;
  }

  .pm2-button.locked::after {
    content: 'Locked';
    @apply absolute right-2;
    @apply bg-red-500 bg-opacity-80;
    @apply flex items-center justify-center;
    @apply text-xs font-bold text-white;
    @apply rounded-full;
    @apply py-1 px-2;
  }
  .n-list.pop-buttons {
  }
  .n-list.pop-buttons .nbtn {
    @apply shadow-none;
    @apply rounded-none;
    @apply z-10;
    @apply transition-all transform duration-200 ease-in-out;
    border-bottom: solid 1px rgba(155, 155, 155, 0.3);
    @apply bg-white dark:bg-black;
    @apply text-left;
  }
  .n-list.pop-buttons .nbtn:focus {
    @apply ring-4 ring-primary-500 ring-inset;
  }
  .n-list.pop-buttons .nbtn:first-child {
    @apply rounded-t-2xl;
  }
  .n-list.pop-buttons .nbtn:last-child {
    @apply rounded-b-2xl;
    @apply border-none;
  }

  .pop-buttons.list-grid {
    @apply grid grid-cols-2 gap-px;
  }
  .pop-buttons.list-grid .nbtn {
    @apply flex flex-row-reverse;
    @apply text-center;
    @apply font-light;
    @apply items-center justify-end;
    @apply bg-white dark:bg-black;
    @apply rounded-none;
    @apply line-clamp-none;

    border-radius: 0 !important;
    border: none !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: none !important;
    @apply border-none;
    @apply shadow-md;
    @apply flex-shrink-0;
  }

  .pop-buttons.list-grid .nbtn:first-child {
    border-top-left-radius: 20px !important;
  }
  .pop-buttons.list-grid .nbtn:last-child {
    border-bottom-right-radius: 20px !important;
  }
  .pop-buttons.list-grid .nbtn:nth-child(2) {
    border-top-right-radius: 20px !important;
  }
  .pop-buttons.list-grid .nbtn:nth-last-child(2) {
    border-bottom-left-radius: 20px !important;
  }

  .pop-buttons.list-grid .nbtn:focus {
    @apply bg-white dark:bg-black;
  }
  .pop-buttons.list-grid .nbtn .main {
    @apply text-left;

    @apply text-base;
    @apply w-full;
  }

  .pop-buttons.list-grid .nbtn svg {
    @apply text-gray-400 dark:text-gray-600;
    @apply mr-3;
  }
  .pop-buttons.list-grid .nbtn .main span {
    @apply text-base;
    @apply text-center;
    @apply block w-full line-clamp-1;
    @apply text-black dark:text-white;
  }
</style>
