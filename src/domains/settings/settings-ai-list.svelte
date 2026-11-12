<svelte:options runes={true} />

<script lang="ts">
  import { Prefs } from '../preferences/Preferences'
  import { Lang } from '../../store/lang'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import Input from '../../components/input/input.svelte'
  import Button from '../../components/button/button.svelte'
  import ToggleSwitch from '../../components/toggle-switch/toggle-switch.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import { ChevronDownOutline, ChevronUpOutline } from '../../components/icon/nicons'
  import NomieAiButton from '../../components/aibutton2/NomieAiButton2.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import type { AIServiceType } from '../preferences/Preferences'
  import { timeFrames } from '../dashboard2/widget/widget-timeframe'
  import { encryptValue, decryptValue } from '../../modules/crypto/crypto-storage'

  let config = $state({
    enabled: $Prefs.ai?.enabled || false,
    selectedService: ($Prefs.ai?.selectedService || 'claude') as AIServiceType,
    apiKey: '',
    defaultTimeframe: $Prefs.ai?.defaultTimeframe || 'last-30',
  })

  let isSaving = $state(false)
  let isExpanded = $state(false)
  let isEncrypted = $state(false)

  const services = [
    { label: 'Claude', value: 'claude' as AIServiceType },
    { label: 'OpenRouter', value: 'openrouter' as AIServiceType },
  ]

  const getServiceDocs = (service: AIServiceType) => {
    if (service === 'claude') {
      return 'Get your API key from console.anthropic.com'
    } else if (service === 'openrouter') {
      return 'Get your API key from openrouter.ai - Free models available (50 requests/day)'
    }
    return ''
  }

  $effect(() => {
    const service = $Prefs.ai?.services?.[config.selectedService]
    config.apiKey = service?.apiKey || ''
    isEncrypted = service?.encrypted || false
  })

  // Save enabled state immediately when toggled
  $effect(() => {
    Prefs.update((p) => {
      if (!p.ai) {
        p.ai = { enabled: false, selectedService: 'claude', services: {} }
      }
      p.ai.enabled = config.enabled
      return p
    })
  })

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

      let apiKeyToSave = config.apiKey
      let shouldEncrypt = false

      // If a PIN is set and API key is new (not already encrypted), encrypt it
      if ($Prefs.usePin && config.apiKey && !isEncrypted) {
        try {
          apiKeyToSave = await encryptValue(config.apiKey, $Prefs.usePin)
          shouldEncrypt = true
          showToast({
            message: 'API key will be encrypted with your PIN',
            type: 'info',
          })
        } catch (error) {
          showToast({
            message: 'Failed to encrypt API key: ' + (error as Error).message,
            type: 'error',
          })
          isSaving = false
          return
        }
      }

      Prefs.update((p) => {
        if (!p.ai) {
          p.ai = { enabled: false, selectedService: 'claude', services: {} }
        }
        if (!p.ai.services) {
          p.ai.services = {}
        }

        p.ai.enabled = config.enabled
        p.ai.selectedService = config.selectedService
        p.ai.defaultTimeframe = config.defaultTimeframe

        if (!p.ai.services[config.selectedService]) {
          p.ai.services[config.selectedService] = {}
        }
        p.ai.services[config.selectedService].apiKey = apiKeyToSave
        if (shouldEncrypt) {
          p.ai.services[config.selectedService].encrypted = true
        }

        return p
      })

      showToast({
        message: 'AI settings saved successfully',
        type: 'success',
      })
    } finally {
      isSaving = false
    }
  }

  const clearApiKey = () => {
    config.apiKey = ''
    isEncrypted = false
    Prefs.update((p) => {
      if (p.ai?.services?.[config.selectedService]) {
        p.ai.services[config.selectedService].apiKey = ''
        p.ai.services[config.selectedService].encrypted = false
      }
      return p
    })
    showToast({
      message: 'API key cleared',
      type: 'success',
    })
  }

</script>

