<svelte:options runes={true} />

<script lang="ts">
  import { Prefs } from '../preferences/Preferences'
  import { Lang } from '../../store/lang'
  import ListItem from '../../components/list-item/list-item.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Input from '../../components/input/input.svelte'
  import Button from '../../components/button/button.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import type { AIServiceType } from '../preferences/Preferences'

  let config = $state({
    enabled: $Prefs.ai?.enabled || false,
    service: $Prefs.ai?.service || ('claude' as AIServiceType),
    apiKey: $Prefs.ai?.apiKey || '',
  })

  let isSaving = $state(false)

  const services = [
    { label: 'Claude', value: 'claude' as AIServiceType },
    { label: 'ChatGPT', value: 'chatgpt' as AIServiceType },
  ]

  const getServiceDocs = (service: AIServiceType) => {
    if (service === 'claude') {
      return 'Get your API key from console.anthropic.com'
    } else if (service === 'chatgpt') {
      return 'Get your API key from platform.openai.com'
    }
    return ''
  }

  const saveConfig = async () => {
    isSaving = true
    try {
      if (config.enabled && !config.apiKey) {
        showToast({
          message: 'API key is required',
          type: 'error',
        })
        isSaving = false
        return
      }

      Prefs.update((p) => {
        p.ai = {
          enabled: config.enabled,
          service: config.service,
          apiKey: config.apiKey,
        }
        return p
      })

      showToast({
        message: 'AI settings saved',
        type: 'success',
      })
    } finally {
      isSaving = false
    }
  }

  const clearApiKey = () => {
    config.apiKey = ''
    Prefs.update((p) => {
      if (p.ai) {
        p.ai.apiKey = ''
      }
      return p
    })
    showToast({
      message: 'API key cleared',
      type: 'success',
    })
  }
</script>

<ListItem bottomLine={16} title="Enable AI Features">
  <div slot="right" class="pr-2">
    <input
      type="checkbox"
      bind:checked={config.enabled}
      class="w-5 h-5 accent-primary-500 cursor-pointer"
    />
  </div>
</ListItem>

{#if config.enabled}
  <ListItem bottomLine={16}>
    <div class="w-full">
      <label class="block text-sm font-semibold mb-2">AI Service</label>
      <ButtonGroup
        compact
        bind:value={config.service}
        buttons={services.map((s) => ({
          label: s.label,
          value: s.value,
        }))}
      />
    </div>
  </ListItem>

  <ListItem bottomLine={16}>
    <div class="w-full py-2">
      <label class="block text-sm font-semibold mb-2">API Key</label>
      <p class="text-xs text-gray-500 mb-2">{getServiceDocs(config.service)}</p>
      <Input
        type="password"
        placeholder="Enter your API key"
        bind:value={config.apiKey}
      />
      {#if config.apiKey}
        <Button size="sm" className="mt-2 bg-gray-200 dark:bg-gray-800" on:click={clearApiKey}>
          Clear Key
        </Button>
      {/if}
    </div>
  </ListItem>

  <ListItem bottomLine={16}>
    <div class="w-full py-2">
      <Button
        primary
        disabled={isSaving}
        className="w-full"
        on:click={saveConfig}
      >
        {isSaving ? 'Saving...' : 'Save Configuration'}
      </Button>
    </div>
  </ListItem>
{/if}
