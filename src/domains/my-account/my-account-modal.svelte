<script lang="ts">
	import SubscriptionList from './SubscriptionList.svelte';
  
  import { sendPasswordResetEmail, updateProfile, verifyBeforeUpdateEmail } from 'firebase/auth'

  import Button from '../../components/button/button.svelte'
  // import Divider from '../../components/divider/divider.svelte'

  import Input from '../../components/input/input.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'

  import {
    firebaseAuth,
    signOutOfNomieCloud,
  } from '../firebase/FirebaseStore'

  import { showToast } from '../../components/toast/ToastStore'
  import { onMount } from 'svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { composeEmail } from '../../utils/text/text'


  import FirebaseSettings from '../firebase/firebase-settings.svelte'


  export let id: string

  let userEmail: string = ''
  let currentEmail: string = ''
  let displayName: string = ''

  onMount(() => {
    userEmail = firebaseAuth.currentUser.email
    currentEmail = firebaseAuth.currentUser.email
    displayName = firebaseAuth.currentUser.displayName || 'Unnamed'

   
  })

 

  const resetPassword = () => {
    if (userEmail) {
      sendPasswordResetEmail(firebaseAuth, userEmail)
      showToast({ message: 'Request sent. Check your email' })
    }
  }

  const changeEmail = async () => {
    const confirmed = await Interact.confirm(
      'Request to change your email?',
      'We will send a confirmation email to your current address before allowing this switch. If you need more help, please contact support@happydata.org'
    )
    if (confirmed) {
      let success = false
      verifyBeforeUpdateEmail(firebaseAuth.currentUser, userEmail)
        .then((e) => {
          success = true
          showToast({ message: 'Confirmation email send to the previous email address' })
        })
        .catch((e) => {
          Interact.error(e.message)
        })
        .finally(() => {
          if (!success) {
            Interact.error(`Unable to use that email. Please check that it is correct, or not already used.`)
          }
        })
    }
  }

  const setDisplayName = async () => {
    try {
      await updateProfile(firebaseAuth.currentUser, {
        displayName,
      })
      showToast({ message: 'Display Name updated' })
    } catch (e) {
      Interact.error(e.message)
    }
  }


  const close = () => {
    closeModal(id)
  }


</script>

<BackdropModal mainClass="px-2 lg:px-4">
  <ToolbarGrid slot="header">
    <Button slot="left" on:click={close} clear primary>{Lang.t('general.close', 'Close')}</Button>
    <h1 class="ntitle">
      {Lang.t('account.my-account', 'My Account')}
    </h1>
    <Button slot="right" on:click={() => signOutOfNomieCloud()} clear primary
      >{Lang.t('general.logout', 'Logout')}</Button
    >
  </ToolbarGrid>

  <section class="pt-4">
    <FirebaseSettings />
  </section>

  <section aria-label="Upgrades">
    <SubscriptionList solo outside title="Upgrades" />
  </section>
  <div class="h-10" />
  <section aria-label="Change Password">
    <List solo outside title={Lang.t('account.change-password', 'Change Password')}>
      <Input disabled type="email" placeholder="Email Address" bind:value={currentEmail} listItem label="Email Address">
        <Button slot="right" on:click={resetPassword} size="sm" primary clear className="whitespace-nowrap"
          >Send Reset</Button
        >
      </Input>
    </List>
    <p class="list-note">Provide your email, and we will send you an email to change your password</p>
  </section>

  <section aria-label="Delete Account">
    <List solo outside title={Lang.t('account.delete-account', 'Delete Account')}>
      <ListItem>
        <span class="text-sm">Account deletion is currently a manual process.</span>
        <Button
          slot="right"
          on:click={() => {
            composeEmail(`support@happydata.org`, `Cancel Account`, `AccountId: ${firebaseAuth.currentUser.uid}`)
          }}
          size="sm"
          primary
          clear
          className="whitespace-nowrap">Delete</Button
        >
      </ListItem>
    </List>
    <p class="list-note">Make sure you've canceled your Subscription first!</p>
  </section>
  <div class="h-4" />
</BackdropModal>

<!-- <section aria-label="My Account"> -->
<!-- <div class="pt-4" /> -->
<!-- <List solo outside>
      <Input
        type="text"
        on:focus={(evt) => {
          evt.detail.target.select()
        }}
        placeholder="Display Name"
        bind:value={displayName}
        listItem
        label="Display Name"
      >
        <div slot="right">
          {#if displayName !== 'Unnamed' && displayName !== firebaseAuth.currentUser.displayName && displayName.length > 1}
            <Button on:click={setDisplayName} size="sm" primary clear className="whitespace-nowrap">Set</Button>
          {/if}
        </div>
      </Input>
      <Divider left={16} />

      <Input
        type="email"
        on:focus={(evt) => {
          evt.detail.target.select()
        }}
        placeholder="Email"
        bind:value={userEmail}
        listItem
        label="Email"
      >
        <div slot="right">
          {#if userEmail !== 'Unnamed' && userEmail !== firebaseAuth.currentUser.email && userEmail.length > 5}
            <Button on:click={changeEmail} size="sm" primary clear className="whitespace-nowrap">Change</Button>
          {/if}
        </div>
      </Input>
    </List>
    <p class="list-note">Provide your email, and we will send you an email to change your password</p> -->

<!--  -->
<style lang="postcss">
  .section-break {
    @apply h-10 -mt-4 mb-4;
    @apply shadow-xl;
  }
</style>
