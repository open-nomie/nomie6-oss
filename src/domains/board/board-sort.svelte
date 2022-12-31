<script lang="ts">
  import NItem from '../../components/list-item/list-item.svelte'

  import NToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  // Utils

  // Stores
  import { Lang } from '../../store/lang'
  import { Interact } from '../../store/interact'

  import Button from '../../components/button/button.svelte'
  import List from '../../components/list/list.svelte'

  import Text from '../../components/text/text.svelte'

  import { saveBoardsToStorage, UniboardStore } from './UniboardStore'

  import { CloseOutline, MenuOutline, RemoveCircleOutline } from '../../components/icon/nicons'
  import IonIcon from '../../components/icon/ion-icon.svelte'

  import { removeBoard } from './boardActions'
  import SortableList2 from '../../components/sortable-list/sortable-list2.svelte'
  import { showToast } from '../../components/toast/ToastStore'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

  export let id: string

  function boardsSorted(evt) {
    if (evt.detail instanceof Array) {
      const boards = evt.detail
      saveBoardsToStorage(boards)
      UniboardStore.update((b) => {
        b.boards = boards
        return b
      })
    }
  }
  async function deleteBoard(board) {
    let confirmed = await Interact.confirm(
      'Delete ' + board.label + ' tab?',
      "You can recreate it later, but it's not super easy."
    )
    if (confirmed === true) {
      removeBoard(board)

      showToast({ message: Lang.t('general.deleted', 'Deleted') })
    }
  }

  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal>
  <NToolbarGrid slot="header">
    <Button slot="left" on:click={close} icon primary><IonIcon icon={CloseOutline} size={28} /></Button>
    <div class="ntitle" slot="main">{Lang.t('board.organize-tabs', 'Organize Tabs')}</div>
    <div slot="right" />
  </NToolbarGrid>

  <List className="board-sort">
    <SortableList2
      bind:items={$UniboardStore.boards}
      handleClass=".menu-handle"
      direction="y"
      key="label"
      on:update={boardsSorted}
      let:item
    >
      {#if item.label !== 'all'}
        <NItem bottom-line className="bottom-line">
          <div slot="left" class="flex-shrink-off">
            <Button
              icon
              className="text-red-500"
              on:click={() => {
                deleteBoard(item)
              }}
            >
              <IonIcon icon={RemoveCircleOutline} />
            </Button>
          </div>
          <Text size="lg">{item.label}</Text>
          <div slot="right" class="menu-handle">
            <IonIcon icon={MenuOutline} />
          </div>
        </NItem>
      {/if}
    </SortableList2>
  </List>
</BackdropModal>

<style global>
  .board-sort .btn-group .btn {
    width: 36px;
  }
  .board-sort .emoji-only {
    font-size: 2.4em;
  }
</style>
