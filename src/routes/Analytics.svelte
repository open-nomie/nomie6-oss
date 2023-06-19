<script lang="ts">
  import Layout from '../domains/layout/layout.svelte'

  import AnalyticsView from '../domains/analytics/analytics-view.svelte'

  import Toolbar from '../components/toolbar/toolbar.svelte'

  
</script>

<Layout pageTitle="My Analytics">
  <Toolbar slot="header">
    <h1 class="ntitle w-full" style="text-align: center;">
      <span>My Analytics</span>&nbsp;<span class="redText">BETA</span>
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