<List solo className="mb-4" title={Lang.t('settings.ai', 'AI Integration')} outside>
  <ListItem bottomLine={16}>
    <span slot="left" class="flex items-center justify-center">
      <NomieAiButton size="30px" />
    </span>
    <div class="font-semibold leading-tight">
      {config.enabled ? 'AI Features Enabled' : 'AI Features Disabled'}
    </div>
    <div class="text-xs text-gray-500 line-clamp-2 leading-tight mt-1">
      {config.enabled ? `Using ${config.selectedService}` : 'Click to enable AI integration'}
    </div>
    <div slot="right" class="flex items-center gap-3">
      {#if config.enabled}
        <button
          type="button"
          class="p-1 hover:opacity-70 transition-opacity flex-shrink-0"
          on:click={() => (isExpanded = !isExpanded)}
          title={isExpanded ? 'Collapse' : 'Expand'}
        >
          <IonIcon icon={isExpanded ? ChevronUpOutline : ChevronDownOutline} size={20} />
        </button>
      {/if}
      <ToggleSwitch bind:value={config.enabled} />
    </div>
  </ListItem>

  {#if config.enabled && !$Prefs.usePin}
    <ListItem bottomLine={16}>
      <div class="w-full py-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
        <div class="flex gap-2">
          <span class="flex-shrink-0 text-lg">⚠️</span>
          <div class="flex-grow min-w-0">
            <p class="text-sm font-semibold text-red-900 mb-1">
              API Key Encryption Available
            </p>
            <p class="text-xs text-red-800 leading-tight">
              Your Nomie data always stays local on your device, which provides strong security. You can add an additional layer of protection by enabling a PIN in
              <span class="font-semibold">More Settings → Security → Use PIN</span>
              to encrypt your API key.
            </p>
          </div>
        </div>
      </div>
    </ListItem>
  {/if}

  {#if config.enabled && isExpanded}
    <Divider left={32} />

    <ListItem bottomLine={16}>
      <div class="w-full py-3">
        <label class="block text-sm font-semibold mb-3">Select AI Service</label>
        <ButtonGroup
          compact
          bind:value={config.selectedService}
          buttons={services.map((s) => ({
            label: s.label,
            value: s.value,
            disabled: s.disabled || false,
          }))}
        />
      </div>
    </ListItem>

    <Divider left={32} />

    <ListItem bottomLine={16}>
      <div class="w-full py-3">
        <label class="block text-sm font-semibold mb-2">API Key</label>
        <p class="text-xs text-gray-500 mb-3">{getServiceDocs(config.selectedService)}</p>
        {#if config.apiKey}
          {#if isEncrypted}
            <div class="flex items-center gap-2 mb-3 p-2 bg-green-100 dark:bg-green-900 rounded text-green-800 dark:text-green-200 text-xs">
              <span>✓</span>
              <span>API key is encrypted with your PIN</span>
            </div>
          {:else if $Prefs.usePin}
            <div class="flex items-center gap-2 mb-3 p-2 bg-yellow-100 dark:bg-yellow-900 rounded text-yellow-800 dark:text-yellow-200 text-xs">
              <span>⚠</span>
              <span>API key will be encrypted on next save</span>
            </div>
          {/if}
        {/if}
        <Input
          type="password"
          placeholder="Enter your API key"
          bind:value={config.apiKey}
          className="mb-3"
        />
        {#if config.apiKey}
          <Button size="sm" className="bg-gray-200 dark:bg-gray-800 mr-2" on:click={clearApiKey}>
            Clear Key
          </Button>
        {/if}
      </div>
    </ListItem>

    <Divider left={32} />

    <ListItem bottomLine={16}>
      <div class="w-full py-3">
        <label class="block text-sm font-semibold mb-3">Default Data Timeframe</label>
        <p class="text-xs text-gray-500 mb-3">Used for AI features that don't have their own timeframe</p>
        <select
          bind:value={config.defaultTimeframe}
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm"
        >
          {#each timeFrames as timeframe}
            <option value={timeframe.id}>{timeframe.label}</option>
          {/each}
        </select>
      </div>
    </ListItem>

    <Divider left={32} />

    <ListItem bottomLine={16}>
      <div class="w-full py-3">
        <Button
          primary
          disabled={isSaving || !config.apiKey}
          className="w-full"
          on:click={saveConfig}
        >
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </ListItem>
  {/if}
</List>
