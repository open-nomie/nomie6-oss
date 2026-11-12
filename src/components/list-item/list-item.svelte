<svelte:options runes={true} />

<script lang="ts">
  import { navigate } from '../../vendor/svelte-navigator'
  import { createEventDispatcher } from 'svelte'
  import tick from '../../utils/tick/tick'

  import './list-item.css'
  import IonIcon from '../icon/ion-icon.svelte'
  import { ChevronForwardOutline } from '../icon/nicons'

  const { title = undefined, description = undefined, href = undefined, to = undefined, id = null, bg = undefined, className = '', itemDivider = undefined, compact = false, truncate = false, style = '', clickable = false, ariaLabel = '', solo = false, bottomLine = undefined, topLine = false, delay = undefined, detail = false, transparent = false, mainClass = '', titleClass = '', autofocus = undefined, disabled = false } = $props<{ title?: any; description?: any; href?: any; to?: any; id?: any; bg?: any; className?: string; itemDivider?: any; compact?: boolean; truncate?: boolean; style?: string; clickable?: boolean; ariaLabel?: string; solo?: boolean; bottomLine?: number; topLine?: boolean; delay?: number; detail?: boolean; transparent?: boolean; mainClass?: string; titleClass?: string; autofocus?: boolean; disabled?: boolean }>()

  let has_left: boolean
  let has_right: boolean

  const dispatch = createEventDispatcher()

  async function tap(event: any) {
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
  }

  function doubletap(evt: any) {
    if(!disabled) dispatch('dbltap', evt)
  }

  function longtap(evt: any) {
    if(!disabled) dispatch('longtap', evt)
  }

  function getHref() {
    return href || to || null
  }

  function getStyle() {
    if (getHref()) {
      return {
        cursor: 'pointer',
      }
    } else {
      return {}
    }
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
    on:tap={tap}
    on:dbltap={doubletap}
    on:longtap={longtap}
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
    {#if $$slots.left}
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

    {#if $$slots.right || detail}
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
    on:tap={tap}
    on:dbltap={doubletap}
    on:longtap={longtap}
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
    {#if $$slots.left}
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

    {#if $$slots.right}
      <div class="right">
        <slot name="right" />
      </div>
    {/if}
  </div>
{/if}
