<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { CloseOutline } from '../../components/icon/nicons'

  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Toolbar from '../../components/toolbar/toolbar.svelte'

  import { Lang } from '../../store/lang'
  import { wait } from '../../utils/tick/tick'
  import { AwardStore, saveNewAwards } from './AwardsStore'

  export let id: string

  $: awardCount = $AwardStore.newAwards.length

  const close = async () => {
    await wait(200)
    AwardStore.update((s) => {
      s.newAwards = []
      return s
    })
    closeModal(id)
  }
</script>

<BackdropModal>
  <ToolbarGrid slot="header">
    <Button slot="left" type="icon" on:click={close}>
      <IonIcon icon={CloseOutline} size={28} className="text-primary-500" />
    </Button>
    <h1 class="ntitle">
      {awardCount == 1 ? Lang.t('awards.new-award', 'New Award!') : Lang.t('awards.new-awards', 'New Awards!')}
    </h1>
  </ToolbarGrid>

  {#if awardCount == 1}
    <main class="h-full flex items-center justify-center">
      <div class="award-badge text-center w-full">
        <img
          class="mx-auto w-52"
          src="/images/awards/{$AwardStore.newAwards[0].id}.svg"
          alt={$AwardStore.newAwards[0].name}
        />
        <div
          class="text-4xl my-4 font-bold  w-11/12 mx-auto relative text-gray-400 dark:text-gray-200  text-center leading-tight "
        >
          {$AwardStore.newAwards[0].name}
          {#if $AwardStore.newAwards[0].reason}
            <p class="text-gray-500 font-medium text-sm mt-2">Reason: {$AwardStore.newAwards[0].reason}</p>
            <p class="text-gray-500 font-medium text-xs opacity-60 mt-2">
              {$AwardStore.newAwards[0].getHash()}
            </p>
          {/if}
        </div>
      </div>
    </main>
  {:else}
    <main class="">
      <div class="grid grid-cols-2 lg:grid-cols-3 gap-2 p-4">
        {#each $AwardStore.newAwards as award, index}
          <div class="award-badge">
            <img src="/images/awards/{award.id}.svg" alt={award.name} />
            <div
              class="text-xs -top-2 w-11/12 mx-auto relative text-gray-400 dark:text-gray-200 rounded-full py-1 text-center line-clamp-1 leading-tight "
            >
              {award.name}
            </div>
          </div>
        {/each}
      </div>
    </main>
  {/if}
  <Toolbar slot="footer">
    <Button
      id="accept-award-button"
      className="w-full bg-primary-600 text-white font-bold"
      on:click={async () => {
        await saveNewAwards()
        close()
      }}
    >
      {Lang.t('general.close', 'Close')}
    </Button>
  </Toolbar>
</BackdropModal>
