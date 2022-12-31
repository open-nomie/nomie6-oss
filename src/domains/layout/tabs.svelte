<script lang="ts">
  import Dot from '../../components/dot/dot.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import Container from '../../components/container/container.svelte'

  // Vendors
  import { MessageStore } from '../messages/MessageStore'
  import { onMount } from 'svelte'

  // Components
  import AppTab from '../../components/app-tab/app-tab.svelte'

  import { Lang } from '../../store/lang'

  import NPaths from '../../paths'

  import { CloudAPIStore } from '../../domains/cloud-api/CloudApiStore'
  import {
    AppsOutline,
    AppsSolid,
    CalendarOutline,
    CalendarSolid,
    EaselOutline,
    EaselSolid,
    RibbonOutline,
    RibbonSolid,
    SettingsOutline,
    SettingsSolid,
  } from '../../components/icon/nicons'
  import { Prefs } from '../../domains/preferences/Preferences'
  import { Device } from '../../store/device-store'
  import { RunningTimers } from '../tracker/TrackerStore'
  import { GoalScoreStore } from '../../domains/goals/GoalStore'
  import MenuOutline from '../../n-icons/MenuOutline.svelte'

  export let className:string = "";

  const state = {
    mounted: false,
  }

  let path: string = '/'
  let page: 'track' | 'dashboard' | 'goals' | 'timeline' | 'history'
  $: if (state.mounted) {
    path = document.location.pathname
    if (path === '/' && $Prefs.startPage === 'track') {
      page = 'track'
    } else if (path === '/' && $Prefs.startPage === 'dashboard') {
      page = 'dashboard'
    } else if (path === '/' && $Prefs.startPage === 'goals') {
      page = 'goals'
    } else if (path === '/' && $Prefs.startPage === 'timeline') {
      page = 'timeline'
    } else if (path === '/' && $Prefs.startPage === 'history') {
      page = 'history'
    }
    if (page) {
      try {
        setTimeout(() => {
          document.querySelector(`.tab-${page} a`).setAttribute('aria-current', 'page')
        }, 500)
      } catch (e) {
        console.error(e)
      }
    }
  }

  onMount(() => {
    state.mounted = true
  })
</script>

{#if state.mounted && $Device.width < 900}
  <nav id="app-tabs" class="{className}">
    <Container size="sm">
      <div class="flex items-center w-full justify-items-stretch">
        <!-- <AppTab link={NPaths.routes.history()}  label={Lang.t('tabs.history', 'History')}>
          <IonIcon className="inactive" icon={CalendarOutline} />
          <IonIcon className="active" icon={CalendarSolid} />
        </AppTab> -->

        <AppTab
          id="timeline"
          className={page == 'timeline' ? 'start-page' : ''}
          link={'/timeline'}
          label={Lang.t('tabs.timeline', 'Timeline')}
        >
          <IonIcon className="inactive" icon={CalendarOutline} />
          <IonIcon className="active" icon={CalendarSolid} />
        </AppTab>

        <AppTab
          id="dashboard"
          className={page == 'dashboard' ? 'start-page' : ''}
          link={NPaths.routes.dashboard()}
          label={Lang.t('tabs.dashboard', 'Dash')}
        >
          <IonIcon className="inactive" icon={EaselOutline} />
          <IonIcon className="active" icon={EaselSolid} />
        </AppTab>

        <AppTab
          id="track"
          className={page == 'track' ? 'start-page' : ''}
          link="/track"
          
          label={Lang.t('tabs.track', 'Track')}
        >
          <IonIcon className="inactive" icon={AppsOutline} />
          <IonIcon className="active" icon={AppsSolid} />
          {#if $RunningTimers.length}
            <Dot size={8} className="absolute animate-pulse top-1 bg-red-500 ml-2" />
          {/if}
        </AppTab>

        <!-- <AppTab link={NPaths.routes.analytics()}  label={Lang.t('tabs.analytics', 'Stats')}>
          <IonIcon className="inactive" icon={BarChartOutline} />
          <IonIcon className="active" icon={BarChartSolid} />
        </AppTab> -->

        {#key $GoalScoreStore}
          <AppTab
            id="goals"
            className={page == 'goals' ? 'start-page' : ''}
            link={'/goals'}
            label={Lang.t('tabs.goals', ' Goals')}
            notify={$GoalScoreStore.join('/') !== '0/0' ? $GoalScoreStore.join('/') : undefined}
          >
            <IonIcon className="inactive" icon={RibbonOutline} />
            <IonIcon className="active" icon={RibbonSolid} />
          </AppTab>
        {/key}

        <AppTab id="settings" link={NPaths.routes.settings()} label={Lang.t('general.more', 'More')}>
          <IonIcon className="inactive" icon={MenuOutline} />
          <IonIcon className="active" icon={MenuOutline} />
          {#if $MessageStore.unseen}
            <Dot size={8} className="absolute top-1 bg-red-500 ml-2" />
          {/if}
          {#if $CloudAPIStore.fresh.length}
            <Dot size={8} className="absolute top-1 bg-red-500 ml-2" />
          {/if}
        </AppTab>
      </div>
    </Container>
  </nav>
{/if}

<style global lang="postcss">
  #app-tabs {
    --tab-height: 65px;
    height: calc(var(--tab-height) + env(safe-area-inset-bottom));
    padding-bottom: calc(env(safe-area-inset-bottom));
    display: flex;
    justify-content: space-between;
    align-items: stretch;
    @apply z-50;
    @apply pt-1;
    flex-shrink: 0;
    
  }

  .tab-wrap a {
    @apply opacity-80;
  }
  .tab-wrap a .active {
    @apply hidden;
  }
  .tab-wrap a[aria-current='page'] {
    @apply opacity-100;
  }
  .tab-wrap a[aria-current='page'] .active {
    @apply inline-flex;
  }
  .tab-wrap a[aria-current='page'] .inactive {
    display: none !important;
  }
  #app-tabs.compact {
    --tab-height: 55px;
    height: calc(var(--tab-height) + env(safe-area-inset-bottom));
  }
  #app-tabs.compact .n-row {
    max-height: var(--tab-height);
    min-height: var(--tab-height);
    height: var(--tab-height);
  }
  #app-tabs .n-row {
    z-index: 10;
    max-height: var(--tab-height);
    min-height: var(--tab-height);
    height: var(--tab-height);
    flex-shrink: 0;
  }
  #app-tabs .notification {
    position: absolute;
    top: 8px;
    right: calc(50% - 15px);
    width: 6px;
    height: 6px;
    background-color: var(--color-red);
    border-radius: 3px;
  }
</style>
