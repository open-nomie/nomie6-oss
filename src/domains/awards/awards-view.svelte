<script lang="ts">
  import Layout from '../layout/layout.svelte'

  import BackButton from '../../components/back-button/back-button.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Container from '../../components/container/container.svelte'
  import { AwardStore } from './AwardsStore'

  import AwardBadge from './components/award-badge.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { RemoveCircleOutline } from '../../components/icon/nicons'
  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'

  const resetAll = async () => {
    var feedback = await Interact.confirm("Reset all Awards, they will be rebuild with next app restart")
    if (feedback){
      $AwardStore.awards = []
      $AwardStore.newAwards = []
      $AwardStore.ready = true
      await $AwardStore.chain.reset()
      $AwardStore.chain = undefined
    }
  }
</script>

<Layout>
  <header slot="header">
    <ToolbarGrid>
      <div slot="left">
        <BackButton to="/settings" />
      </div>
      <h1 class="ntitle">My Awards</h1>
      <div slot="right">
        <button
          class="{$Device.width < 399 ? 'nbtn-icon circle' : 'clear'} flex items-center text-primary-500"
          on:click={(evt) => resetAll()}
        >
          <IonIcon icon={RemoveCircleOutline} className="text-primary-500" />
          {#if $Device.width > 400}
            <span class="ml-2 text-primary-500">
              Reset All
            </span>
          {/if}
        </button>
      </div>
    </ToolbarGrid>
  </header>
  <main class="h-full ">
    <Container className="py-4">
      <div class="px-4 grid grid-cols-3 gap-3">
        {#each $AwardStore.awards as award }
          <AwardBadge {award} />
        {/each}
      </div>
    </Container>
  </main>
</Layout>

<style global>
</style>
