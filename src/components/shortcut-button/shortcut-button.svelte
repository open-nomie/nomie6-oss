<script lang="ts">
  import IonIcon from './../icon/ion-icon.svelte'
  import { createEventDispatcher } from 'svelte'
  import is from '../../utils/is/is'
  import Avatar from '../avatar/avatar.svelte'
  import Button from '../button/button.svelte'
  import TimeBalls from '../time-balls/time-balls.svelte'

  import { MoreVertical } from '../icon/nicons'

  export let title: string | undefined = undefined
  export let subtitle: string | undefined = undefined
  export let value: any = undefined
  export let color: string | number | undefined = undefined
  export let emoji: string | undefined = undefined
  export let avatar: string | undefined = undefined
  export let style: string = ''
  export let id: string | undefined = undefined

  export let hideMore: boolean = false
  export let hideValue: boolean = false
  export let className: string = ''
  export let compact: boolean = false
  export let moreIcon: any = MoreVertical
  export let oneTap: boolean = false
  export let hoursUsed = []

  let clickSkip

  const dispatch = createEventDispatcher()

  $: emojiSize = compact ? 30 : 40

  async function more() {
    dispatch('more')
  }
</script>

<div class="button-wrapper relative w-full flex-grow flex-shrink  {compact ? 'compact' : 'normal'}">
  {#if !hideMore}
    <button
      type="button"
      aria-label="More about this Trackable"
      class="more {is.truthy(value) ? 'has-value text-white' : 'no-value text-gray-500 dark:text-white'}"
      on:click={(evt) => {
        evt.preventDefault()
        evt.stopPropagation()
        more()
      }}
    >
      <IonIcon icon={moreIcon} size={20} />
    </button>
  {/if}

  <Button
    {id}
    ariaLabel={title || 'button'}
    title={title || 'button'}
    color="clear"
    className="w-full {className} {compact ? 'compact' : 'normal'} shortcut-button {is.truthy(value)
      ? 'has-value'
      : 'no-value bg-white dark:bg-black'}
  {compact ? 'compact' : ''}"
    style={[style, `--tracker-color:${color};`, value ? `background-color:${color};` : ``].join('')}
    on:longpress={() => {
      dispatch('longpress')
      clickSkip = true
    }}
    on:click={() => {
      if (!clickSkip) {
        dispatch('click')
      }
      clickSkip = undefined
    }}
  >
    <div class="emoji-holder" style={is.truthy(value) ? 'color:#FFF' : `color:${color}`}>
      {#if emoji || avatar || title}
        {#key emoji || avatar || title}
          <Avatar label={title} {emoji} src={avatar} size={emojiSize} />
        {/key}
      {/if}
      <slot name="emoji" />
    </div>

    <div class="subtitle-slot"><slot name="subtitle" /></div>

    <slot />
    <div class="title-value">
      {#if title}
        <div class="title {title.length > 15 ? 'long' : ''} {compact ? 'line-clamp-1' : 'line-clamp-2'}">{title}</div>
      {/if}
      <div class="value-sub">
        {#if value && !hideValue}
          <span class="value">{value}</span>
        {/if}
        {#if subtitle}
          <span class="subtitle">{subtitle}</span>
        {/if}
      </div>
    </div>
    <!-- highlight -->
    <div class="highlight {oneTap ? 'one-tap' : ''}">
      <TimeBalls color="#FFF" hours={hoursUsed} />
    </div>
  </Button>
</div>

<style global lang="postcss">
  .shortcut-button {
    @apply rounded-2xl;
    @apply shadow-md;
    @apply overflow-visible;
    @apply text-black dark:text-white;
    overflow:hidden;
  }
  .shortcut-button.normal {
    @apply h-28 lg:h-32;
  }
  .shortcut-button.compact {
    @apply h-14;
  }
  .shortcut-button .title-value {
    @apply leading-tight;
  }
  .shortcut-button.compact .title-value {
    @apply text-black dark:text-white;
    @apply absolute;
    @apply left-12 right-3 top-0 bottom-0;
    @apply text-base;
    @apply p-0;

    @apply flex flex-col justify-center justify-items-center;
  }
  .shortcut-button .title {
    @apply font-semibold;
    @apply leading-tight;
  }
  .shortcut-button .title.long {
    font-size: .825rem;
  }
  .shortcut-button.normal .emoji-holder {
    @apply absolute top-2 left-2;
    @apply text-black dark:text-white;
  }
  .shortcut-button.compact .emoji-holder {
    @apply absolute top-0 bottom-0 left-2;
    @apply flex items-center;
  }
  .button-wrapper .more {
    @apply absolute top-0 right-0 flex items-center justify-center z-40 w-10 h-10 rounded-full;
  }
  .shortcut-button .title-value {
    @apply absolute;
    @apply left-0 right-0 bottom-0;
    @apply px-3 pb-3;
  }
  .shortcut-button .subtitle {
    @apply text-sm;
    @apply opacity-60;
  }
  .shortcut-button.has-value,
  .shortcut-button.has-value .title {
    color: #fff !important;
  }

  .shortcut-button .value-sub {
    @apply text-black dark:text-white;
    @apply line-clamp-1;
    @apply leading-none;
  }

  .shortcut-button.normal .value-sub {
    @apply flex;
    @apply items-center;
    @apply justify-between;
    @apply space-x-2;
  }

  .shortcut-button.normal .value-sub .value {
    @apply whitespace-nowrap;
  }
  .shortcut-button.normal .value-sub .subtitle {
    @apply whitespace-nowrap;
    @apply line-clamp-1;
  }

  .shortcut-button.has-value .value-sub {
    @apply text-white;
  }
  .shortcut-button .value-sub .value {
    @apply leading-tight;
    @apply font-semibold;
  }
  .shortcut-button .n-counter {
    @apply text-sm;
    @apply flex justify-center;
  }
  .shortcut-button .subtitle-slot {
    @apply absolute top-4 left-12;
    @apply pl-1;
  }
  .shortcut-button.compact .subtitle-slot {
    top: auto;
    @apply absolute -bottom-1 right-8 left-8;
    @apply z-40;
    @apply text-center;
    @apply justify-center;
  }

  .shortcut-button.has-value .subtitle-slot .letter-ticker {
    color: #fff;
  }
  .shortcut-button.compact .n-counter {
    @apply text-xs;
    @apply bg-white dark:bg-black;
    @apply z-40;
    @apply border border-black dark:border-white border-opacity-20 dark:border-opacity-40;
    @apply rounded-full;
    @apply shadow-md;
    @apply block;
  }

  .button-wrapper.compact .more {
    @apply w-7;
    @apply opacity-50;
    @apply h-full;
    @apply top-auto;
    @apply z-40;
    @apply rounded-l-none rounded-r-2xl;
  }
  .shortcut-button.in-note {
    @apply ring-2 ring-primary-500 ring-offset-4 ring-offset-gray-300 dark:ring-offset-gray-600;
    @apply animate-pulse;
  }
  .shortcut-button .highlight {
    @apply rounded-full;
    @apply h-1;
    @apply absolute bottom-1 left-3 right-3;
  }
  .shortcut-button .highlight.one-tap {
    @apply bg-gray-300 dark:bg-gray-800 bg-opacity-40;
  }

  .shortcut-button.has-value .highlight.one-tap {
    @apply bg-white bg-opacity-20;
  }

  .shortcut-button.compact .highlight {
    @apply hidden;
  }
</style>
