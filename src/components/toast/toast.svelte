<script lang="ts">
  import { fade, fly } from 'svelte/transition'
  // import { flip } from 'svelte/animate'
  import { removeToast, ToastType } from './ToastStore'
  import { onDestroy, onMount } from 'svelte'
  import math from '../../utils/math/math'
  import ProgressBar from '../progress-bar/progress-bar.svelte'
  import IonIcon from '../icon/ion-icon.svelte'
  import CloseOutline from '../../n-icons/CloseOutline.svelte'
  import CloseCircleOutline from '../../n-icons/CloseCircleOutline.svelte'
  import CheckmarkCircleOutline from '../../n-icons/CheckmarkCircleOutline.svelte'

  export let toast: ToastType

  let timer: number = 0
  let clearInterval: any
  let percentage: number = 0
  $: if (toast) {
    percentage = math.percentage((toast.timeout || 3000) - 200, timer)
  }

  onMount(() => {
    if (toast) {
      timer = 0
      clearInterval = setInterval(() => {
        timer = timer + 100
        if (timer >= toast.timeout) {
          percentage = 100
          try {
            clearInterval()
          } catch (e) {}
        }
      }, 100)
    }
  })
  onDestroy(() => {
    try {
      clearInterval()
    } catch (e) {}
  })
</script>

{#if toast}
  <div role="dialog" in:fade out:fly={{ y: 100 }} class="toast-wrapper transition-all duration-200">
    {#if toast.type === 'success'}
      <div class="toast-type success">
        <IonIcon icon={CheckmarkCircleOutline} size={24} />
      </div>
    {:else if toast.type === 'failure'}
      <div class="toast-type failure">
        <IonIcon icon={CloseCircleOutline} size={24} />
      </div>
    {/if}
    <div
      on:click={() => {
        removeToast(toast)
      }}
      class="toast"
    >
      <p class="filler line-clamp-3 leading-tight text-sm">{toast.message}</p>
      {#if toast.buttonLabel}
        <button
          on:click|preventDefault|stopPropagation={() => {
            toast.buttonClick()
            removeToast(toast)
          }}
          class="text-primary-500 uppercase font-semibold text-sm px-2 py-1 rounded-full focus:outline-none focus:ring-2 ring-primary-500"
        >
          {toast.buttonLabel}
        </button>
      {/if}
      {#if toast.timeout > 2500}
        <IonIcon icon={CloseOutline} className="text-gray-500 pr-2" />
      {/if}
    </div>
    {#if toast.buttonLabel}
      <div class="progress h-1 absolute bottom-1 left-1 right-1 overflow-hidden;">
        {#if percentage}
          <ProgressBar percentage={100 - percentage} className="bg-black h-1" barClass="h-1 bg-gray-800 w-full" />
        {/if}
      </div>
    {/if}
  </div>
{/if}

<style lang="postcss" global>
  .toast-type {
    @apply h-7 w-7 rounded-full bg-black;
    @apply absolute -top-2 -left-2;
    @apply flex items-center justify-center;
  }
  .toast-type svg {
    @apply h-7 w-7;
  }
  .toast-type.success {
    @apply text-green-500;
  }
</style>
