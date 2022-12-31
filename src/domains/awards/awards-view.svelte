<script lang="ts">
  import Layout from '../layout/layout.svelte'

  import BackButton from '../../components/back-button/back-button.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import Container from '../../components/container/container.svelte'
  import { AwardStore } from './AwardsStore'

  import AwardBadge from './components/award-badge.svelte'
</script>

<Layout>
  <header slot="header">
    <ToolbarGrid>
      <div slot="left">
        <BackButton to="/settings" />
      </div>
      <h1 class="ntitle">My Awards</h1>
    </ToolbarGrid>
  </header>
  <main class="h-full ">
    <Container className="py-4">
      <div class="px-4 grid grid-cols-3 gap-3">
        {#each $AwardStore.awards as award, index}
          <AwardBadge {award} />
        {/each}
      </div>
    </Container>
  </main>
</Layout>

<style global>
</style>
