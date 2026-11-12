<svelte:options runes={true} />

<script lang="ts">
  import { createEventDispatcher, onDestroy, onMount } from 'svelte'

  import nid from '../../modules/nid/nid'
  import Button from '../button/button.svelte'
  import CameraSolid from '../../n-icons/CameraSolid.svelte'
  import IonIcon from '../icon/ion-icon.svelte'

  const id = `image-${nid()}`

  const dispatch = createEventDispatcher()

  let canvas = $state<HTMLCanvasElement>(undefined)
  let input = $state<HTMLInputElement>(undefined)

  let output: string = $state('')

  const select = () => {
    input.click()
  }

  function handleFiles(e) {
    if (!e.target.files || !e.target.files[0]) return

    var img = new Image()
    img.onerror = () => {
      console.error('Failed to load image')
    }
    img.onload = function () {
      try {
        const iw = img.width
        const ih = img.height
        const scale = Math.min(maxW / iw, maxH / ih)
        const iwScaled = Math.max(1, iw * scale)
        const ihScaled = Math.max(1, ih * scale)
        canvas.width = iwScaled
        canvas.height = ihScaled
        let ctx = canvas.getContext('2d')
        if (!ctx) {
          console.error('Could not get canvas context')
          return
        }
        ctx.drawImage(img, 0, 0, iwScaled, ihScaled)
        output = canvas.toDataURL('image/webp', 0.2)
        if (!output || output.length < 50) {
          console.error('Invalid data URL generated')
          return
        }
        console.log('Image loaded, data URL length:', output.length);
        dispatch('image', output)
      } catch (err) {
        console.error('Error processing image:', err)
      }
    }
    img.src = URL.createObjectURL(e.target.files[0])
  }
  let mounted = $state(false)
  onMount(() => {
    mounted = true
  })

  onDestroy(() => {
    mounted = false
  })

  const { className, label, maxW = 512, maxH = 512 } = $props()
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
