<script lang="ts">
  import Text from '../text/text.svelte'

  export let style: string = ''
  export let solo: boolean = false
  export let transparent: boolean = false
  export let className: string = ''
  export let title: string = undefined
  export let disabled: boolean = false
  export let id: string = ''
  export let outside: boolean = false
  export let role: string | undefined = 'menu'
</script>

{#if title && outside}
  <header>
    <div class="outside-title flex items-end lg:mt-4 mb-1 lg:mb-2">
      <h2 class="text-lg lg:text-2xl pl-1  font-bold leading-tight">{title}</h2>
      <slot name="header-left" />
      <slot name="header-right" />
    </div>
    <slot name="subheader" />
  </header>
{/if}
<div
  {id}
  class="n-list {disabled ? 'disabled' : ''} {solo ? 'solo' : ''}
  {transparent ? 'transparent' : ''}
  {className}"
  {style}
  {role}
>
  {#if title && !outside}
    <div class="flex items-center justify-between">
      <Text size="xs" className="pt-3 px-3 pb-2" bold faded>
        {title.toUpperCase()}
      </Text>
      <slot name="header-left" />
    </div>
  {/if}
  <slot />
</div>
<slot name="bottom" />

<style global lang="postcss">
  .n-list.bright {
    @apply bg-white;
    @apply dark:bg-black;
  }
  .n-list {
    @apply bg-white dark:bg-gray-900;
    overflow: hidden;
    @apply relative;
  }

  .n-list > div > .n-input-container:first-child {
    @apply rounded-t-xl;
  }
  .n-list > div > .n-input-container:last-child {
    @apply rounded-b-xl;
  }

  .n-list .list-header {
    @apply bg-gray-200 dark:bg-gray-800;
    @apply px-4 text-sm text-gray-500;
    @apply h-7;
    @apply flex items-center;
  }

  .outside-title {
    @apply pb-2 px-3 pt-5;
    @apply text-gray-800 dark:text-gray-200;
    @apply flex items-center justify-between;
  }

  .n-list.disabled {
    @apply pointer-events-none;
  }

  .disabled {
    @apply opacity-60;
  }
  .n-list.disabled:after {
    content: '';
    @apply bg-gray-200 dark:bg-gray-800 bg-opacity-50 dark:bg-opacity-50;
    @apply absolute;
    @apply top-0 left-0 right-0 bottom-0;
  }
  .n-list.transparent,
  .n-list[transparent] {
    background-color: transparent;
  }
  .n-list.solo,
  .n-list [solo] {
    width: calc(100% - 16px);
    @apply mx-auto;
    @apply shadow-md;
    @apply rounded-xl;
    overflow: hidden;

    padding: 0px 0;
  }

  .n-list.solo > .n-input-container.list-item:first-child {
    @apply rounded-t-2xl;
  }
  .n-list.solo > .n-input-container.list-item:last-child {
    @apply rounded-b-2xl;
  }


  .n-list.solo.w-full {
    width:100%;
  }
  .n-list.solo .n-item:first-child {
    @apply rounded-t-xl;
  }

  .n-list.solo .n-item:last-child {
    @apply rounded-b-xl;
  }

  .n-list.framed {
    /* border: solid 1px var(--color-solid-2) !important; */
  }
</style>
