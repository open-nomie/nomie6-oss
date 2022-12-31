<script lang="ts">
  import Text from '@/components/text/text.svelte'
  // Components
  import Keypad from './keypad.svelte'
  // Stores
  import nid from '../../modules/nid/nid'
  import { Interact } from '../../store/interact'

  import { Lang } from '../../store/lang'
  import Button from '@/components/button/button.svelte'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CloseOutline } from '../../components/icon/nicons'
  import { onMount } from 'svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'

  let _pin = ''
  export let id: string
  export let onPin: Function
  export let title: string = 'Enter a Pin'
  export let canClose: boolean = false

  onMount(() => {
    _pin = ''
  })

  $: if (_pin.length > 6) {
    _pin = _pin.substring(0, 6)
  }

  const methods = {
    submit() {
      // encode the pin and send it up
      let final = _pin || ''
      if (final.length < 7 && final.length > 0) {
        onPin(nid(_pin))
        if (canClose) {
          closeModal(id)
        }
      } else {
        Interact.error('Pin must be between 1 and 6 characters')
      }
    },
    cancelInput() {
      closeModal(id)
    },
  }
</script>

<BackdropModal>
  <div
    aria-modal
    aria-label="Lock Screen"
    style="zIndex: 10000"
    class="lock-screen relative p-4 w-full rounded-xl shadow-xl 
    flex-col full-screen bg-primary-500"
  >
    <Text center size="sm" faded className="text-white mb-2">
      {Lang.t('settings.pin-requirements', '1 to 6 digits')}
    </Text>
    <h1>{title}</h1>

    <!-- Pin Display -->
    <div class="text-2xl text-white pin-holder ">
      {#each _pin.split('') as d}•{/each}
    </div>
    <!-- Keypad Input -->
    <Keypad bind:value={_pin} on:submit={methods.submit} />
    {#if canClose}
      <Button icon color="clear" className="pin-close-btn" ariaLabel="Cancel" on:click={methods.cancelInput}>
        <IonIcon icon={CloseOutline} size={32} />
      </Button>
    {/if}
  </div>
</BackdropModal>

<style global lang="postcss">
  .lock-screen h1 {
    color: #fff;
    margin-bottom: 20px;
    border-bottom: solid 1px rgba(255, 255, 255, 0.2);
    padding-bottom: 20px;
    width: 100%;
    text-align: center;
  }
  .lock-screen {
    @apply relative;
  }
  .lock-screen .pin-holder {
    @apply w-full;
    @apply text-center text-3xl;
    @apply bg-white bg-opacity-20;
    @apply flex items-center justify-center;
    @apply h-10;
    @apply rounded-lg;
    @apply mb-4;
  }
  .lock-screen .pin-close-btn {
    @apply absolute;
    @apply text-white;
    top: 20px;
    left: 20px;
  }
</style>
