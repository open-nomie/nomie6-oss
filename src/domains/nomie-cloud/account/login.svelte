<script lang="ts">
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../../components/backdrop/BackdropStore2'
  import Button from '../../../components/button/button.svelte'
  import Divider from '../../../components/divider/divider.svelte'
  import Input from '../../../components/input/input.svelte'

  import List from '../../../components/list/list.svelte'
  import { openPrivacyPolicy, openTermsOfService } from '../../../components/markdown-modal/MarkdownModalStore'
import { showToast } from '../../../components/toast/ToastStore';
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
import { Interact } from '../../../store/interact';
  import { Lang } from '../../../store/lang'
  import { isEmail } from '../../../utils/text/text'
  import { sendPasswordReset, uiSignIn } from '../../firebase/FirebaseStore'
  import { closeLoginModal, openRegisterModal } from './account-helper'

  export let id: string
  let email: string = ''
  let password: string = ''
  // let error: stirng | undefined = undefined
  let valid: boolean = false
  $: valid = isEmail(email) && password?.length > 5

  const doSignin = async () => {
    const signedIn = await uiSignIn(email, password)
    if (signedIn) {
      closeModal(id)
    }
  }

  const forgotPassword = async ()=>{
    const emailAddress = email || (await Interact.prompt('Email','What email was registered'));
    if(emailAddress) {
      try {
        await sendPasswordReset(emailAddress);
        showToast({ message: 'Check your email'})
      } catch(e) {
        Interact.error(`${e}`);
      }
      
    }
  }

</script>

<BackdropModal>
  <ToolbarGrid>
    <Button clear primary slot="left" on:click={() => closeLoginModal()}>
      {Lang.t('general.close', 'Close')}
    </Button>
    <h1 class="ntitle">Login</h1>
    <Button clear primary slot="right" on:click={() => {
      openRegisterModal();
      closeLoginModal();
    }}>
      {Lang.t('general.register', 'Register')}
    </Button>
  </ToolbarGrid>
  <main class="py-4 px-2 lg:px-4 dark:bg-gray-800 bg-gray-200">
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
          placeholder="Password"
          label="Password"
        >
        <button slot="right" title="forgot password" on:click={()=>{
          forgotPassword();
        }} class="text-primary-500 text-xs underline">Forgot?</button>
      </Input>
      </div>
     
     
      
    </List>
    <div class="list-note text-right">
     
    </div>
    <div class="py-4 px-2">
      <Button
        on:click={() => doSignin()}
        className="w-full text-white {valid ? 'bg-primary-500' : 'bg-gray-500'} "
        disabled={!valid}>Login</Button
      >
    </div>
    <div class="list-note">
      <button
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
        }}>Privacy Policy.</button
      > They're pretty easy to read.
    </div>
  </main>
</BackdropModal>
