<script lang="ts">
  import { onMount } from 'svelte'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import Button from '../../components/button/button.svelte'
  import Divider from '../../components/divider/divider.svelte'
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'
  import EmojiSelector from '../../components/emoji-selector/EmojiSelector.svelte'

  import { showToast } from '../../components/toast/ToastStore'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'

  import { Interact } from '../../store/interact'

  import { Lang } from '../../store/lang'
  import { wait } from '../../utils/tick/tick'
  import { PivotClass  } from './pivot-class'
  import { PivotStore } from './PivotStore'
  import { openPopMenu, PopMenuButton } from '../../components/pop-menu/usePopmenu'

  export let id: string
  export let pivot: PivotClass

  let name: string
  let emoji: string
  let days: number
  let workingPivot: PivotClass
  let emojiselector = false;

  let mounted = false
  $: if (pivot && mounted && !workingPivot) {
    workingPivot = new PivotClass(pivot)
    name = workingPivot.tag;
    emoji = workingPivot.emoji;
    days = workingPivot.days;

  }

  onMount(() => {
    mounted = true
  })

  const deletePivot = async () => {
    const confirmed = await Interact.confirm('Delete this pivot?', 'You can always recreate it later.')
    if (confirmed) {
      await PivotStore.remove(workingPivot)
      closeModal(id)
    }
  }

  const save = async () => {
    let newPivot = new PivotClass({
      id: workingPivot.id,
      tag: name,
      emoji: emoji,
      days:days,
      default:workingPivot.default,
      grouping: workingPivot.grouping,
      compactRows: workingPivot.compactRows,
      rowGroupBefore: workingPivot.rowGroupBefore,
      colGroupBefore: workingPivot.colGroupBefore,
      rendererName: workingPivot.rendererName,
      aggregatorName: workingPivot.aggregatorName,
      hiddenAttributes: workingPivot.hiddenAttributes,
      hiddenFromAggregators: workingPivot.hiddenFromAggregators,
      hiddenFromDragDrop: workingPivot.hiddenFromDragDrop,
      unusedOrientationCutoff: workingPivot.unusedOrientationCutoff,
      menuLimit: workingPivot.menuLimit,
      options: workingPivot.options,
    })
    newPivot.options.data = []
    Interact.blocker(`Saving ${workingPivot.tag} pivot...`)
    await PivotStore.upsert(newPivot)
    Interact.stopBlocker()
    showToast({ message: 'Pivot Saved' })
    close()
  }

  const selectemoji = async () => {
    await wait(100)
    emojiselector = true;
  }

  const selectdays = () => {
    let createlist = [{"title":"30 Days","checked":30==days,click() {
        if (days !== 30) {days = 30} },},
        {"title":"60 Days","checked":60==days,click() {
        if (days !== 60) {days = 60} },},
        {"title":"90 Days","checked":90==days,click() {
        if (days !== 90) {days = 90} },},
        {"title":"120 Days","checked":120==days,click() {
        if (days !== 120) {days = 120} },},
        {"title":"150 Days","checked":150==days,click() {
        if (days !== 150) {days = 150} },},
        {"title":"180 Days","checked":180==days,click() {
        if (days !== 180) {days = 180} },},
        {"title":"270 Days","checked":270==days,click() {
        if (days !== 270) {days = 270} },},
        {"title":"365 Days","checked":365==days,click() {
        if (days !== 365) {days = 365} },},
        {"title":"2 Years","checked":730==days,click() {
        if (days !== 730) {days = 730} },},
        {"title":"3 Years","checked":1095==days,click() {
        if (days !== 1095) {days = 1095} },}];
        
    const buttons:Array<PopMenuButton> = createlist;
    
    openPopMenu({
      id:"days-list",
      buttons,
    })
  }
  
  const close = () => {
    closeModal(id)
  }
</script>

<BackdropModal mainClass="px-2 lg:px-4 py-2 lg:py-4">
  <ToolbarGrid slot="header">
    <Button slot="left" primary clear on:click={close}>
      {Lang.t('general.close', 'Close')}
    </Button>

    <h1 class="ntitle capitalize">{emoji} {name} Pivot</h1>

    <Button slot="right" primary clear disabled={!name || !emoji} on:click={save}>
      {Lang.t('general.save', 'Save')}
    </Button>
  </ToolbarGrid>
  {#if emojiselector}
  <EmojiSelector
      on:emoji={(evt) => {
        emoji = evt.detail
        emojiselector = false
      }}
    />
  {/if}  
  <List solo>
    <ListItem clickable on:click={selectemoji}>
      <div class="py-2">Which Emoji?</div>
      <div slot="right">
        {#if emoji}
        <span class="text-primary-500">{emoji}</span>
        {:else}
          <span class="text-primary-500">Select</span>
        {/if}
      </div>
    </ListItem>
    <Divider left={16} />
    <Input
      type="text"
      value={name}
      on:input={(evt) => (name = evt.detail)}
      listItem
      label="Pivot Name"
      placeholder="Pivot Name"
    >
      <div slot="right" class="flex items-center space-x-2 whitespace-nowrap text-xs">
        {#if name && !emoji}
          <div class="text-gray-500">{name}</div>
        {:else if name && emoji}
        <div class="text-gray-500">{emoji}{name}</div>
        {/if}
        
      </div>
    </Input>
    <Divider left={16} />
    <ListItem clickable on:click={selectdays}>
      <div class="py-2">How Many Days of History?</div>
      <div slot="right">
        {#if days}
        <span class="text-primary-500">{days}</span>
        {:else}
          <span class="text-primary-500">Select</span>
        {/if}
      </div>
    </ListItem>
  </List>

  <Button clear className="text-red-500 mt-10 mx-auto text-sm" on:click={() => deletePivot()}>Delete Pivot</Button>
</BackdropModal>
