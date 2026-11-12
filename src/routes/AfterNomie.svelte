<svelte:options runes={true} />

<script lang="ts">

  import Layout from '../domains/layout/layout.svelte'

  import AnalyticsView from '../domains/afternomie/afternomie-view.svelte'

  import Toolbar from '../components/toolbar/toolbar.svelte'

  
</script>

<Layout pageTitle="AfterNomie">
  <Toolbar slot="header">
    <h1 class="ntitle w-full" style="text-align: center;">
      <span>AfterNomie</span>&nbsp;<span class="redText">BETA</span>
    </h1>
  </Toolbar>
  <AnalyticsView />
</Layout>

<style>
  .redText
  {
      color:rgb(33, 147, 214);
  }
  .blackText
  {
      color:black;
      font-weight:bold;
  }
</style>