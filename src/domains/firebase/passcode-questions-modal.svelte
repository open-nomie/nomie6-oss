<script lang="ts">
  import snakeCase from 'lodash/snakeCase'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import Input from '../../components/input/input.svelte'

  import List from '../../components/list/list.svelte'

  import Panel from '../../components/panel/panel.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { md5 } from '../../modules/nid/nid'
  import { Lang } from '../../store/lang'
  import { importKeysFromString } from '../encryption/EncryptionStore'

  export let id: string
  export let isFirst: boolean
  export let onChange: Function
  export let onCancel: Function
  export let canCancel: boolean = false

  const close = () => {
    closeModal(id)
    onCancel()
  }

  let favoriteFood: string = ''
  let cityOfBirth: string = ''
  let firstPet: string = ''

  let phrase = ''

  $: phrase = snakeCase(`food:${favoriteFood}-city:${cityOfBirth}-pet:${firstPet}`.toLowerCase())

  const onFinished = () => {
    if (phrase.length > 18) {
      // Hash this phrase
      const transatoryPassphrase = md5(phrase)
      // This phrase is passed to tweetncl as a basic password
      // tweetncl will then create an ecryption using a derived passphrase and the secret key
      onChange(transatoryPassphrase)
    }
  }
</script>

<BackdropModal>
  <Panel className="h-full">
    <ToolbarGrid slot="header">
      {#if canCancel}
        <Button
          slot="left"
          clear
          primary
          on:click={() => {
            close()
          }}
          title="Done">Cancel</Button
        >
      {/if}

      <h1 class="ntitle">Security Key</h1>
      <div slot="right">
        <Button clear />
      </div>
    </ToolbarGrid>
    <div class="px-3 py-3">
      <p class="px-2 text-base leading-snug text-gray-500 dark:text-gray-400 mb-4 text-center font-medium">
        {#if isFirst}
          <Title className="mb-2">Backup your secret key to the cloud</Title>
          <p class="text-sm leading-tight text-gray-500">
            Using a pass phrase, Nomie will encrypt your secret key and store it in your nomie cloud account.
          </p>
        {:else}
          <div class="mt-2 text-left text-lg text-black dark:text-white">Restore your secret key.</div>
        {/if}
      </p>
      <List solo className="mb-4">
        <Input
          listItem
          placeholder={Lang.t('passcodes.favorite-food', 'Favorite food as a child?')}
          bind:value={favoriteFood}
        />
        <Divider center />
        <Input
          listItem
          placeholder={Lang.t('passcodes.city-of-birth', 'City where you were born?')}
          bind:value={cityOfBirth}
        />
        <Divider center />
        <Input listItem placeholder={Lang.t('passcodes.first-pet', "First pet's name?")} bind:value={firstPet} />
        <Divider left={1} />
        <div class="py-1 px-2">
          <Button primary className="w-full" on:click={onFinished} disabled={phrase.length < 18} title="Done">
            {#if isFirst}
              Save
            {:else}
              Restore Secret Key
            {/if}
          </Button>
        </div>
      </List>
      <div class="h-4" />
      <!-- <ListItem>
        <strong>Passprase</strong>:<br />
        {phrase || 'Unset'}
      </ListItem> -->
      <p class="list-helper mb-4 px-4 text-sm text-gray-500  dark:text-gray-400 leading-light">
        Managing your own keys? <button on:click={() => importKeysFromString()} class="text-primary-500"
          >Import your Secret Key</button
        >
      </p>
      <p class="list-helper px-4 text-sm text-gray-500  dark:text-gray-400 leading-light">
        This passphrase is never saved in any way. It allows you to use Nomie on many devices by encrypting your
        encryption keys. If you forget the answers, send an email to support@happydata.org for instructions on how to
        get your secret key from your device. If you do not have device, and you haven't saved an\s encrypted backup,
        sadly, your data is lost forever.
      </p>

      <div class="h-12" />
    </div>
  </Panel>
</BackdropModal>
