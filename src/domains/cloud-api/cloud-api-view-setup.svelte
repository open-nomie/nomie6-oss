<script lang="ts">
  import dayjs from 'dayjs'

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'

  import Input from '../../components/input/input.svelte'

  import List from '../../components/list/list.svelte'
  import { CloudAPIStore, deleteKey, registerKey, toggleAutoImport } from './CloudApiStore'
  import { Interact } from '../../store/interact'
  import { Device } from '../../store/device-store'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Spinner from '../../components/spinner/spinner.svelte'
  import ToggleSwitch from '../../components/toggle-switch/toggle-switch.svelte'
  import { Lang } from '../../store/lang'

  import Divider from '../../components/divider/divider.svelte'

  import { CopyOutline, TrashOutline } from '../../components/icon/nicons'

  let showAdvanced = false // toggle advanced usage in API textarea
  let editMode: boolean = false;
  const toggleEditMode = ()=>{
    editMode = !editMode;
  }
  let requesting = false
  const promptDeleteKey = async (key) => {
    const confirmed = await Interact.confirm(
      'Delete this key?',
      `Once deleted, any calls using this API key will fail and throw an error. This cannot be undone.`
    )
    if (confirmed) {
      await deleteKey(key)
    }
  }
  const requestNewKey = async () => {
    if (!requesting) {
      requesting = true
      await registerKey()
      requesting = false
    }
  }
</script>

<List outside solo title="API Keys" className="mb-4">
  <div slot="header-right">
    {#if !editMode}
    <Button on:click={toggleEditMode} primary size="sm">Edit</Button>
    {:else}
    <Button className="bg-red-500 text-white rounded-full" on:click={toggleEditMode} size="sm">Done</Button>
    {/if}
  </div>
  {#if $CloudAPIStore.keys.length === 0}
    <div class="text-sm p-8 text-center text-gray-800 dark:text-gray-200">
      <h1 class="font-medium leading-snug text-gray-500 ">
        Utilize services such as IFTTT.com, Zapier, and Apple Shortcuts to send data to Nomie via the API.
      </h1>
    </div>
  {/if}
  {#each $CloudAPIStore.keys as key, index}
    <Input inputStyle="font-size:12px !important;" placeholder={`Created ${dayjs(new Date(key.created)).fromNow()}`} listItem type="text" value={key.key}>
      <div slot="right" class=" flex items-center space-x-1">
        {#if !editMode}
        <Button icon clear on:click={() => Device.copy(key.key)}
          ><IonIcon icon={CopyOutline} className="text-black dark:text-white" /></Button
        >
        {:else}
        <Button icon clear on:click={() => promptDeleteKey(key)}
          ><IonIcon icon={TrashOutline} className="text-red-500" /></Button
        >
        {/if}
      </div>
    </Input>
  {/each}
  {#if $CloudAPIStore.keys.length < 3}
    <ListItem className="text-center" on:click={() => requestNewKey()} clickable>
      <div class="flex items-center w-full justify-center">
        {#if requesting}<Spinner size={20} />{/if}
        <span class="text-primary-500 ml-1">Create new API Key</span>
      </div>
    </ListItem>
  {/if}
</List>

<List solo outside>
  <ListItem>
    <p>{Lang.t('nomie-api.auto-import-description', 'Automically import notes from the API?')}</p>
    <ToggleSwitch title="Auto import"
      slot="right"
      on:change={(v) => {
        toggleAutoImport()
      }}
      value={$CloudAPIStore.autoImport}
    />
  </ListItem>
</List>

{#if $CloudAPIStore.keys && $CloudAPIStore.keys.length > 0}
  <List solo outside title="Example">
    <Input listItem type="text" value="{window.location.origin}/api/capture" label="POST URL" />
    <Divider center />
    <Input
      listItem
      label="POST Body Payload"
      type="textarea"
      inputClass="h-40"
      className="text-xs font-mono"
      value={`{
  "note": "Data Note! #mood(8)",
  "key": "${$CloudAPIStore.keys[0].key}"${
        showAdvanced
          ? `, 
  "created": "2022-05-30T14:28:01.433Z",
  "lat": 32.345,
  "lng": -81.324,
  "location": "Location Name",
  "score": 2
    `
          : ``
      }
}
  `}
    />
    <Divider center />
    <ListItem>
      Show Advanced Fields
      <ToggleSwitch title="Advanced Options"
        slot="right"
        value={showAdvanced}
        on:change={(evt) => {
          showAdvanced = evt.detail
        }}
      />
    </ListItem>
  </List>
{/if}
<div class=" p-4 text-xs text-center text-gray-500 ">
  Generate up to 3 API keys. If one of your keys is compromised, you'll have to destroy it and create a new one.
  <strong>Note: the API is for pulling data into Nomie, not to pushing data out of Nomie.</strong>
</div>
<div class="h-10" />
