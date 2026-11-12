<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import Tribute from 'tributejs/dist/tribute.esm'
  import autosize from 'svelte-autosize'

  const emit = createEventDispatcher()
  let { value = $bindable(), tributeConfig, ...rest } = $props()

  let tribute
  let textarea: HTMLTextAreaElement

  $effect(() => {
    value
    if (textarea) autosize.update(textarea)
  })

  export const setSelectionRange = (a,b)=>{
    textarea.setSelectionRange(a,b);
    textarea.focus();
  }

  export const setValue = (text: string) => {
    textarea.value = text;
    value = text;
  }

	const tributeTriggered = (e)=>{
		let payload:any = e.detail;
		payload.cursor = {
			start: textarea.selectionStart,
			end: textarea.selectionEnd,
		}
		emit('inserted', e.detail);
	}

  onMount(async () => {
    if (tributeConfig) {
      tribute = new Tribute(tributeConfig)
      tribute.attach(textarea)
      
			textarea.addEventListener('tribute-replaced', tributeTriggered);
    }
  })
	onDestroy(()=>{
		textarea.removeEventListener('tribute-replaced', tributeTriggered)
	})

</script>

<textarea
  {...rest}
  bind:this={textarea}
  use:autosize
  bind:value
  on:input={(evt) => {
    emit('input', evt)
  }}
  on:focus={(evt) => {
    emit('focus', evt)
  }}
	on:keydown={(evt) => {
    emit('keydown', evt)
  }}
  on:blur={(evt) => {
    emit('blur', evt)
  }}
  class={`${rest.class}`}
/>
