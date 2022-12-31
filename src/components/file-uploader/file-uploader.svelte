<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import { Interact } from '../../store/interact'
  import Button from '../button/button.svelte'

  import Input from '../input/input.svelte'
  export let className = ''
  export let accept = 'png,jpeg,jpg,csv'
  export let placeholder = 'No file chosen'
  export let label = 'File'

  const dispatch = createEventDispatcher()

  interface IUploaded {
    file: File
    data: string
  }

  let uploaded: IUploaded
  let _input
  let uploadedFileName

  function clear() {
    uploaded = undefined
    uploadedFileName = undefined
  }

  function readFile(file: File) {
    let reader = new FileReader()
    try {
      reader.onload = async (theFile: any) => {
        let fileData = theFile.target.result
        uploaded = { data: null, file: null }
        uploaded.data = fileData
        uploaded.file = file
        uploadedFileName = uploaded.file.name
        label = 'File Loaded'
        dispatch('file', uploaded)
      }
      reader.readAsText(file)
    } catch (e) {
      Interact.error(e.message)
    }
  }

  function change(evt: any) {
    let files = evt.target.files
    readFile(files[0])
  }
</script>

<Input {className} {placeholder} {label} value={uploadedFileName} disabled>
  <div slot="right" class="pr-2">
    {#if uploadedFileName}
      <Button color="transparent" className="text-red" on:click={clear}>Clear</Button>
    {:else}
      <Button
        on:click={() => {
          if (_input) {
            _input.click()
          }
        }}
      >
        Select...
      </Button>
    {/if}
  </div>
</Input>

<input type="file" class="hidden" bind:this={_input} on:change={change} {accept} />
