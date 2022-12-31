<script lang="ts">
  import { onMount } from 'svelte'

  import Button from '../../components/button/button.svelte'
  import Card from '../../components/card/card.svelte'
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import Spacer from '../../components/spacer/spacer.svelte'
  import Text from '../../components/text/text.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import Layout from '../../domains/layout/layout.svelte'

  import BaseLang from '../../lang/base'

  import download from '../../modules/download/download'
  import { SideStore } from '../../domains/storage/storage'

  import { Device } from '../../store/device-store'
  import { Interact } from '../../store/interact'

  import defaultsDeep from 'lodash/defaultsDeep'
  import BackButton from '../../components/back-button/back-button.svelte'
  import { Lang } from '../../store/lang'
  import { showToast } from '../../components/toast/ToastStore'

  const sideStore = new SideStore('language-editor')

  let baseLang = BaseLang
  let activeLang = { ...BaseLang }

  async function save() {
    sideStore.put('active-lang', activeLang)
    showToast({ message: Lang.t('general.saved', 'Saved') })
  }

  async function reset() {
    const confirmed = await Interact.confirm(`Clear ${activeLang.name} and start over?`)
    if (confirmed) {
      activeLang = { ...BaseLang }
      Device.scrollToTop()
    }
  }

  async function main() {
    let working = sideStore.get('active-lang')
    if (working) {
      activeLang.name = working.name || activeLang.name
      activeLang.author = working.author || activeLang.author
      activeLang.translation = defaultsDeep(working.translation || {}, activeLang.translation)
    }
  }

  async function send() {
    showToast({ message: 'Downloading...' })
    await download.json(`${activeLang.name}.lang.json`, activeLang)
    let confirmed = await Interact.confirm(
      'Compose Email to Brandon',
      `Shall I open an email to Brandon so you can send the file?`
    )
    if (confirmed) {
      window.open(`mailto:support@happydata.org?subject=New Language File&body=Attach downloaded file`, '_system')
    }
  }

  onMount(main)
</script>

<Layout showTabs={false}>
  <div slot="header">
    <ToolbarGrid>
      <div slot="left">
        <BackButton to="/settings" />
      </div>
      <div slot="main">
        <Text bold>Nomie Language</Text>
      </div>
      <div slot="right">
        <Button type="clear" on:click={save}>Save</Button>
      </div>
    </ToolbarGrid>
  </div>
  <Toolbar>
    <Spacer />
    Finished?
    <Button size="sm" className="ml-2" on:click={send} text>Send to Brandon</Button>
    <Spacer />
  </Toolbar>
  <main>
    <Card pad>
      <Text size="sm" leading2>
        Want to help translate Nomie? Translate the following items. Once finished hit Send to Brandon. You can hit
        "save" to save your progress locally.
      </Text>
    </Card>
    {#if activeLang}
      <Card pad title="Language Details">
        <Input compact placeholder="Language Name" bind:value={activeLang.name} />
        <Input compact placeholder="Author" bind:value={activeLang.author} />
      </Card>
      {#each Object.keys(baseLang.translation) as parentId}
        <Card pad title={parentId} className="my-2">
          {#each Object.keys(baseLang.translation[parentId]) as key}
            <Input
              compact
              className="mb-2"
              rows={4}
              type={(baseLang.translation[parentId][key] || '').length > 20 ? 'textarea' : 'text'}
              placeholder={`${key}: ${baseLang.translation[parentId][key]}`}
              bind:value={activeLang.translation[parentId][key]}
            />
          {/each}
        </Card>
      {/each}
    {/if}
    <ListItem className="my-4" on:click={reset}>
      <Text className="text-red">Reset Language</Text>
    </ListItem>
  </main>

  <div slot="footer" />
</Layout>
