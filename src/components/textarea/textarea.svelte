<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'
  import Tribute from 'tributejs/dist/tribute.esm'
  import autosize from 'svelte-autosize'

  export let value: any
  
  export let tributeConfig: any = undefined;
  const emit = createEventDispatcher()

	export const setSelectionRange = (a,b)=>{
		textarea.setSelectionRange(a,b);
		textarea.focus();
	}


  let tribute
  let textarea: HTMLTextAreaElement

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
  {...$$restProps}
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
  class={`${$$restProps.class}`}
/>
