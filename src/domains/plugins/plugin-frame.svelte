<script lang="ts">
  import { broadcastPluginMessage } from './PluginStore'

  import { Prefs } from '../preferences/Preferences'
  import type { PluginClass, PluginUseTypes } from './plugin-helpers'
  import { onMount } from 'svelte'
  import { wait } from '../../utils/tick/tick'

  export let plugin: PluginClass
  export let openAction: PluginUseTypes = 'onUIOpened'
  export let widgetindexparam: string = "";
  export let lid: string

  let registered: boolean = false

  let ready: boolean = false
  let mounted: boolean = false

  $: if (registered && !ready && mounted) {
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
                theme: $Prefs.theme,
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
  src={plugin.urlWithParams}{widgetindexparam}
  id="plugin-{lid}-{plugin.id}"
/>
