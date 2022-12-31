<script lang="ts">
  import { onMount } from 'svelte'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CheckmarkCircle } from '../../components/icon/nicons'

  import ListItem from '../../components/list-item/list-item.svelte'

  import List from '../../components/list/list.svelte'

  import { showToast } from '../../components/toast/ToastStore'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import CloseOutline from '../../n-icons/CloseOutline.svelte'
  import CopyOutline from '../../n-icons/CopyOutline.svelte'
  import { Lang } from '../../store/lang'
  import copy from '../../utils/clipboard/clipboard'
  import { backupKeys, EncryptionStore, getKeyBackup, __getKeysAsString } from '../encryption/EncryptionStore'

  export let id: string

  let backup: any = undefined
  let visibleKeys: string
  let key: string

  const mounted = async () => {
    backup = await getKeyBackup()
    key = __getKeysAsString()
  }

  const toggleViewKeys = () => {
    if (visibleKeys) {
      visibleKeys = undefined
    } else {
      visibleKeys = __getKeysAsString()
    }
  }

  const close = () => {
    closeModal(id)
  }

  onMount(() => {
    mounted()
  })

  // $: if ($showEncryptionModal.show && !visible) {
  //   mounted()
  //   visible = true
  // } else if (!$showEncryptionModal.show && visible) {
  //   unmounted()
  //   visible = false
  // }
</script>

<BackdropModal className="bg-gray-100 dark:bg-gray-800 h-full">
  <ToolbarGrid slot="header">
    <Button on:click={close} slot="left" clear primary>{Lang.t('general.close', 'Close')}</Button>
    <h1 class="ntitle text-sm md:text-base">Manage Encryption</h1>
  </ToolbarGrid>

  <section class="p-1 lg:p-4 pt-6">
    <List outside solo>
      {#if !backup}
        <ListItem
          detail
          clickable
          on:click={() => {
            backupKeys($EncryptionStore.keyPair, false)
          }}
        >
          <div slot="left" class="text-red-500 animate-pulse text-2xl">⚠️</div>
          <h2 class="font-medium leading-tight">Security Phrase Needed</h2>
          <p>Please provide a passprhase</p>
        </ListItem>
      {:else}
        <ListItem
          detail
          clickable
          on:click={() => {
            backupKeys($EncryptionStore.keyPair, true, true)
          }}
        >
          <div slot="left" class=" text-2xl">
            <IonIcon icon={CheckmarkCircle} size={32} className="text-yellow-500" />
          </div>
          <h2 class="font-bold leading-tight">Keys Secured.</h2>
          <p class="text-gray-500 text-sm leading-tight">Your keys are backed up</p>
        </ListItem>
      {/if}
    </List>
    <p class="list-note mb-4 mt-1">
      <strong>What is this?</strong> Nomie creates a unique passphrase to encrypt your keys in Nomie Cloud, when you login
      on another device - provide the same answers, and your keys will be decrypted.
    </p>
    {#if key}
      <List solo outside>
        <ListItem bottomLine={18} clickable detail on:click={() => toggleViewKeys()}>View Keys</ListItem>

        {#if visibleKeys}
          <div class="bg-black w-full break-words text-gray-200 font-mono text-xs p-2 h-40 overflow-y-auto">
            {visibleKeys}
          </div>
          <!-- <Input
            type="textarea"
            inputClass="text-gray-600 dark:text-gray-400 h-40 text-xs p-1"
            listItem
            value={visibleKeys}
          /> -->
          <div class="flex items-center py-2 justify-between pl-4">
            <Button
              icon
              primary
              on:click={() => {
                toggleViewKeys()
              }}><IonIcon className="mr-1" size={28} icon={CloseOutline} /></Button
            >
            <Button
              size="sm"
              clear
              primary
              on:click={() => {
                copy(visibleKeys)
                showToast({ message: 'Copied to Clipboard', timeout: 1200 })
              }}><IonIcon className="mr-1" size={20} icon={CopyOutline} /> Copy</Button
            >
          </div>
        {/if}
        <div class="list-note">
          <strong class="text-red-500 font-extrabold">Warning:</strong> KEEP THIS PRIVATE! Never share it with anyone!
        </div>
      </List>
      <p class="text-xs px-4 py-3 text-gray-500">
        <strong>Rather do it manually?</strong>
        If you're rather not encrypt and backup your keys in Nomie Cloud, you can always copy the key and paste it in to
        Nomie on another device.
      </p>
    {/if}
  </section>
</BackdropModal>
