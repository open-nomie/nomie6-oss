<script lang="ts">
  import type { IPopMenuOptions } from '../../store/interact'

  import { Lang } from '../../store/lang'
  import Button from '../button/button.svelte'
  import PopButtons from './pop-buttons.svelte'
  import TrackableAvatar from '../avatar/trackable-avatar.svelte'
  import { createEventDispatcher } from 'svelte'
  import { closeModal } from '../backdrop/BackdropStore2'

  export let menu: IPopMenuOptions
  export let id: string
</script>

<div class="pop-menu2-wrapper w-full max-w-md" style="min-width:320px;">
  <div class="pop-menu2 shadow-2xl" role="dialog">
    {#if menu.title || menu.description}
      <header class="space-x-3 px-2 flex items-center py-1">
        {#if menu.trackable}
          <TrackableAvatar size={48} className="shadow-md" trackable={menu.trackable} />
        {/if}
        <main class="py-0">
          {#if menu.title}
            <h5
              aria-label="Title"
              class="font-semibold text-black dark:text-white text-lg leading-tight {!menu.description
                ? 'pb-1'
                : 'mt-3'}"
            >
              {menu.title}
            </h5>
          {/if}
          {#if menu.description}
            <!-- DON'T MESS WITH THIS! THE BUTTONS ARE BELOW YOU KNUCKLE HEAD! -->
            <p class="p-0 m-0 mb-2 mt-2 text-sm leading-tight text-gray-600 dark:text-gray-400 line-clamp-4">
              {menu.description}
            </p>
          {/if}
        </main>
        <div class="filler" />
      </header>
    {/if}
    {#if menu.component}
      <div class="rounded-xl overflow-hidden flex-shrink-0 text-gray-500">
        <svelte:component this={menu.component} {...menu.componentProps || {}} />
      </div>
    {/if}
    <main class="overflow-y-auto space-y-3">
      <PopButtons
        buttons={menu.buttons}
        on:close={(evt) => {
          closeModal(id)
        }}
        listType={menu.buttonView}
      />
    </main>
    <footer class="pb-1">
      <Button
        size="lg"
        on:click={() => {
          closeModal(id)
        }}
        className="w-full bg-red-gradient text-white stiff"
        style="min-height:50px;">{Lang.t('general.close', 'Close')}</Button
      >
    </footer>
  </div>
</div>

<style lang="postcss" global>
  .pop-menu2 {
    @apply flex flex-col space-y-3;
    @apply bg-gray-300 dark:bg-gray-900 p-2 lg:p-4 pt-2 lg:pb-3;
    @apply rounded-2xl;
    box-shadow: 5px 13px 34px 1px rgba(0, 0, 0, 0.4) !important;
  }
  .pop-menu2 > main {
    max-height: calc(100vh - 200px);
    @apply block;
    @apply rounded-2xl;
    @apply overflow-y-auto;
  }
</style>
