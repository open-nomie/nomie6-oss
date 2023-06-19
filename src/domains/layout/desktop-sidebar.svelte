<script lang="ts">
  import EaselOutline from '../../n-icons/EaselOutline.svelte'

  import RibbonOutline from '../../n-icons/RibbonOutline.svelte'

  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { openUnisearch } from '../../domains/search/UnisearchStore'

  import CalendarOutline from '../../n-icons/CalendarOutline.svelte'
  import { Lang } from '../../store/lang'

  import AppsOutline from '../../n-icons/AppsOutline.svelte'
  import AppsSolid from '../../n-icons/AppsSolid.svelte'
  //import BarChartSolid from '../../n-icons/BarChartSolid.svelte'
  //import BarChartOutline from '../../n-icons/BarChartOutline.svelte'
  import CubeOutline from '../../n-icons/CubeOutline.svelte'
  import CubeSolid from '../../n-icons/CubeSolid.svelte'

  import EaselSolid from '../../n-icons/EaselSolid.svelte'
  import RibbonSolid from '../../n-icons/RibbonSolid.svelte'
  import CalendarSolid from '../../n-icons/CalendarSolid.svelte'

  import { navigate } from 'svelte-navigator'
  import { Device } from '../../store/device-store'
  import SearchIcon from '../../n-icons/SearchIcon.svelte'
  import Dot from '../../components/dot/dot.svelte'
  import { RunningTimers } from '../tracker/TrackerStore'

  import { Prefs } from '../preferences/Preferences'

  import { GoalScoreStore } from '../goals/GoalStore'

  import LetterTicker from '../../components/letter-ticker/letter-ticker.svelte'
  import MenuOutline from '../../n-icons/MenuOutline.svelte'

  import Badge from '../../components/badge/badge.svelte'
  import CalendarNumberSolid from '../../n-icons/CalendarNumberSolid.svelte'
  import CalendarNumberOutline from './../../n-icons/CalendarNumberOutline.svelte'

  export let loggedIn: boolean = false

  let goalPercentage: number | undefined = undefined

  type NavType = {
    id: string
    path: string
    title: string
    icon: any
    activeIcon: any
    right?: {
      props: any
      component: any
    }
  }

  $: if ($GoalScoreStore[1]) {
    const _goalPercent = Math.round(($GoalScoreStore[0] / $GoalScoreStore[1]) * 100)
    if (!isNaN(_goalPercent)) {
      goalPercentage = _goalPercent
    }
  }

  const navigation: Array<NavType> = [
    {
      id: 'track',
      path: '/track',
      title: Lang.t('tabs.track', 'Track'),
      icon: AppsOutline,
      activeIcon: AppsSolid,
    },
    {
      id: 'timeline',
      path: '/timeline',
      title: Lang.t('tabs.timeline', 'Timeline'),
      icon: CalendarOutline,
      activeIcon: CalendarSolid,
    },
    {
      id: 'history',
      path: '/history',
      title: Lang.t('tabs.on-this-day', 'On This Day'),
      icon: CalendarNumberOutline,
      activeIcon: CalendarNumberSolid,
    },
    {
      id: 'dashboard',
      path: '/dashboard',
      title: Lang.t('tabs.dashboard-full', 'Dashboard'),
      icon: EaselOutline,
      activeIcon: EaselSolid,
    },
    {
      id: 'goals',
      path: '/goals',
      title: Lang.t('tabs.goals', 'Goals'),
      icon: RibbonOutline,
      activeIcon: RibbonSolid,
    },
    {
      id: 'analytics',
      path: '/analytics',
      title: Lang.t('tabs.analytics', 'Analytics'),
      icon: CubeOutline,
      activeIcon: CubeSolid,
    },
    // {
    //   id: 'awards',
    //   path: '/awards',
    //   title: Lang.t('tabs.awards', 'Awards'),
    //   icon: TrophyOutline,
    //   activeIcon: TrophySolid,
    // },
    {
      id: 'settings',
      path: '/settings',
      title: Lang.t('tabs.more', 'More'),
      icon: MenuOutline,
      activeIcon: MenuOutline,
    },
  ]
</script>

<aside
  class="desktop-sidebar bg-white dark:bg-gray-900 px-4 shadow-xl z-50"
  role="menu"
  aria-hidden="false"
  title="Nomie Navigation"
