<svelte:options runes={true} />

<script lang="ts">
  import { onMount } from 'svelte'
  import { NomieServierStorage } from './engine.nomie-server'
  import Button from '../../../../components/button/button.svelte'
  import Input from '../../../../components/input/input.svelte'
  import Spinner from '../../../../components/spinner/spinner.svelte'
  import { wait } from '../../../../utils/tick/tick'
  import { Interact } from '../../../../store/interact'

  let server = $state<any>({
    url: null,
    token: null,
  })
  let error = $state<string | undefined>(undefined)
  let connecting = $state(false)
  let isConnected = $state(false)
  let storedUrl = $state('')
  let storedToken = $state('')

  onMount(() => {
    // Check if already connected
    storedUrl = localStorage.getItem('nomie-server-url') || ''
    storedToken = localStorage.getItem('nomie-server-token') || ''

    if (storedUrl && storedToken) {
      isConnected = true
      server.url = storedUrl
      server.token = storedToken
    }
  })

  const connect = async () => {
    if (!server.url || !server.token) {
      error = 'Server URL and API Token are required'
      return
    }

    error = undefined
    connecting = true
    await wait(200)
    try {
      // Pass a plain object to init, not the state proxy
      await NomieServierStorage.init({
        server: {
          url: server.url,
          token: server.token
        }
      })
      isConnected = true
      storedUrl = server.url
      storedToken = server.token
      if (onConnected) {
        onConnected()
      }
    } catch (e) {
      console.error(e)
      if (e instanceof Error) {
        error = e.message
      } else {
        error = String(e)
      }
    }
    connecting = false
  }

  const handleDisconnect = async () => {
    const confirmed = await Interact.confirm('Disconnect from Nomie Server?', 'You can always reconnect later.')
    if (confirmed) {
      localStorage.removeItem('nomie-server-url')
      localStorage.removeItem('nomie-server-token')
      isConnected = false
      server.url = null
      server.token = null
      storedUrl = ''
      storedToken = ''
    }
  }

  const maskToken = (token: string) => {
    if (token.length <= 8) return token
    return token.substring(0, 4) + '•••••••' + token.substring(token.length - 4)
  }

  const { onConnected } = $props()
</script>

<!-- <div class="p-4 md:p-6 text-center">
  <h2 class="text-2xl font-bold">Nomie Server</h2>
  <p class="text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
    Connect to a <a
      href="https://github.com/open-nomie/nomie-server"
      target="_blank"
      class="text-primary-500">Nomie Server</a
    > instance for storing your data.
  </p>
</div> -->
<div >
  {#if isConnected}
    <div class="p-4 bg-green-500/20 dark:bg-green-500/10 ">
      <div class="flex items-start justify-between">
        <div class="flex-1">
            <div class="flex justify-between items-center">
                <div class="text-sm font-semibold text-green-700 dark:text-green-300 mb-2">Connected</div>
                <button
                    on:click={handleDisconnect}
                    type="button"
                    class="text-xs px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors"
                    >
                    Disconnect
                    </button>
            </div>
          <div class="text-xs text-gray-600 dark:text-gray-400 space-y-1">
            <div><span class="font-medium">Endpoint:</span> {storedUrl}</div>
            <div><span class="font-medium">API Key:</span> {maskToken(storedToken)}</div>
          </div>
        </div>

      </div>
    </div>
  {:else}
    <form on:submit|preventDefault={connect} class="px-4">
      <Input bind:value={server.url} name="url" label="Server URL" required placeholder="https://your-server.com" />
      <hr class="dark:border-gray-600" />
      <Input
        bind:value={server.token}
        name="token"
        label="API Token"
        required
        placeholder="sk_live_..."

      />
      <hr class="dark:border-gray-600" />
      {#if error}
        <div class="p-2 bg-red-500/20 text-red-700 dark:text-red-300 rounded-md text-sm my-4">{error}</div>
      {/if}
      <div class="flex items-center justify-end my-4">
        {#if connecting}
          <Spinner />
          <span class="ml-2">Connecting...</span>
        {:else}
          <Button on:click={connect} type="submit" primary>Connect to Server</Button>
        {/if}
      </div>
    </form>
  {/if}
</div>