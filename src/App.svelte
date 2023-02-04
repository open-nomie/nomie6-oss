<script lang="ts">
  import UpdateAvailable from './components/update-available/update-available.svelte'

  // Svelte
  // import { Router, Route, navigate } from "svelte-routing";
  import Tailwindcss from './style/Tailwind.svelte'
  import './style/main.css'

  import { onMount } from 'svelte'

  // import DynamicPage from './DynamicPage.svelte'

  // Vendors
  import { gestures } from '@composi/gestures'
  import dayjs from 'dayjs'

  // Components
  import Confetti from './components/confetti/confetti.svelte'

  import DropdownMenu from './components/menu/dropdown-menu.svelte'

  // Domains
  import Interactions from './domains/interactions/interactions.svelte'

  import { Prefs, setDocumentTheme } from './domains/preferences/Preferences'

  // Utils

  import { wait } from './utils/tick/tick'

  // Storage
  import Storage from './domains/storage/storage'

  // Routes
  import RouterView from './routes/routes.svelte'

  // Stores
  import { Interact } from './store/interact' //  global alerts, popm../deprecated/commandertc

  import AppKeyCommands from './AppKeyCommands.svelte'

  import { showToast, ToastStore } from './components/toast/ToastStore'
  import Toasts from './components/toast/toasts.svelte'

  import Backdrop2 from './components/backdrop/backdrop2.svelte'
  import { BackdropStore2 } from './components/backdrop/BackdropStore2'

  import { bootCoreComponents, bootNomie } from './BootStore'

  import { TrackableStore } from './domains/trackable/TrackableStore'
  import { GoalStore, loadGoalsForToday } from './domains/goals/GoalStore'
  import { LedgerStore } from './domains/ledger/LedgerStore'
  import { loadToday } from './domains/usage/today/TodayStore'

  import { trackLaunch } from './domains/preferences/LaunchCount'
  import PluginLoader from './domains/plugins/plugin-loader.svelte'
  import { PluginStore } from './domains/plugins/PluginStore'
  import Setup from './domains/setup/setup.svelte'
  import locate from './modules/locate/locate'

  // initiailze gestures
  gestures()

  window['Feature'] = {
    beta() {
      $Prefs.betaFeatures = true
    },
  }

  /**
   * Day / Time Change Monitoring
   * Fire off the MinuteChecker30 every 30 minutes
   * This will check if the day changed
   */
  let todayCheckPeriod = 1000 * 60 * 2
  let todayCheckFormat = 'YYYY-MM-DD'
  // let todayKey = dayjs().format(todayCheckFormat)
  let todayKey = dayjs().format(todayCheckFormat)

  let loading = true
  let onBoarding: Boolean | undefined = undefined

  /**
   * Check if New Day
   * If the app is left open
   * we need to know when the day changes
   * so we can refresh the various views.
   */
  const checkIfNewDay = () => {
    let checkKey = dayjs().format(todayCheckFormat)
    // Compare now key to today key
    if (todayKey !== checkKey) {
      showToast({ message: `It's ${dayjs().format('dddd')}!` })
      // Set today key to check key
      todayKey = checkKey
      bootCoreComponents($TrackableStore.trackables)
      setTimeout(() => {
        boot()
        loadToday({
          knownTrackables: $TrackableStore.trackables,
          date: dayjs(),
        })
      }, 500)
    }
  }

  // Check every X minutes
  setInterval(() => {
    checkIfNewDay()
    // Check if the theme has Changed
    setDocParams()
  }, todayCheckPeriod)

  const hideSplashScreen = () => {
    document.querySelectorAll('.delete-on-app').forEach((d) => {
      d.classList.add('deleted')
      setTimeout(() => {
        d.remove()
      }, 500)
    })
  }

  const setDocParams = () => {
    setDocumentTheme($Prefs.theme)
  }
  // TODO: Migrate these away from the method.function name - to just function name
  window.addEventListener('load', async () => {
    setDocParams()
  })

  // Used to make sure that boards and trackers are loaded

  // Initialize Offline Queue regardless if we're offline
  // OfflineQueue.init()

  let mounted = false

  if (window.location.href.search(/\?bypass/gi) > -1) {
    $Prefs.storageType = 'local'
    window.location.href = '/'
  }

  $: if (mounted && !$Prefs.onboarded) {
    /**
     * If we're mounted, and no Storage Type
     * - go to Onboarding
     */
    onBoarding = !$Prefs.onboarded
    Interact.stopBlocker()
    loading = false
    hideSplashScreen()
  } else if (mounted && $Prefs.storageType) {
    /**
     * If Mounted and Storage Type set
     * - initialize Storage
     */

    wait(200).then(() => {
      hideSplashScreen()
    })

    /**
     * Fetch location onload if configured
     * This caches a location to speed up Log creation on some mobile devices
     */
    if ($Prefs.alwaysLocate) {
      // Get the Location
      locate().catch((e) => console.warn('Error fetching initial onload location', e))
    }

    Storage.init().then(async () => {
      // await initGoals()
      wait(2000).then(() => {
        checkGoals('storage-init')
        trackLaunch()
      })
    })
  }

  const checkGoals = async (caller) => {
    return loadGoalsForToday($GoalStore, $TrackableStore.trackables, { caller })
  }

  const boot = async () => {
    mounted = false
    loading = true
    mounted = true
    Interact.blocker('')
    try {
      await bootNomie($Prefs)
    } catch (e) {
      Interact.error(e.message)
    }
    Interact.stopBlocker()
    loading = false
  }

  let pluginsInitizlied: boolean = false

  onMount(async () => {
    await boot()

    // Initialize the Plugins
    PluginStore.init({})
    pluginsInitizlied = true

    LedgerStore.hook('onLogSaved', (res) => {
      setTimeout(() => {
        checkGoals('on-log-save')
      }, 3500)
    })
    LedgerStore.hook('onLogsDeleted', (res) => {
      setTimeout(() => {
        checkGoals('on-log-deleted')
      }, 3500)
    })
    if (document.location.pathname.search('/modal') > -1) {
      document.location.href = '/'
    }
  })
</script>

<Tailwindcss />

{#if onBoarding}
  <Setup />
  <!-- <DynamicPage route="setup" /> -->
{/if}

{#if !onBoarding && $Prefs.storageType && !loading}
  <RouterView />
{/if}

<!-- General Key Command Listener -->
<AppKeyCommands />

{#if $BackdropStore2.length}
  <Backdrop2 />
{/if}

<Interactions />

<UpdateAvailable />

{#if $Interact.confetti.show}
  <Confetti />
{/if}

{#if $ToastStore.length}
  <Toasts />
{/if}

<DropdownMenu />

<PluginLoader />

<div id="photo-holder" class="hidden" style="display:none">
  <img id="photo-holder-image " alt="avatar-holder" />
</div>

<style lang="postcss" global>
  .bg-primary-gradient,
  .priamry-gradient {
    @apply bg-gradient-to-tr from-primary-400 via-primary-500 to-indigo-600;
    text-shadow: 0px 2px 4px rgba(0, 0, 0, 0.24);
  }
</style>