>
  <div class="p-4 flex justify-start items-center space-x-3 my-4">
    {#if loggedIn}
      <img src="/app-icons/nomie6-head-72.png" class="rounded-xl h-12 w-12" alt="app-logo" />
      <!-- <Logo size={22} className="-mt-2" /> -->
    {/if}
  </div>

  {#if loggedIn}
    {#each navigation as item}
      <a
        role="menuitem"
        href={item.path}
        on:click|preventDefault|stopPropagation={() => {
          navigate(item.path)
        }}
        class="nav-item ntitle {window.location.pathname == item.path ? 'current' : ''} {window.location.pathname ==
          '/' && $Prefs.startPage == item.id
          ? 'current'
          : ''}"
      >
        {#if item.path == '/' && $RunningTimers.length}
          <Dot size={8} className="absolute animate-pulse top-1 bg-red-500 ml-2" />
        {/if}

        <IonIcon icon={item.icon} className="inactive" />
        <IonIcon icon={item.activeIcon} className="active" />

        <div class="mr-2 link-title">
          {item.title}
        </div>
        {#if item.path == '/goals'}
          {#if goalPercentage}
            <Badge
              className={`${
                goalPercentage > 80
                  ? 'bg-green-300 text-green-900'
                  : goalPercentage > 49
                  ? 'bg-yellow-200 text-yellow-800'
                  : 'bg-red-200 text-red-800'
              }`}><LetterTicker text={`${goalPercentage}%`} /></Badge
            >
          {/if}
        {/if}
      </a>
    {/each}
    <div class="filler" />

    {#if Device.isDesktop()}
      <button
        on:click={() => {
          openUnisearch()
        }}
        class="focus:outline-none focus:ring-2 ring-primary-500 py-2 rounded-md flex items-center space-x-2 text-sm leading-tight px-4 text-left text-gray-500 my-10"
      >
        <IonIcon icon={SearchIcon} />
        <span>Super Search</span>
      </button>
    {/if}
  {:else}
    <div class="text-gray-500 px-4 h-full text-sm flex flex-col  justify-center space-y-4">
      <!-- <p class="font-bold dark:text-white text-black ">Welcome to Nomie 6!</p>
      <p>
        Nomie was created to enable neurodivergent people keep track of and monitor their lives in whichever way they
        like. Nomie doesn't put you in a box; instead, it adapts to your needs while keeping your information private.
      </p> -->
    </div>
  {/if}
</aside>

<style lang="postcss" global>
  .desktop-sidebar .nav-item {
    @apply px-4 py-2;
    @apply mb-2;
    @apply flex items-center;
    @apply focus:ring-2 ring-inset ring-primary-500;
    @apply outline-none;
    @apply rounded-lg;
    @apply duration-200 transition-all transform;
  }

  .desktop-sidebar .nav-item:active {
    @apply scale-95;
  }
  .desktop-sidebar .nav-item .ion-icon {
    /* @apply flex-grow-0 flex-shrink-0 flex items-center justify-center;
    @apply mr-4;
    @apply bg-gray-500 bg-opacity-10;
    @apply rounded-lg;
    @apply w-9 h-9; */
  }
  .desktop-sidebar .nav-item .ion-icon.inactive {
    @apply flex;
    @apply text-gray-500;
  }
  .desktop-sidebar .nav-item:hover {
    @apply bg-primary-500 bg-opacity-20;
  }
  .desktop-sidebar .nav-item .ion-icon.active {
    @apply hidden;
  }

  .desktop-sidebar .ion-icon {
    @apply mr-4;
  }

  .desktop-sidebar .nav-item.current {
    @apply bg-primary-500 bg-opacity-10;
  }

  .desktop-sidebar .link-title {
    @apply text-base;
    @apply font-medium;
  }

  .desktop-sidebar .nav-item.current .ion-icon.inactive {
    @apply hidden;
  }
  .desktop-sidebar .nav-item.current .ion-icon.active {
    @apply text-primary-500 bg-primary-500 bg-opacity-10 scale-105 transform;
    @apply flex;
  }

  .desktop-sidebar .nav-item svg {
    @apply h-5 w-5;
  }

  .desktop-sidebar {
    @apply w-56;
    @apply fixed top-0;
    @apply flex flex-col;
    @apply h-screen;
  }
</style>
