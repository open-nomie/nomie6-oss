<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'

  import nid from '../../modules/nid/nid'
  import Button from '../button/button.svelte'
  import CameraSolid from '../../n-icons/CameraSolid.svelte'
  import IonIcon from '../icon/ion-icon.svelte'

  const id = `image-${nid()}`

  const dispatch = createEventDispatcher()

  let canvas: HTMLCanvasElement
  let input: HTMLInputElement

  export let className = ''
  export let label: string = 'Select'
  export let maxW = 64*4
  export let maxH = 64*4

  let output: string

  const select = () => {
    input.click()
  }

  function handleFiles(e) {
    let ctx = canvas.getContext('2d')
    var img = new Image()
    img.onload = function () {
      const iw = img.width
      const ih = img.height
      const scale = Math.min(maxW / iw, maxH / ih)
      const iwScaled = iw * scale
      const ihScaled = ih * scale
      canvas.width = iwScaled
      canvas.height = ihScaled
      ctx.drawImage(img, 0, 0, iwScaled, ihScaled)
      output = canvas.toDataURL('image/webp', 0.2)
      console.log(output, output.length);
      dispatch('image', output)
    }
    img.src = URL.createObjectURL(e.target.files[0])
  }
  let mounted = false
  onMount(() => {
    mounted = true
  })

  onDestroy(() => {
    mounted = false
  })
</script>

{#if mounted}
  <Button {className} clear primary on:click={select}>
    <IonIcon className="mr-2" icon={CameraSolid} />
    {label}
  </Button>

  <div class="w-0 h-0 stiff opacity-0 pointer-events-none">
    <input class="w-0 h-0 overflow-hidden" bind:this={input} type="file" id="input" on:input={handleFiles} />
    <canvas class="opacity-0 pointer-events-none" bind:this={canvas} {id} width="64" height="64" />
  </div>
{/if}
