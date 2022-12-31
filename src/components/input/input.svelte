<script lang="ts">

  import { createEventDispatcher, onMount } from 'svelte'
import is from '../../utils/is/is';

  const dispatch = createEventDispatcher()

  export let label = null
  export let placeholder = null
  export let inputmode = undefined
  export let value = null
  export let type = 'text'
  export let help = null
  export let className = ''
  export let id = ''
  export let style = ''
  export let inputStyle = ''
  export let inputClass = ''
  export let pattern = ''
  export let width = ''
  export let disabled = undefined
  export let solo = undefined
  export let listItem = undefined
  export let compact = undefined
  export let rows = 2
  export let accept = 'png,jpeg,jpg,csv'
  export let name = undefined

  export let autocomplete = undefined
  export let autocorrect = undefined
  export let autocapitalize = undefined
  export let autofocus = undefined

  const SLOTS = $$props.$$slots

  let focused = false
  let hasInput = false

  let _elInput

  export function doFocus() {
    _elInput.focus()
  }

  export function getValue() {
    return _elInput.value
  }

  let blur = () => {
    focused = false
  }
  let focus = (event) => {
    focused = true
    dispatch('focus', event)
  }

  let onInput = (evt) => {
    if (evt.key == 'Enter') {
      dispatch('enter', value)
    }
    dispatch('input', evt.target.value)
  }

  $: if (value !== "" && (value === 0 || is.truthy(value))) {
    hasInput = true
  } else {
    hasInput = false
  }

  onMount(() => {
    if (type == 'select') {
      hasInput = true
    }
    if (value && `${value}`.length) {
      hasInput = true
    }
  })
</script>

<div
  class="n-input-container n-input-type-{type}
  {className}
  {compact ? 'compact' : ''}
  {listItem ? 'list-item' : ''}
  {solo ? 'solo' : 'with-label'}"
  style="{width ? `max-width:${width}; width:${width}; ` : ``}
  {style}"
