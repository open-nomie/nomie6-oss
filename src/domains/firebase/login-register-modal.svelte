<script lang="ts">
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'

  import Container from '../../components/container/container.svelte'

  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import Panel from '../../components/panel/panel.svelte'
  import Title from '../../components/title/title.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Interact } from '../../store/interact'

  import { saveStorageType } from '../preferences/Preferences'
  import LoginRegisterView from './login-register-view.svelte'

  export let hideHeader: boolean = false
  export let hideSwitcher: boolean = false

  const switchToFree = async () => {
    const confirmed = await Interact.confirm('Switch to Local Device Only?', 'You can always go to the cloud later.')
    if (confirmed) {
      saveStorageType('local')
      window.location.href = '/'
    }
  }
</script>

<BackdropModal>
  <Panel className="h-full  min-h-full flex-grow bg-gray-100 dark:bg-gray-800">
    <header slot="header" class="px-4">
      {#if !hideHeader}
        <ToolbarGrid>
          <h1 class="ntitle w-full text-center">Account Required</h1>
        </ToolbarGrid>
      {/if}
    </header>
    <main class="">
      <LoginRegisterView {hideSwitcher} onSwitchToFree={() => switchToFree()} />
    </main>
    <footer slot="footer" />
  </Panel>
</BackdropModal>
