<script lang="ts">
  import { onMount } from 'svelte'

  import BackdropModal from '../../components/backdrop/backdrop-modal.svelte'
  import { closeModal } from '../../components/backdrop/BackdropStore2'

  import Button from '../../components/button/button.svelte'
  import IonIcon from '../../components/icon/ion-icon.svelte'
  import ListItem from '../../components/list-item/list-item.svelte'
  import List from '../../components/list/list.svelte'

  import SortableList2 from '../../components/sortable-list/sortable-list2.svelte'
  import ToolbarGrid from '../../components/toolbar/toolbar-grid.svelte'
  import nid, { md5 } from '../../modules/nid/nid'

  import type { ICondition } from '../../modules/scoring/score-tracker'
  import CloseOutline from '../../n-icons/CloseOutline.svelte'
  import MenuOutline from '../../n-icons/MenuOutline.svelte'
  import { Interact } from '../../store/interact'
  import { Lang } from '../../store/lang'

  import { wait } from '../../utils/tick/tick'
  import ConditionItem from './condition-item.svelte'
  import type { OpenScoreEditorProps } from './PositivityEditorStore'

  export let id: string
  export let props: OpenScoreEditorProps

  let workingCalc: Array<ICondition> = []
  let mounted = false

  const dedupCalcs = (base):Array<ICondition>=>{
    return base.filter((c,index)=>{
        let foundIndex = base.findIndex(fc=>fc.key==c.key);
        if(foundIndex > -1 && foundIndex !== index) {
          return false;
        } else {
          return true;
        }
      })
  }

  onMount(() => {
    if (props.calc.length) {
      workingCalc = dedupCalcs([...props.calc]
      .filter((c) => c)
      .map((calc) => {
        calc.key = md5(JSON.stringify(calc))
        return calc
      }));
    }

    if (workingCalc.length == 0) {
      addCondition()
    }
    mounted = true
  })

  const close = () => {
    closeModal(id)
  }

  const saveChanges = () => {
    if (props.onComplete) {
      props.onComplete(workingCalc)
      close()
    }
  }

  const refresh = async () => {
    mounted = false
    await wait(10)
    mounted = true
  }

  const addCondition = () => {
    
    let calc: any = {
      is: 'eq',
      sc: 1,
      v: 0,
      if: 'value',
    }
    calc.key = nid();
    // calc.key = md5(JSON.stringify(calc))
    workingCalc.push(calc)
    workingCalc = workingCalc
    refresh()
  }

  const removeCondition = async (condition: ICondition) => {
    const confirmed = await Interact.confirm('Remove this condition?')
    if (confirmed) {
      workingCalc = workingCalc.filter((w) => w !== condition)
    }
    refresh()
  }
</script>

<BackdropModal className="bg-gray-200 dark:bg-gray-800 h-full">
  <ToolbarGrid>
    <Button clear primary slot="left" on:click={close}>Cancel</Button>
    <h1 class="ntitle">
      {#if props.trackable}
        {props.trackable.label}
      {:else}
        Positivity Editor
      {/if}
    </h1>
    <Button clear primary slot="right" on:click={saveChanges}>Done</Button>
  </ToolbarGrid>
  <div class=" lg:px-2 md:px-1 py-4  filler">
    <List solo>
      {#if mounted}
        <SortableList2
          direction="y"
          bind:items={workingCalc}
          on:update={(evt) => {
            workingCalc = evt.detail
            refresh()
          }}
          handleClass="menu-handle"
          key="key"
          let:item
          let:index
        >
          <ConditionItem
            condition={item}
            {index}
            trackable={props.trackable}
            on:change={(evt) => {
              workingCalc[index] = evt.detail
              workingCalc = workingCalc;
              // refresh()
            }}
          >
            <Button slot="right" icon className="menu-handle">
              <IonIcon icon={MenuOutline} className="text-gray-500" />
            </Button>
            <Button slot="left" icon className="" on:click={() => removeCondition(item)}>
              <IonIcon icon={CloseOutline} className="text-gray-500" />
            </Button>
          </ConditionItem>
        </SortableList2>
      {/if}
    </List>
    <ListItem className="mt-2 pb-2" on:click={() => addCondition()}>
      <div class="text-center text-primary-500 pb-2">
        {Lang.t('score.add-condition', 'Add Condition')}...
      </div>
    </ListItem>
  </div>
  <div class="list-note">
    Add a single condition or a lot of them. The first thing that is true wins, and its score is used.
  </div>
  <ListItem />
</BackdropModal>
