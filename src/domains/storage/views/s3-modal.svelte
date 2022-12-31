<!-- <script lang="ts">
  import { onMount } from 'svelte'
  import BackdropModal from '../../../components/backdrop/backdrop-modal.svelte'

  import { closeModal } from '../../../components/backdrop/BackdropStore2'
  import Button from '../../../components/button/button.svelte'
  import Divider from '../../../components/divider/divider.svelte'
  import Input from '../../../components/input/input.svelte'

  import List from '../../../components/list/list.svelte'
  import Row from '../../../components/row/row.svelte'
  import { showToast } from '../../../components/toast/ToastStore'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
import appConfig from '../../../config/appConfig';
  import { Interact } from '../../../store/interact'
  import { Lang } from '../../../store/lang'
  import { wait } from '../../../utils/tick/tick'
  import { switchToLocal } from '../../settings/settings-functions'
  import { trackEvent } from '../../usage/stat-ping'
  import { DEFAULT_S3_FOLDER, S3ConnectionType, saveS3Connection, testS3Connection } from '../engines/engine.s3'

  export let id: string
  export let props: any
  export let connection: S3ConnectionType | undefined

  let saved: boolean = false
  let workingConnection: S3ConnectionType = {}

  onMount(() => {
    if (connection) {
      workingConnection = { ...connection }
      workingConnection.folder = workingConnection.folder || DEFAULT_S3_FOLDER
      if (connection.validated) {
        saved = true
      }
    }
  })

  const close = () => {
    closeModal(id)
  }

  const save = async () => {
    try {
      workingConnection.validated = true
      await saveS3Connection(workingConnection)
      showToast({ message: 'S3 Storage Setup! Reloading...' })
      await trackEvent('storage-connected-s3')
      await wait(200)
      window.location.reload()
    } catch (e) {
      Interact.error(e)
    }
  }

  const test = async () => {
    try {
      const success = await testS3Connection(workingConnection)
      if (success) {
        Interact.alert('Success!')
        workingConnection.validated = true
      } else {
        throw new Error('Unable to Connect with the provided credentials')
      }
    } catch (e) {
      Interact.error(e)
    }
  }
</script>

<BackdropModal>
  <header slot="header" class="bg-white dark:bg-black">
    <ToolbarGrid>
      <Button disabled={!connection?.validated || !saved} slot="left" clear primary on:click={close}>
        {Lang.t('general.close', 'Close')}
      </Button>
      <h2 class="ntitle">S3 Connection</h2>
      <Button slot="right" clear primary on:click={test}>Test</Button>
    </ToolbarGrid>
  </header>
  <section class="trending  text-gray-500 py-4 px-2">
    <List transparent className="mb-4 px-2">
      <h1 class="font-bold">S3 Cloud Storage</h1>
      <p class="opacity-80 text-sm leading-tight">
        Connect to any <a href={appConfig.s3providersLink} class="underline" target="providers">S3 compliant storage providers</a> to access your data on multiple devices.
      </p>
    </List>

    <List solo>
      {#if workingConnection.validated}
        <Row className="items-center px-4 py-2">
          <div class="filler">Success</div>
          <Button on:click={() => save()} className="bg-green-500 text-white" size="sm">Save Connection</Button>
        </Row>
      {/if}
      <Input
        label="Server"
        listItem
        bind:value={workingConnection.server}
        help="e.g: https://s3.amazonaws.com"
        placeholder="Server Host"
      />
      <Divider left={16} />
      <Input
        listItem
        label="Bucket"
        bind:value={workingConnection.bucket}
        help="e.g: my-storage-bucket"
        placeholder="Bucket Name"
      />
      <Divider left={16} />
      <Input
        label="Folder"
        bind:value={workingConnection.folder}
        help="Folder to store the data inside of bucket"
        listItem
        placeholder="Folder Name"
      />
      <Divider left={16} />
      <Input
        label="Access Key"
        bind:value={workingConnection.access_key}
        help="e.g: AZ42342D323DDE3"
        listItem
        placeholder="Access Key"
      />
      <Divider left={16} />
      <Input
        label="Secret Key"
        bind:value={workingConnection.secret_key}
        help="e.g: 123412345123451234512345"
        listItem
        placeholder="Secret Key"
      />
      <Divider left={16} />
      <Input label="Region" bind:value={workingConnection.region} help="e.g: us-east-1" listItem placeholder="Region" />
    </List>
  </section>
  <div class="px-4 text-sm text-center py-2 text-gray-500">
    Stuck? <button on:click={() => switchToLocal()} class="text-primary-500 underline">Switch to Local →</button>
  </div>
  <div class="h-20" />
</BackdropModal> -->
