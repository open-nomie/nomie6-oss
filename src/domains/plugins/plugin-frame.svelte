<svelte:options runes={true} />

<script lang="ts">
  import { broadcastPluginMessage } from './PluginStore'

  import { Prefs } from '../preferences/Preferences'
  import type { PluginClass, PluginUseTypes } from './plugin-helpers'
  import { onMount } from 'svelte'
  import { wait } from '../../utils/tick/tick'

  interface Props {
    plugin: PluginClass
    openAction?: PluginUseTypes
    widgetindexparam?: string
    lid: string
  }

  const { plugin, openAction = 'onUIOpened', widgetindexparam = '', lid } = $props<Props>()

  let registered: boolean = $state(false)
  let ready: boolean = $state(false)
  let mounted: boolean = $state(false)

  // Determine actual theme when in auto mode
  function getActualTheme(): string {
    if ($Prefs.theme === 'auto') {
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
      }
      return 'light' // fallback
    }
    return $Prefs.theme
  }

  let actualTheme = $state(getActualTheme())

  // Update theme when system preference changes or Prefs change
  $effect(() => {
    actualTheme = getActualTheme()
    // Also listen to system theme changes
    if (typeof window !== 'undefined' && window.matchMedia && $Prefs.theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => {
        actualTheme = getActualTheme()
      }
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  })

  $effect(() => {
    if (registered && !ready && mounted) {
      ready = true
      plugin.url
      broadcastPluginMessage(
        {
          action: openAction,
          data: {},
        },
        plugin.id,
        lid
      )
    }
  })

  const broadcastReadystate = async () => {
    if (!registered) {
      await wait(200)
      broadcastPluginMessage(
        {
          action: 'registered',
          data: {
            ...plugin,
            ...{
              lid,
              user: {
                use24Hour: $Prefs.use24hour,
                useMetric: $Prefs.useMetric,
                useLocation: $Prefs.alwaysLocate,
                weekStarts: $Prefs.weekStarts,
                theme: actualTheme,
                language: $Prefs.language
              },
            },
          },
        },
        plugin.id,
        lid
      )
      setTimeout(() => {
        registered = true
      }, 200)
    }
  }

  onMount(() => {
    mounted = true
  })
</script>

<iframe
  on:error={(e) => {
    console.error({ e })
    plugin.hasError(`${e}`)
  }}
  on:load={(evt) => {
    broadcastReadystate()
  }}
  class="h-full w-full "
  title={plugin.name}
  src="{plugin.urlWithParams}{widgetindexparam}"
  id="plugin-{lid}-{plugin.id}"
/>
