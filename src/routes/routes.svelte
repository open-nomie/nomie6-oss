<script lang="ts">
  import { Router, Route } from 'svelte-navigator'
  import FileBrowser from './file-browser.svelte'
  import DynamicPage from '../DynamicPage.svelte'
  // import Messages from './Messages.svelte'
  import Csv from './export/csv.svelte'

  // import Goals from './Goals.svelte'
  // import Track from './track.svelte'
  import { Prefs } from '../domains/preferences/Preferences'
  import RouteControl from './RouteControl.svelte'
</script>

<Router>
  <RouteControl />
  <Route path="/">
    {#if $Prefs.startPage === 'track'}
      <!-- <Track /> -->
      <DynamicPage route="track" />
    {:else if $Prefs.startPage === 'dashboard'}
      <DynamicPage route="dashboard" />
    {:else if $Prefs.startPage === 'timeline'}
      <DynamicPage route="Timeline" />
    {:else if $Prefs.startPage === 'history'}
      <DynamicPage route="Timeline" />
    {:else if $Prefs.startPage === 'goals'}
      <DynamicPage route="Goals" />
    {:else}
      <!-- <Track /> -->
      <DynamicPage route="track" />
    {/if}
  </Route>
  <Route path="/track">
    <!-- <Track /> -->
    <DynamicPage route="track" />
  </Route>
  <Route path="/analytics">
    <DynamicPage route="Analytics" />
  </Route>
  <Route path="/api">
    <DynamicPage route="nomie-api" />
  </Route>
  <Route path="/timeline">
    <DynamicPage route="Timeline" />
  </Route>
  <Route path="/goals">
    <DynamicPage route="Goals" />
  </Route>
  <Route path="/test">
    <DynamicPage route="tests/tests" />
  </Route>
  <Route path="/cloud-api">
    <DynamicPage route="cloud-api-page" />
  </Route>
  <Route path="/uoms">
    <DynamicPage route="Uoms" />
  </Route>
  <Route path="/awards">
    <DynamicPage route="Awards" />
  </Route>
  <Route path="/messages">
    <DynamicPage route="messages" />
    <!-- <Messages /> -->
  </Route>
  <Route path="/lang">
    <DynamicPage route="tests/language" />
  </Route>
  <Route path="/dashboard">
    <DynamicPage route="dashboard" />
  </Route>
  <Route path="/faq">
    <DynamicPage route="faq" />
  </Route>
  <Route path="/history">
    <DynamicPage route="history" />
  </Route>
  <Route path="/history/:date">
    <DynamicPage route="history" />
  </Route>

  <Route path="/settings">
    <DynamicPage route="settings" />
  </Route>
  <Route path="/settings/export">
    <DynamicPage route="export" />
  </Route>
  <Route path="/settings/export/csv">
    <!-- <DynamicPage route="export/csv" /> -->
    <Csv />
  </Route>
  <Route path="/library/helper">
    <DynamicPage route="LibraryManager" />
  </Route>
  <Route path="/files/*path" let:params>
    <FileBrowser path={params.path} />
  </Route>
  <Route path="/setup">
    <DynamicPage route="setup" />
  </Route>
</Router>