>
  <div
    class="n-input-wrapper {hasInput ? 'has-input' : 'no-input'}
    {focused ? 'has-focus' : 'no-focus'}"
  >
    <slot name="left" />
    <div class="n-input">
      {#if label || placeholder}
        <label for={name}>{label || placeholder}</label>
      {/if}
      {#if type == 'email'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          bind:this={_elInput}
          {id}
          {disabled}
          {inputmode}
          {autofocus}
          {name}
          type="email"
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={onInput}
          on:change={(evt) => {
            dispatch('change', evt)
          }}
          on:focus={focus}
          on:blur={blur}
        />
      {:else if type == 'file'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          bind:this={_elInput}
          {id}
          {disabled}
          {inputmode}
          {name}
          type="file"
          style={inputStyle}
          {autofocus}
          class={inputClass}
          {pattern}
          {accept}
          bind:value
          {placeholder}
          on:change={(evt) => {
            dispatch('change', evt)
          }}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
        />
      {:else if type == 'password'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          bind:this={_elInput}
          {id}
          {disabled}
          {inputmode}
          type="password"
          style={inputStyle}
          class={inputClass}
          {pattern}
          {autofocus}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
        />
      {:else if type == 'datetime-local'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          bind:this={_elInput}
          {id}
          {disabled}
          {inputmode}
          type="datetime-local"
          style={inputStyle}
          class={inputClass}
          {autofocus}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
        />
      {:else if type == 'number'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          bind:this={_elInput}
          {id}
          {disabled}
          {inputmode}
          type="number"
          style={inputStyle}
          class={inputClass}
          {autofocus}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
        />
      {:else if type == 'date'}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          bind:this={_elInput}
          {id}
          {disabled}
          {inputmode}
          type="date"
          style={inputStyle}
          {autofocus}
          class={inputClass}
          bind:value
          {placeholder}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
        />
      {:else if type == 'select'}
        <div class="select-wrap">
          <select
            {placeholder}
            {id}
            bind:this={_elInput}
            {disabled}
            on:input={(evt) => {
              //@ts-ignore
              dispatch('change', evt.target.value)
            }}
            bind:value
          >
            <slot />
          </select>
        </div>
      {:else if type == 'textarea'}
        <!-- svelte-ignore a11y-autofocus -->
        <textarea
          {autofocus}
          bind:this={_elInput}
          {disabled}
          {id}
          {rows}
          style={inputStyle}
          class={inputClass}
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
          bind:value
        />
        <!-- autofocus={autofocus ? true : false} -->
        <slot />
      {:else}
        <!-- svelte-ignore a11y-autofocus -->
        <input
          {autofocus}
          bind:this={_elInput}
          {disabled}
          {id}
          type="text"
          {inputmode}
          style={inputStyle}
          class={inputClass}
          {pattern}
          bind:value
          {autocomplete}
          {autocorrect}
          {autocapitalize}
          {placeholder}
          on:keyup={(evt) => {
            if (evt.key === 'Enter') {
              dispatch('enter', value)
            }
            dispatch('keyup', evt)
          }}
          on:input={onInput}
          on:focus={focus}
          on:blur={blur}
        />
      {/if}
    </div>
    <slot name="right" />
  </div>
  <slot name="bottom" />
  {#if help || SLOTS?.help}
    <div class="helper">{help || ''} <slot name="help" /></div>
  {/if}
</div>

<style global lang="postcss">
  .n-input-container.list-item div.n-input label {
    left: 20px !important;
    top: 10px !important;
    @apply text-black dark:text-white;
  }
  .n-input-container.list-item .n-input-wrapper {
    border-radius: 0px !important;
  }
  .n-input-container.solid {
    @apply bg-white dark:bg-black;
  }
  .n-input-container.outline {
    @apply border border-gray-500 dark:border-opacity-60 border-opacity-30;
    @apply p-1;
  }
  .n-input-container {
    @apply relative;
    @apply w-full;
    @apply flex flex-col flex-grow flex-shrink;
    @apply mb-px;
    
    @apply rounded-md;
    @apply focus-within:ring-2 ring-opacity-50 ring-inset ring-primary-500;
  }

  .n-input-container input:invalid {
      border-color: red !important;
  }


  .n-input-container .helper {
    font-size: 0.65em;
    color: var(--color-grey-5);
    padding: 3px 6px;
  }
  .n-input-container.list-item {
    @apply bg-transparent;

    padding: 6px 12px;
    border-radius: 0;
    border: none;
  }
  .n-input-container .select-arrow {
    margin-left: -50px;
  }
  .n-input-container .select-wrap {
    position: relative;
  }
  .n-input-container.with-label .n-input-wrapper input,
  .n-input-container.with-label .n-input-wrapper select {
    min-height: 47px;
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input label {
    transition: all 0.2s ease-in-out;
    opacity: 0.7;
    transform: translateY(0px);
  }
  .n-input-container.with-label.outline .n-input-wrapper.has-input .n-input label {
    transform: translateY(2px);
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input input {
    padding-top: 14px;
    padding-bottom: 0px;
    font-size: 1.05em;
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input select {
    padding-top: 16px;
    margin-left: -4px;
    padding-bottom: 0px;
    font-size: 1.05em;
  }
  .n-input-container.with-label .n-input-wrapper.has-input .n-input textarea {
    padding-top: 22px;
    padding-bottom: 0px;
    /* font-size: 1.05em; */
  }
  .n-input-container.solo .n-input-wrapper {
    min-height: 48px;
  }
  .n-input-container.solo .n-input-wrapper .n-input {
    min-height: 48px;
  }
  .n-input-container.solo .n-input-wrapper .n-input input,
  .n-input-container.solo .n-input-wrapper .n-input select,
  .n-input-container.solo .n-input-wrapper .n-input textarea {
    min-height: 47px;
  }
  .n-input-container.solo.compact .n-input-wrapper {
    min-height: auto;
  }
  .n-input-container.solo.compact .n-input-wrapper .n-input {
    min-height: auto;
  }
  .n-input-container.compact .has-input label {
    transform: translateY(-3px) !important;
    font-size: 0.7em;
  }
  .n-input-container.compact .n-input-wrapper {
    min-height: 40px;
  }
  .n-input-container.compact .n-input-wrapper .n-input input,
  .n-input-container.compact .n-input-wrapper .n-input select,
  .n-input-container.compact .n-input-wrapper .n-input textarea {
    min-height: 40px;
    @apply text-base;
    @apply leading-5;
    /* @apply bg-white dark:bg-gray-900; */
    @apply text-black dark:text-white;
  }
  .n-input-container .n-input-wrapper {
    transition: all 0.2s ease-in-out;
    min-height: 48px;
    display: flex;
    width: 100%;
    min-width: 50px;
    max-width: 100%;
    flex-direction: row;
    align-items: center;
    flex-grow: 1;
    flex-shrink: 1;
    transition: all 0.2s ease-in-out;
    border-radius: 12px;
  }
  .n-input-container .n-input-wrapper:before {
    transition: all 0.2s ease-in-out;
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    opacity: 0;
    pointer-events: none;
  }

  .n-input-container .n-input-wrapper:after {
    @apply w-0;
    @apply transform transition-all duration-300;
    content: '';
    position: absolute;
    bottom: 0;
    height: 0px;
    left: 0;
  }
  /* .n-input-container .n-input-wrapper.has-focus:after {
    content: '';
    position: absolute;
    bottom: 0;
    height: 2px;
    @apply w-full;
    @apply bg-primary-500;
  } */
  .n-input-container .n-input-wrapper textarea,
  .n-input-container .n-input-wrapper input {
    border: none;

  }
  .n-input-container .n-input-wrapper .n-input {
    transition: all 0.2s ease-in-out;
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    flex-shrink: 1;
    @apply text-black dark:text-white;
  }
  .n-input-container .n-input-wrapper .n-input label {
    transition: all 0.2s ease-in-out;
    line-height: 105%;
    opacity: 0;
    transform: translateY(20px);
    pointer-events: none;
    font-size: 0.7em;
    position: absolute;
    top: 5px;
    left: 10px;
    margin: 0;
    padding: 0;
  }

  .n-input-type-textarea {
    @apply bg-gray-100 dark:bg-gray-900;
  }
  .n-input-type-textarea textarea {
    @apply placeholder-gray-400;
    @apply dark:text-white;
    min-height: 90px;
    padding-top: 8px;
  }
  .n-input-container .n-input-wrapper .n-input input,
  .n-input-container .n-input-wrapper .n-input select,
  .n-input-container .n-input-wrapper .n-input textarea {
    width: 100%;
    transition: all 0.2s ease-in-out;
    margin: 0;
    padding-left: 8px;
    padding-right: 8px;
    /* background-color: transparent !important; */
    /* @apply bg-white dark:bg-black bg-opacity-10 dark:bg-opacity-20; */
    @apply rounded-md;
    @apply bg-transparent;
    outline: none;
    @apply placeholder-gray-400;
    @apply dark:text-white;
  }
  .n-input-container .n-input-wrapper .n-input input:disabled,
  .n-input-container .n-input-wrapper .n-input select:disabled,
  .n-input-container .n-input-wrapper .n-input textarea:disabled {
    background-color: transparent !important;
    opacity: 0.7;
  }

  .nselect.sm {
    @apply text-xs;
    @apply h-6;
  }
  .nselect {
    /* @apply appearance-none; */
    @apply px-3;
    @apply rounded-md;
    @apply bg-white dark:bg-black;
    @apply shadow-md;
    @apply flex items-center justify-center;
    @apply focus:outline-none focus:ring-2 ring-primary-500 ring-inset;
    @apply font-semibold;
    @apply h-10;
    @apply rounded-xl;
  }
  .nselect.clear {
    @apply shadow-none;
    @apply w-auto;
    @apply bg-opacity-5;
    /* @apply bg-transparent; */
    /* @apply appearance-none; */
  }

  .nselect.chevron::before {
    content: '˯';
    @apply absolute;
    @apply right-2;
    @apply text-gray-500;
  }

  .nselect-group {
    @apply rounded-xl;
  }
  .nselect-group .nselect:first-child {
    @apply rounded-r-none;
  }
  .nselect-group .nselect:last-child {
    @apply rounded-l-none;
  }
</style>
