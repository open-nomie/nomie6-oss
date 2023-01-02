<script lang="ts">
  import { Router, Route } from 'svelte-navigator'
  import FileBrowser from './file-browser.svelte'
  // import DynamicPage from '../DynamicPage.svelte'
  // import Messages from './Messages.svelte'
  import Csv from './export/csv.svelte'

  // import Goals from './Goals.svelte'
  // import Track from './track.svelte'
  import { Prefs } from '../domains/preferences/Preferences'
  import RouteControl from './RouteControl.svelte'
  import Dashboard from './dashboard.svelte'
  import Track from './track.svelte'
  import Timeline from './Timeline.svelte'
  import Goals from './Goals.svelte'
  import Analytics from './Analytics.svelte'
  import Tests from './tests/tests.svelte'
  import Uoms from './Uoms.svelte'
  import Awards from './Awards.svelte'
  // import Language from './tests/language.svelte'
  import Faq from './faq.svelte'
  import History from './history.svelte'
  import Settings from './settings.svelte'
  import Export from './export.svelte'
  import Setup from './setup.svelte'
</script>

<Router>
  <RouteControl />
  <Route path="/">
    {#if $Prefs.startPage === 'track'}
      <!-- <Track /> -->
      <Track />
    {:else if $Prefs.startPage === 'dashboard'}
      <Dashboard />
    {:else if $Prefs.startPage === 'timeline'}
      <Timeline />
    {:else if $Prefs.startPage === 'history'}
      <Timeline />
    {:else if $Prefs.startPage === 'goals'}
      <Goals />
    {:else}
      <!-- <Track /> -->
      <Track />
    {/if}
  </Route>
  <Route path="/track">
    <!-- <Track /> -->
    <Track />
  </Route>
  <Route path="/analytics">
    <Analytics />
  </Route>

  <Route path="/timeline">
    <Timeline />
  </Route>
  <Route path="/goals">
    <Goals />
  </Route>
  <Route path="/test">
    <Tests />
  </Route>

  <Route path="/uoms">
    <Uoms />
  </Route>
  <Route path="/awards">
    <Awards />
  </Route>

  <!-- <Route path="/lang">
    <Language />
  </Route> -->
  <Route path="/dashboard">
    <Dashboard />
  </Route>
  <Route path="/faq">
    <Faq />
  </Route>
  <Route path="/history">
    <History />
  </Route>
  <Route path="/history/:date">
    <History />
  </Route>

  <Route path="/settings">
    <Settings />
  </Route>
  <Route path="/settings/export">
    <Export />
  </Route>
  <Route path="/settings/export/csv">
    <Csv />
  </Route>
  <Route path="/files/*path" let:params>
    <FileBrowser path={params.path} />
  </Route>
  <Route path="/setup">
    <Setup />
  </Route>
</Router>
