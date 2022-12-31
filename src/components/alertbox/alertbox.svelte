<script lang="ts">
  import Button from '../button/button.svelte'
  import Text from '../text/text.svelte'
  import type { AlertType } from '../../store/interact'
  import KeyDown from '../../modules/keyDown/keyDown.svelte'
  import { closeModal } from '../backdrop/BackdropStore2'
import Markdown from '../markdown/markdown.svelte'

  export let payload: AlertType
  export let id: string

  let hasSlot = false

  let showBase = false

  const methods = {
    onOk() {
      if (payload.onInteract) {
        payload.value = payload.value || true
        payload.onInteract(payload)
        closeModal(id)
      }
    },
    onCancel() {
      if (payload.onInteract) {
        payload.value = payload.value || false
        payload.onInteract(payload)
        closeModal(id)
      }
    },
  }
</script>

<KeyDown
  on:Escape={() => {
    methods.onCancel()
  }}
/>
<div class="alert-dialog-window card" role="alertdialog" aria-modal="true" aria-hidden={!showBase}>
  <div class="px-3 pt-3">
    {#if payload.title}
    <h2 role="alert" class="card-title {!hasSlot && !payload.message ? 'message-less' : 'has-message'}">
      {payload.title}
    </h2>
  {/if}

  {#if payload.message && !hasSlot}
    <div role="alert" class="card-body message">
      <Markdown content={payload.message} />
    </div>
  {:else if hasSlot && !payload.message}
    <div class="pt-0 slot-holder card-body">
      <slot />
    </div>
  {:else if hasSlot && payload.message}
    <div class="pt-0 slot-holder card-body">
      <Text size="sm">{payload.message}</Text>
      <slot />
    </div>
  {/if}
  <slot />
  </div>


  <div class="footer">
    <button
      id="alert-ok"
      aria-label={payload.ok}
      class="primary"
      on:click={methods.onOk}
    >
      {payload.ok}
    </button>
    {#if payload.cancel}
      <button
        id="alert-cancel"
        color="transparent"
        aria-label={payload.cancel}
        class="cancel"
        on:click={methods.onCancel}
      >
        {payload.cancel}
      </button>
    {/if}
  </div>
</div>

<!-- {#if showBase}
  <div
    class="full-screen alert-dialog {showDom === true ? 'visible' : 'hidden'}"
    aria-modal
    aria-hidden={!showDom}
    aria-label="Alert Dialog">
    
  </div>
{/if} -->
<style global lang="postcss">
  /* .alert-dialog {
    min-height: 200px;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 2200;
    background-color: var(--color-full-screen);
    display: flex;
    justify-content: center;
    align-items: center;
    transition: all 0.5s ease-in-out;
  } */
  .alert-dialog.visible {
    opacity: 1;
  }
  .alert-dialog.hidden {
    pointer-events: none;
    opacity: 0;
  }
  .alert-dialog.hidden .card {
    opacity: 0;
  }
  .alert-dialog-window.card {
    @apply bg-white dark:bg-black;
    @apply rounded-2xl;
    @apply flex-col;
    @apply m-2;
    @apply flex-grow-0;
    @apply flex-shrink;
    @apply space-y-2;
  

    transition: all 0.2s ease-in-out;
    max-width: 400px;
    max-height: 80vh;
    min-height: 100px;
    width: 200px;
    min-width: 300px !important;

    @apply bg-white dark:bg-black;
    border: solid 1px var(--color-faded-1);
    box-shadow: var(--box-shadow);
    display: flex;
    justify-content: stretch;
    align-content: stretch;
    color: var(--color-inverse-2);
  }
  .alert-dialog-window .card-title  {
    line-height: 115%;
    @apply text-gray-900 dark:text-gray-50;
    @apply font-bold;
    @apply text-base;
    @apply px-3;
    @apply leading-tight;
    @apply pt-1;
    @apply pb-px;
  }

  .alert-dialog-window input,
  .alert-dialog-window textarea {
    @apply focus:outline-none;

    @apply w-full;
    @apply bg-gray-200;
    @apply px-2;
    @apply mt-4;
    @apply rounded-lg;
    @apply focus:ring-2 ring-primary-500 ring-inset;
    @apply dark:bg-gray-800 dark:text-white;
  }
  .alert-dialog-window .message {
    @apply leading-tight;
    @apply text-sm;
    @apply pt-1;
  }

  .alert-dialog-window .card-body {
    @apply px-3;
    @apply text-sm;
    @apply leading-snug;
    @apply text-gray-700 dark:text-gray-400;
    flex-grow: 1;
    flex-shrink: 1;
    overflow-y: auto;
  }

  .alert-dialog-window .footer {
    @apply flex flex-col;
    @apply pt-2;
    
    /* @apply space-y-2; */
  }

  .alert-dialog-window .footer button {
    @apply flex;
    @apply w-full;
    @apply whitespace-nowrap;
    @apply line-clamp-1;
    @apply py-2;
    @apply text-base;
    @apply font-semibold;
    @apply border-t dark:border-gray-700 border-gray-300;
  }
  .alert-dialog-window .footer button.cancel {
    @apply text-red-500 dark:text-red-400
  }
  .alert-dialog-window .footer button.primary {
    @apply text-primary-500 dark:text-primary-400
  }
  .alert-dialog-window .footer button:last-child {
    @apply rounded-b-2xl;
    @apply pb-3;
    
  }
  .alert-dialog-window .btn-toolbar .btn {
    /* min-width: 100px; */
  }
</style>
