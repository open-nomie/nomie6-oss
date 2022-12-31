<script lang="ts">
	import { Prefs } from './../preferences/Preferences.ts';
  import Menu from '../../components/menu/menu.svelte'
  import { openRegisterModal, openLoginModal } from '../nomie-cloud/account/account-helper'
  import { switchToLocal } from '../settings/settings-functions'

  export let hideSwitcher: boolean = false
</script>

<div class="login-register-view px-2 pb-2 space-y-2">
  <Menu
    buttons={[
      {
        title: 'Login...',
        click() {
          openLoginModal()
        },
      },
      {
        title: 'Create Account...',
        click() {
          openRegisterModal()
        },
      },
    ]}
  />
  {#if $Prefs.storageType === 'firebase'}
    <Menu
      buttons={[
        {
          title: 'Switch to Local Storage',
          click() {
            switchToLocal()
          },
        },
      ]}
    />
  {/if}
</div>
