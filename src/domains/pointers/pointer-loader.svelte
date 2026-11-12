<svelte:options runes={true} />

<script lang="ts">
import { onMount } from 'svelte'
import { AllTrackablesAsArray } from '../trackable/TrackableStore'
import { openPointersModal } from '../pointers/pointer-store'

let pointers: string | any[] = $state([])
let reminderCheckPeriod = $state(1000 * 5 * 2)
let modalview = $state(false)
let overdues = $state(false)
let interval: any = $state()

let toast = $derived(overdues)

const checkReminders = () => {
    if (!modalview) {
    const reminders =  pointers.filter((pointer) => {
        return pointer.ptr.reminder == true;})
    const remindermessages = pointers.filter((pointer) => {
        return pointer.ptr.reminder == true && new Date(pointer.ptr.reminderdate) < new Date();})
    if (remindermessages.length > 0 && toast == false) {overdues = true}
    }
}

  $effect(() => {
    if($AllTrackablesAsArray) {
      const trackables = $AllTrackablesAsArray
      pointers =  trackables.filter((trackable) => {
      return trackable.type == 'pointer';});
    }
  })

  onMount(async () => {
    const trackables = $AllTrackablesAsArray
    pointers =  trackables.filter((trackable) => {
    return trackable.type == 'pointer';
    
});
// Check every X minutes reminders
interval = setInterval(async () => {
    checkReminders()
  }, reminderCheckPeriod)
   
  })

  function delaymessage() {
    clearInterval(interval);
    // we will delay for 2 hours (1000 * 60 * 120)
    reminderCheckPeriod = 1000 * 60 * 120;
    interval = setInterval(async () => {
    checkReminders()
  }, reminderCheckPeriod)

    setTimeout(()=>{reminderCheckPeriod = 1000 * 5 * 2;interval = setInterval(async () => {
    checkReminders()
  }, reminderCheckPeriod)},1000 * 60 * 120 )

  }

  function close() {
    overdues = false;
    delaymessage()
  }

</script>

{#if toast}
  <div class="install-backdrop" style="z-index:8999">
    <div class="pwa-toast" role="alert">
      <div class="px-2 pb-2 mb-2 text-lg font-medium leading-snug text-black message">
          <h1 class="mb-2 text-2xl font-bold text-black">⚠️ Reminders!</h1>
          <p>Some reminders are overdue. Would you like to manage your reminders?</p>
      </div>

      <div class="flex items-center justify-end space-x-4">
        <button class="px-4 py-2 filler font-bold bg-white shadow-sm rounded-xl text-primary-600" on:click={close}>
          Later
        </button>

        
          <button
            aria-label="Update the App"
            on:click={() => {close();openPointersModal()}}
            class="px-4 py-2 font-bold filler bg-white shadow-sm rounded-xl text-primary-600"
          >
            Manage Now
          </button>
      </div>
    </div>
  </div>
{/if}

<style>
  .install-backdrop {
    @apply fixed;
    @apply top-0;
    @apply left-0;
    @apply right-0;
    @apply bottom-0;
    @apply flex;
    @apply flex-col;
    @apply justify-center;
    @apply items-center;
    @apply bg-gray-500;
    @apply bg-opacity-50;
    @apply flex-shrink-0;
    @apply flex-grow-0;
    @apply backdrop-filter backdrop-saturate-150 backdrop-blur-sm;
    padding-bottom: calc(env(safe-area-inset-bottom));
  }
  .pwa-toast {
    position: fixed;
    right: 0;
    bottom: 0;
    margin: 16px;
    min-width: 200px;
    @apply p-4;
    border: 1px solid #8885;
    @apply rounded-xl;
    z-index: 1;
    text-align: left;
    @apply shadow-xl;
    @apply bg-primary-500;
    @apply text-white;
    @apply rounded-xl;
  }
</style>