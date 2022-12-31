<script lang="ts">
  import type { Subscription } from '@stripe/firestore-stripe-payments'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import Button from '../../components/button/button.svelte'

  import Title from '../../components/title/title.svelte'

  import { Interact } from '../../store/interact'
  import PlanSelector from '../nomie-cloud/plan-selector.svelte'

  import { purchasePlan, signOutOfNomieCloud } from './FirebaseStore'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Container from '../../components/container/container.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import { Lang } from '../../store/lang'
  export let id: string
  export let canClose: boolean

  let plan: Subscription

  const checkout = () => {
    try {
      purchasePlan(plan)
    } catch (e) {
      Interact.error(e.message)
    }
  }
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
    <Button
      clear
      primary
      slot="right"
      on:click={() => {
        signOutOfNomieCloud()
      }}>Logout</Button
    >
  </ToolbarGrid>

  <Container className="px-4" size="lg">
    <div class="flex justify-between items-center">
      <div class="text-center w-full mb-6">
        <Title listHeader>Nomie Cloud Plans</Title>
        <p class="text-sm max-w-sm mx-auto leading-tight mt-1 px-2 text-gray-500">
          Nomie Cloud let's access your Nomie from any device - while still being end-to-end encrypted.
        </p>
      </div>
    </div>
    <PlanSelector
      buttonBypass={() => {
        checkout()
      }}
      on:change={(evt) => {
        plan = evt.detail
      }}
    />
    <div class="h-2" />

    <div class="text-center py-6">
      <span class="text-sm text-black dark:text-white"
        ><strong>Just getting started?</strong>
        <span class="text-primary-500 underline">Try the Free Local-Only Option instead...</span></span
      >
    </div>
  </Container>
</BackdropModal>
