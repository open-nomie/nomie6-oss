<script lang="ts">
  import { navigate } from 'svelte-navigator'
  import { createEventDispatcher } from 'svelte'
  import tick from '../../utils/tick/tick'

  import './list-item.css'
  import IonIcon from '../icon/ion-icon.svelte'
  import { ChevronForwardOutline } from '../icon/nicons'

  export let title = undefined
  export let description = undefined
  // export let borderBottom = false;

  export let href = undefined
  export let to = undefined
  export let id = null
  export let bg = undefined
  export let className = ''
  export let itemDivider = undefined
  export let compact = false
  export let truncate = false
  export let style = ''
  export let clickable = false
  export let ariaLabel = ''
  export let solo = false
  export let bottomLine: number = undefined
  export let topLine = false
  export let delay: number = undefined
  export let detail = false
  export let transparent = false
  export let mainClass = ''
  export let titleClass = ''
  export let autofocus: boolean | undefined = undefined
  export let disabled: boolean | undefined = false;

  const has_left = (arguments[1].$$slots || {}).hasOwnProperty('left')
  const has_right = (arguments[1].$$slots || {}).hasOwnProperty('right')
  // const has_icon = (arguments[1].$$slots || {}).hasOwnProperty('icon')

  const dispatch = createEventDispatcher()


  const methods = {
    async tap(event) {
     if(!disabled) {
      let timeout = 0
      if (delay !== undefined) {
        timeout = delay
      } else if (clickable || detail) {
        timeout = 200
      }
      await tick(timeout)
      if (href) {
        window.open(href, '_system')
      } else if (to) {
        navigate(to)
      }
      dispatch('click', event)
      dispatch('tap', event)
     }
    },
    doubletap(evt) {
      if(!disabled) dispatch('dbltap', evt)
    },
    longtap(evt) {
      if(!disabled) dispatch('longtap', evt)
    },
    getHref() {
      return this.href || this.to || null
    },
    getStyle() {
      if (this.getHref) {
        return {
          cursor: 'pointer',
        }
      } else {
        return {}
      }
    },
  }
</script>

{#if clickable || detail}
  <!-- svelte-ignore a11y-autofocus -->
  <button
    role="menuitem"
    {autofocus}
    {id}
    aria-label={ariaLabel}
    {disabled}
    on:tap={methods.tap}
    on:dbltap={methods.doubletap}
    on:longtap={methods.longtap}
    on:contextmenu={(evt) => {
      dispatch('contextmenu', evt)
      return false
    }}
    item-divider={itemDivider}
    style="--line-gap:{bottomLine || 0}px; {style}"
    class="n-item {compact ? 'compact' : ''}
    {clickable || detail ? 'clickable' : ''}
    {disabled ? 'opacity-50' : ''}
    {transparent ? 'bg-transparent' : ''}
    {bottomLine ? 'bottom-line' : ''}
    {topLine ? 'top-line' : ''}
    {solo ? 'solo' : ''}
    {className}
    {bg ? `bg-${bg}` : ''}"
    :alt="title"
  >
    {#if has_left}
      <div class="left relative">
        <slot name="left" />
      </div>
    {/if}
    <div class="main {mainClass} filler {truncate ? 'truncate' : ''}">
      {#if title}
        <div class="font-medium leading-tight title {titleClass}">{title}</div>
      {/if}
      {#if description}
        <div class="description">{description}</div>
      {/if}
      <slot />
    </div>

    {#if has_right || detail}
      <div class="right d-flex align-items-center">
        <slot name="right" />
        {#if detail}
          <IonIcon
            icon={ChevronForwardOutline}
            className="text-gray-300 z-0 dark:text-gray-700"
            style="margin-left:6px; margin-right:-10px;"
          />
        {/if}
      </div>
    {/if}
    {#if clickable || detail}
      <div class="hit-mark"></div>
    {/if}
  </button>
{:else}
  <!-- svelte-ignore a11y-autofocus -->
  <div
    {id}
    aria-label={ariaLabel}
    role="menuitem"
    {autofocus}
    on:tap={methods.tap}
    on:dbltap={methods.doubletap}
    on:longtap={methods.longtap}
    on:contextmenu={(evt) => {
      dispatch('contextmenu', evt)
      return false
    }}
    item-divider={itemDivider}
    style="--line-gap:{bottomLine || 0}px; {style}"
    class="n-item {compact ? 'compact' : ''}
    {disabled ? 'opacity-50' : ''}
    {transparent ? 'bg-transparent' : ''}
    {className}
    {bottomLine ? 'bottom-line' : ''}
    {topLine ? 'top-line' : ''}
    {solo ? 'solo' : ''}
    {bg ? `bg-${bg}` : ''}
    "
    :alt="title"
  >
    {#if has_left}
      <div class="left">
        <slot name="left" />
      </div>
    {/if}
    <div class="main {mainClass} filler {truncate ? 'truncate' : ''}">
      {#if title}
        <div class="font-semibold leading-tight title {titleClass}">{title}</div>
      {/if}
      {#if description}
        <div class="description">{description}</div>
      {/if}
      <slot />
    </div>

    {#if has_right}
      <div class="right">
        <slot name="right" />
      </div>
    {/if}
  </div>
{/if}
