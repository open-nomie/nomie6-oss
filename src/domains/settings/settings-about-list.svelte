<script lang="ts">
	import { LaunchCount } from './../preferences/LaunchCount.ts';
  import { navigate } from 'svelte-navigator'

  import { Device } from '../../store/device-store'
  import { LedgerStore } from '../ledger/LedgerStore'
  import { Lang } from '../../store/lang'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import { onMount } from 'svelte'
  import { TrackableStore } from '../trackable/TrackableStore'
  import { TrackerStore } from '../tracker/TrackerStore'
  import { PeopleStore } from '../people/PeopleStore'
  import { ContextStore } from '../context/context-store'
  import { LocationStore } from '../locations/LocationStore'
  import { openModal } from '../../components/backdrop/BackdropStore2'
  import WhatsNewModal from '../whats-new/whats-new-modal.svelte'

  let counts = {
    trackers: 0,
    people: 0,
    context: 0,
    locations: 0,
    total: 0,
  }

  onMount(() => {
    counts.trackers = Object.keys($TrackerStore).length
    counts.context = Object.keys($ContextStore).length
    counts.people = Object.keys($PeopleStore).length
    counts.total = Object.keys($TrackableStore).length
    counts.locations = $LocationStore.length
  })
</script>

<List solo className=" mb-3" title={Lang.t('settings.learn-more', 'Learn More')} outside>
  <!-- <ListItem bottomLine={16} detail title="Frequently Asked Questions" to="/faq">
    <span slot="right" class="text-inverse-3">FAQ</span>
  </ListItem> -->
  <ListItem bottomLine={16} detail title="N6 Docs" href="https://www.dailynomie.com/%f0%9f%93%96-docs/">
    <span slot="right" class="text-inverse-3">Read</span>
  </ListItem>
  <ListItem bottomLine={16} detail title="Learn More" href="https://www.dailynomie.com">
    <span slot="right" class="text-inverse-3">DailyNomie.com</span>
  </ListItem>

  <ListItem bottomLine={16} title="Reddit r/nomie" detail href="https://reddit.com/r/nomie">
    <span slot="right" class="flex text-inverse-3">/r/nomie</span>
  </ListItem>

  <!-- <ListItem title="Open Source" detail href="https://github.com/open-nomie/nomie">
    <span slot="right" class="flex text-inverse-3">GitHub</span>
  </ListItem> -->
</List>

<List solo className="mb-3" outside title="App">
  <ListItem bottomLine={16} title={Lang.t('general.first_log', 'First Log')}>
    <div class="" slot="right">
      {#await LedgerStore.getFirstDate(true)}
        Loading...
      {:then date}
        <div class="text-sm">{date.format('MMM YYYY')}</div>
      {/await}
      <!--  -->
    </div>
  </ListItem>
  <ListItem bottomLine={16} title={Lang.t('general.launch_count', 'Launch Count')}>
    <div class="" slot="right">
      {$LaunchCount}
    </div>
  </ListItem>

  <!-- <ListItem title={Lang.t('general.launch-count', 'Launch Count')}>
    <div class="flex" slot="right">
      <Button icon size="sm" on:click={UserStore.resetLaunchCount}>
        
      </Button>
      {$UserStore.launchCount}
    </div>
  </ListItem> -->
  <ListItem bottomLine={16} title={Lang.t('general.device', 'Device')}>
    <span slot="right">{$Device.device}</span>
  </ListItem>
  <ListItem bottomLine={16} title={Lang.t('general.platform', 'Platform')}>
    <span slot="right">{$Device.platform}</span>
  </ListItem>
  <ListItem bottomLine={16} title={Lang.t('general.pwa', 'PWA')}>
    <span slot="right">{$Device.pwa}</span>
  </ListItem>

  <ListItem bottomLine={16} title="UI Test" to="/test" detail />
  <ListItem><span class="text-gray-500 text-sm">Counts</span></ListItem>
  <ListItem bottomLine={16} title="Trackers">
    <div slot="right">{counts.trackers}</div>
  </ListItem>
  <ListItem bottomLine={16} title="People">
    <div slot="right">{counts.people}</div>
  </ListItem>
  <ListItem bottomLine={16} title="Context">
    <div slot="right">{counts.context}</div>
  </ListItem>
  <ListItem bottomLine={16} title="Locations">
    <div slot="right">{counts.locations}</div>
  </ListItem>
</List>

<List solo title="Version" outside className="mb-3">
  <ListItem
    bottomLine={16}
    title="Version {import.meta.env.PACKAGE_VERSION} "
    detail
    on:click={() => {
      openModal({
        id: 'whats-new',
        component: WhatsNewModal,
        position: 'bottom',
      })
    }}
  >
    <span slot="right" class="flex text-sm text-primary-500"> What's New </span>
  </ListItem>
  <ListItem
    detail
    title="Onboarded"
    on:click={() => {
      navigate('/setup')
    }}
  >
    <span slot="right" class="text-sm text-primary-500">
      {Lang.t('settings.redo-setup', 'Redo Setup')}
    </span>
  </ListItem>
</List>
