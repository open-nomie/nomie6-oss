<svelte:options runes={true} />

<script lang="ts">
  import type { Trackable } from '../../domains/trackable/Trackable.class'
  import { TrackableStore } from '../../domains/trackable/TrackableStore'
  import { strToTrackable } from '../../domains/trackable/trackable-utils'
  import { type Token, tokenizeLite } from '../../modules/tokenizer/lite'

  import TrackableAvatar from '../avatar/trackable-avatar.svelte'

  const { str, titleClass, className, selected } = $props()

  let tokenized = $state<Array<Token>>([])
  let label = $state('')
  let meta = $state('')
  let trackable = $state<Trackable | undefined>(undefined)

  let lastStr = $state(undefined)
  $effect(() => {
    if (str !== lastStr) {
      lastStr = str
      tokenized = tokenizeLite(str)
      label = tokenized
        .filter((t) => {
          return t.type == 'generic'
        })
        .map((t) => {
          return t.raw
        })
        .join(' ')
        .trim()

    meta = tokenized
      .filter((t) => {
        return t.type !== 'generic'
      })
      .map((t) => {
        return t.raw
      })
      .join(' ')
      .trim()

      if (meta.length) {
        trackable = strToTrackable(meta, $TrackableStore.trackables)
      }
    }
  })
</script>

<div class="n-label-meta space-x-2 flex items-center {selected ? 'selected' : ''} {className} h-8">
  {#if meta.length && label.length}
    <TrackableAvatar {trackable} />
    <h2 class="{selected ? 'font-bold' : 'font-medium'}">{trackable.label}</h2>
    <div class="opacity-50">
      {trackable.formatValue(trackable.value)}
    </div>
    <div class="filler" />
    <div class="text-center px-2 {titleClass}">
      {label}
    </div>
  {:else if meta.length}
    <TrackableAvatar {trackable} />
    <h2 class="">{trackable.label}</h2>
    <div class="opacity-50">
      {trackable.formatValue(trackable.value)}
    </div>
  {:else if label.length}
    <div class="label mr-2 {titleClass}">{label}</div>
  {:else}
    <div class="label mr-2 {titleClass}">{str}</div>
  {/if}
</div>

<style global lang="postcss">
  .n-label-meta .title {
    @apply font-semibold;
  }
  .n-label-meta .label {
    @apply font-semibold;
    @apply text-sm;
  }
</style>
