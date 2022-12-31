<script lang="ts">
  import Divider from './../../components/divider/divider.svelte'

  import Button from '../../components/button/button.svelte'
  // import Divider from '../../components/divider/divider.svelte'
  import { Lang } from '../../store/lang'

  import { closeModal } from '../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import { closeWritingPromptModal, openWritingPrompt, StaticWritingPrompts, WritingPrompt, WritingPromptStore, WritingPromptType } from './useWritingPrompts'
  import Toolbar from '../../components/toolbar/toolbar.svelte'
  import ButtonGroup from '../../components/button-group/button-group.svelte'
  import List from '../../components/list/list.svelte'
  import Input from '../../components/input/input.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import { showToast } from '../../components/toast/ToastStore'

  import { onMount } from 'svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'

  import TrashOutline from '../../n-icons/TrashOutline.svelte'
  import { Interact } from '../../store/interact'

  import type { DayPartUnit } from '../../modules/time/time'
  import Textarea from '../../components/textarea/textarea.svelte'
  import CreateOutline from '../../n-icons/CreateOutline.svelte'

  export let id: string

  export let editMode: boolean = false
  export let onSelect: (wp: WritingPrompt) => void | undefined
  let activeTimeframe: DayPartUnit | 'any' = 'any'

  let editing: WritingPrompt | undefined
  let canSave: boolean = false

  $: canSave = editing?.text?.length > 1 && editing?.time ? true : false

  const editPrompt = (prompt: WritingPromptType) => {
    editing = new WritingPrompt(prompt)
  }

  onMount(() => {})
  let prompts: Array<WritingPrompt> = []
  $: if ($WritingPromptStore && $WritingPromptStore.length) {
    initData()
  }

  const initData = () => {
    prompts = [...$WritingPromptStore]
  }

  const saveEditing = async () => {
    if (editing?.text.length > 1) {
      await WritingPromptStore.upsert(editing)
      editing = undefined
      showToast({ message: 'Saved' })
    }
  }

  const clicked = async (item) => {
    if (!editMode) {
      closeWritingPromptModal();
      openWritingPrompt(item);
      if(onSelect) onSelect(item);
    }
  }

  const deletePrompt = async (prompt: WritingPrompt) => {
    const confirmed = await Interact.confirm('Delete this Prompt?')
    if (confirmed) {
      await WritingPromptStore.remove(prompt)
      showToast({ message: 'Deleted' })
      initData()
    }
  }
</script>

<BackdropModal mainClass="px-2 lg:px-4">
  <header slot="header" class="bg-white dark:bg-gray-950 shadow-sm">
    <ToolbarGrid>
      <Button slot="left" on:click={() => closeModal(id)} clear primary>{Lang.t('general.close', 'Close')}</Button>
      <h1 class="ntitle">
        {Lang.t('general.writing-prompts', 'Writing Prompts')}
      </h1>
      <div slot="right">
        {#if editMode}
          <Button on:click={() => (editMode = false)} clear primary
            ><span class="text-red-500">{Lang.t('general.done', 'Done')}</span></Button
          >
        {:else}
          <Button on:click={() => (editMode = true)} clear primary>{Lang.t('general.edit', 'Edit')}</Button>
        {/if}
      </div>
    </ToolbarGrid>
    <Toolbar>
      <ButtonGroup
        className="bg-white dark:bg-black"
        size="sm"
        value={activeTimeframe}
        buttons={[
          {
            label: 'All',
            active: activeTimeframe == 'any',
            click: () => {
              activeTimeframe = 'any'
            },
          },
          {
            label: 'Morning',
            active: activeTimeframe == 'morning',
            click: () => {
              activeTimeframe = 'morning'
            },
          },
          {
            label: 'Afternoon',
            active: activeTimeframe == 'afternoon',
            click: () => {
              activeTimeframe = 'afternoon'
            },
          },
          {
            label: 'Evening',
            active: activeTimeframe == 'evening',
            click: () => {
              activeTimeframe = 'evening'
            },
          },
        ]}
      />
    </Toolbar>
  </header>

  {#if editing}
    <div
      class="p-4 lg:rounded-2xl absolute z-10 top-0 right-0 left-0 bottom-0 bg-black bg-opacity-30 backdrop-filter backdrop-blur-sm"
    >
      <List solo>
        <ListItem>
          <h1 class="font-bold text-lg">Create a Writing Prompt</h1>
        </ListItem>

        <Input type="select" listItem label="Time frame" bind:value={editing.time}>
          <option value="any">Anytime</option>
          <option value="morning">Morning</option>
          <option value="afternoon">Afternoon</option>
          <option value="evening">Evening</option>
        </Input>
        <Divider left={16} />
        <Textarea
          class="bg-white dark:bg-gray-900 text-black dark:text-white px-4 py-1 w-full focus:outline-none ring-inset focus:ring ring-primary-500 ring-opacity-20"
          placeholder="Writing Prompt"
          bind:value={editing.text}
        />
        <!-- <Input type="text" placeholder="Writing Prompt" listItem bind:value={editing.text} /> -->
        <Divider left={16} />
        <ListItem on:click={() => saveEditing()} clickable disabled={!canSave}>
          <div class="w-full text-center text-primary-500">Save Prompt</div>
        </ListItem>
        <!-- <Divider left={16} /> -->
        <ListItem
          clickable
          on:click={() => {
            editing = undefined
          }}
        >
          <div class="w-full text-center text-red-500">Cancel</div>
        </ListItem>
      </List>
    </div>
  {/if}

  <div class="h-4" />

  <List solo>
    {#each prompts.filter((prompt) => {
      // return true;
      if (activeTimeframe === 'any') {
        return true
      } else {
        return prompt.time == activeTimeframe
      }
    }) as item}
      <ListItem on:click={() => clicked(item)} bottomLine={16} detail={!editMode}>
        <p class="font-medium">{item.text}</p>
        <p class="text-gray-500 capitalize">{item.time}</p>
        <div slot="right" class="flex item-center space-x-1 -mr-2">
          {#if editMode}
            <Button
              on:click={() => {
                deletePrompt(item)
              }}
              className="text-red-500"
              icon><IonIcon icon={TrashOutline} /></Button
            >
            <Button icon on:click={() => editPrompt(item)}><IonIcon icon={CreateOutline} /></Button>
          {/if}
        </div>
      </ListItem>
    {/each}

    <ListItem
      on:click={() => {
        editPrompt({
          text: '',
          time: activeTimeframe,
        })
      }}
    >
      <span class="text-primary-500">Add Custom Prompt</span>
    </ListItem>
  </List>
  <div class="h-4" />
  <List solo>
    {#each StaticWritingPrompts.filter((prompt) => {
      // return true;
      if (activeTimeframe === 'any') {
        return true
      } else {
        return prompt.time == activeTimeframe
      }
    }) as item}
      <ListItem on:click={() => clicked(item)} bottomLine={16} detail={!editMode}>
        <p class="font-medium">{item.text}</p>
      </ListItem>
    {/each}
  </List>
  <div class="h-8" />
</BackdropModal>

<style lang="postcss">
</style>
