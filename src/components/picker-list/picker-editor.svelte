<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'

  import NItem from '../list-item/list-item.svelte'

  import { createEventDispatcher } from 'svelte'
  import Input from '../input/input.svelte'
  import { Lang } from '../../store/lang'
  import Text from '../text/text.svelte'
  const dispatch = createEventDispatcher()
  let { style, className, itemClass, list = $bindable(), showHeaderContent } = $props()

  let ready = $state(false)
  let textList = $state(undefined)
  let picks = $state([])

  function textListChanged(evt) {
    picks = (evt.detail || '').split('\n').filter(item => item.trim())
    list = picks
    dispatch('change', picks)
  }

  $effect(() => {
    if (list && list.length && picks.length == 0) {
      picks = list || []
    }
  })

  onMount(() => {
    ready = true
  })
</script>

<div class="n-picker-list edit-mode {className}" {style}>
  {#if showHeaderContent}
    <NItem title={Lang.t('picker.title', 'List one item per line')} className={itemClass} bg="transparent">
      <Text size="sm" faded>Include #trackers @people +context ^pointers. Add a : to make a Title:</Text>
    </NItem>
  {/if}
  {#if ready}
    <Input
      solo
      listItem
      placeholder={'Friends:\n@toby\n@patrick\n@maddy\nFeeling:\n#mood\n+joyful\n+anxious'}
      type="textarea"
      value={picks.join('\n')}
      className="font-mono font-medium"
      bind:this={textList}
      on:input={textListChanged}
      inputStyle="height:45vh; line-height:28px"
    />
    <div class="filler" />
  {/if}
</div>

<style global lang="postcss">
  .n-picker-list.edit-mode {
    max-width: 100%;
    position: relative;
    align-items: start;
    flex-grow: 1;
    box-shadow: var(--box-shadow-float);
  }
  .n-picker-list textarea {
    @apply font-mono;
  }
</style>
