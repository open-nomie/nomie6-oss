<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { Lang } from '../../store/lang'
  import { firebaseAuth, signOutOfNomieCloud } from '../firebase/FirebaseStore'
  import LoginRegisterView from '../firebase/login-register-view.svelte'
  import { openLoginModal } from '../nomie-cloud/account/account-helper'
  import { Prefs } from '../preferences/Preferences'
  import { switchToLocal } from '../settings/settings-functions'
  import SubscriptionList from './SubscriptionList.svelte'
  export let id: string
  export let canClose: boolean = true
</script>

<BackdropModal>
  <ToolbarGrid slot="header">
    <div slot="left">
      {#if canClose}
        <Button
          clear
          primary
          slot="right"
          on:click={() => {
            closeModal(id)
          }}>{Lang.t('general.close', 'Close')}</Button
        >
      {/if}
    </div>
    <div slot="right">
      {#if firebaseAuth.currentUser}
        <Button
          clear
          primary
          on:click={() => {
            signOutOfNomieCloud(true)
          }}>Logout</Button
        >
      {:else}
        <Button
          clear
          primary
          on:click={() => {
            openLoginModal()
          }}>Login</Button
        >
      {/if}
    </div>
  </ToolbarGrid>
  <main class="p-4">
    {#if firebaseAuth.currentUser}
      <SubscriptionList solo outside title="Available Upgrades" />
      {#if $Prefs.storageType === 'firebase'}
        <button
          class="text-center w-full text-primary my-4 underline"
          on:click={() => {
            switchToLocal()
          }}>Switch to Local Storage</button
        >
      {/if}
    {:else}
      <h2 class="text-center mb-2">This action requires an account.</h2>
      <LoginRegisterView />
    {/if}
  </main>
</BackdropModal>
