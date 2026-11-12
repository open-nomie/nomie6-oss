<svelte:options runes={true} />

<script lang="ts">
import { onMount } from 'svelte';

  import CloseOutline from '../../n-icons/CloseOutline.svelte'
  import BackdropModal from '../backdrop/backdrop-modal.svelte'
  import { closeModal } from '../backdrop/BackdropStore2'
  import Button from '../button/button.svelte'
  import IonIcon from '../icon/ion-icon.svelte'
  import ToolbarGrid from '../toolbar/toolbar-grid.svelte'

  let frame:HTMLIFrameElement;

  const close = () => {
    closeModal(id)
  }

  onMount(()=>{
    if(messagePayload) {
      frame.onload=()=>{
        setTimeout(()=>{
          frame.contentWindow.postMessage(messagePayload, '*')
        },120)
      }
    }
  })

  const { title, url, id, messagePayload } = $props()
</script>

<BackdropModal>
  <ToolbarGrid slot="header">
    <Button icon primary slot="left" on:click={close}>
      <IonIcon icon={CloseOutline} />
    </Button>
    <h2 class="ntitle sm">{title}</h2>
  </ToolbarGrid>

  <iframe bind:this={frame} src={url} {title} class="w-full h-full" />
</BackdropModal>
