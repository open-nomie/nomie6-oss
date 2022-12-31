<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { press } from 'svelte-hammer'

  import './button.css'
  import { md5 } from '../../modules/nid/nid'

  const dispatch = createEventDispatcher()
  export let id = undefined
  export let size = 'md'
  export let type = ''
  export let shape: 'round' | 'rounded' = 'rounded'
  export let color = ''
  export let className = ''
  export let mainClass = ''
  export let block = false
  export let style = ''
  export let disabled = false
  export let delay = 300
  export let icon = false
  export let title = undefined
  export let ariaLabel = undefined
  export let prevent = false
  export let inline = false
  export let text = false
  export let confirm = false
  export let role = ''
  export let autofocus = false
  export let primary = false
  export let clear = false

  let confirming = false
  let confirmTimeout

  $: id = id || `auto-${md5(`${title}${className}${text}`)}`

  const onClick = async (evt) => {
    if (confirm) {
      clearTimeout(confirmTimeout)
      if (confirming) {
        dispatch('click', evt)
        confirming = false
      } else {
        confirming = true
        confirmTimeout = setTimeout(() => {
          confirming = false
        }, 3000)
      }
    } else {
      dispatch('click', evt)
    }
  }
</script>

<!-- svelte-ignore a11y-autofocus -->
<button
  {role}
  {id}
  {style}
  {autofocus}
  {disabled}
  type="button"
  class:confirming
  class:text-primary={primary}
  class:clear
  class={`${className} nbtn ${block ? 'nbtn-block' : ''} ${
    icon ? 'nbtn-icon' : ''
  } nbtn-${type} nbtn-${shape} nbtn-${color} nbtn-${size} ${inline ? 'nbtn-inline' : ''} ${text ? 'nbtn-text' : ''} `}
  {title}
  use:press
  on:press={(e) => {
    e.preventDefault()
    e.stopPropagation()
    dispatch('longpress', e)
  }}
  aria-label={ariaLabel || title}
  on:click|nonpassive|preventDefault|stopPropagation={(evt) => {
    if (prevent) {
      evt.stopPropagation()
      evt.preventDefault()
    }
    if (delay) {
      setTimeout(() => {
        onClick(evt)
      }, delay)
    } else {
      onClick(evt)
    }
  }}
>
  <div class="hit-mark" />
  {#if confirming}
    <div
      class="flex items-center justify-center"
      on:click|preventDefault|stopPropagation={() => {
        confirming = false
      }}
    />
  {/if}
  <slot name="left" />
  <div class="button-main {mainClass}">
    <slot />
  </div>
  <slot name="right" />
</button>

<style global>
  .nbtn {
    position: relative;
    overflow: hidden;
    text-align: left;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .nbtn.clear {
    @apply focus:ring-opacity-20;
    @apply shadow-none;
  }
  .nbtn.confirming {
    @apply bg-red-500;
    @apply animate-pulse;
    @apply ring-2 ring-white ring-inset ring-opacity-100 focus:ring-opacity-100;
    color: #fff;
  }

  .btn.btn-inline {
    display: inline-flex;
  }
</style>
