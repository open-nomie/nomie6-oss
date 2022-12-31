<script lang="ts">
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import Button from '../../../components/button/button.svelte'
  import Divider from '../../../components/divider/divider.svelte'
  import Input from '../../../components/input/input.svelte'
  import List from '../../../components/list/list.svelte'
  import { openPrivacyPolicy, openTermsOfService } from '../../../components/markdown-modal/MarkdownModalStore'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import { Lang } from '../../../store/lang'
  import { isEmail } from '../../../utils/text/text'
  import { uiCreateAccount } from '../../firebase/FirebaseStore'
  import { closeRegisterModal, openLoginModal } from './account-helper'

  // export let id: string
  // export let onRegister: Function

  let email: string = ''
  let password: string = ''
  let confirmPass: string = ''
  // let error: stirng | undefined = undefined
  let valid: boolean = false
  $: valid = isEmail(email) && password?.length > 5 && password == confirmPass
</script>

<BackdropModal>
  <ToolbarGrid>
    <Button clear primary slot="left" on:click={() => closeRegisterModal()}>
      {Lang.t('general.close', 'Close')}
    </Button>
    <h1 class="ntitle">Register</h1>
    <Button clear primary slot="right" on:click={() => {
      closeRegisterModal();
      openLoginModal();
    }}>
      {Lang.t('general.login', 'Login')}
    </Button>
  </ToolbarGrid>
  <main class="pb-2 pt-2 px-2 lg:px-4 dark:bg-gray-800 bg-gray-200">
    <div class="px-2 text-sm leading-tight mb-4 text-gray-600 dark:text-gray-400">
      Want to subscribe to Nomie Connect for the API or to unlock multiple plugins? Create your account here.
    </div>
    <List solo slot="under-plans" className="shadow-none">
      <div class=" rounded-lg">
        <Input
          bind:value={email}
          listItem
          type="email"
          name="email"
          placeholder="Email Address"
          label="Email Address"
        />
        <Divider center />
        <Input
          listItem
          bind:value={password}
          name="password"
          type="password"
          placeholder="Choose a Password"
          label="Password"
        />
        <Divider center />
        <Input
          listItem
          bind:value={confirmPass}
          name="password2"
          type="password"
          placeholder="Confirm Password"
          label="Confirm Password"
        />
      </div>

     
    </List>

    <div class="p-2 mt-2">
      <Button
        on:click={() => uiCreateAccount(email, password)}
        className="w-full text-white {valid ? 'bg-primary-500' : 'bg-gray-500'} "
        disabled={!valid}>Register</Button
      >
    </div>

    <div class="list-note">
      By creating this Nomie Cloud Account, you are stating that you've read to and agree with the <button
        class="underline text-primary-500"
        href="javascript:void()"
        on:click={() => {
          openTermsOfService()
        }}>Terms of Service</button
      >
      and
      <button
        class="underline text-primary-500"
        href="javascript:void()"
        on:click={() => {
          openPrivacyPolicy()
        }}>Privacy Policy</button
      >. They're pretty easy to read.
    </div>
  </main>
</BackdropModal>
