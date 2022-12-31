<script lang="ts">
  import Modal2 from '../../../components/modal/modal2.svelte'
  import Panel from '../../../components/panel/panel.svelte'
  import ToolbarGrid from '../../../components/toolbar/toolbar-grid.svelte'
  import { onMount } from 'svelte'
  import { wait } from '../../../utils/tick/tick'
  import { closeUomEditor } from '../useUomModal'
  import Button from '../../../components/button/button.svelte'
  import { Lang } from '../../../store/lang'
  import Input from '../../../components/input/input.svelte'
  import List from '../../../components/list/list.svelte'
  import Divider from '../../../components/divider/divider.svelte'
  import type { UomType } from '../../../utils/nomie-uom/uoms'

  let visible: boolean = false
  let value: number = 123
  let uom: UomType = {
    type: 'custom',
    singular: 'My Uom',
    plural: 'My Uoms',
    symbol: 'my',
    symbolAffix: 'post',
  }

  // TODO: This is incomplete

  const mounted = async () => {
    wait(200).then(() => (visible = true))
  }

  // $: uomRendered = uomFormat(value, uom)

  const close = async () => {
    visible = false
    await wait(200)
    closeUomEditor()
  }

  onMount(mounted)
</script>

<Modal2 id="uom-modal" {visible}>
  <Panel className="h-full bg-gray-100 dark:bg-gray-900">
    <ToolbarGrid slot="header">
      <Button slot="left" primary clear on:click={() => close()}>
        {Lang.t('general.close', 'Close')}
      </Button>
      <h1 class="ntitle">Uom Editor</h1>
    </ToolbarGrid>

    <section aria-label="Unit of Measure Form">
      <List solo className="mb-4">
        <Input listItem type="text" bind:value={uom.singular} placeholder="Singular e.g Calorie" label="Singular" />
        <Divider center />
        <Input listItem type="text" bind:value={uom.plural} placeholder="Plural e.g Calories" label="Plural" />
        <Divider center />
        <Input listItem type="text" bind:value={uom.symbol} placeholder="Symbol e.g kcal" label="Symbol" />
        <Divider center />
        <Input listItem type="select" placeholder="Symbol Position" bind:value={uom.symbolAffix}>
          <option value="pre">Before</option>
          <option value="post">After</option>
        </Input>
      </List>

      <List solo>
        <Input listItem type="text" bind:value={uom.displayMath} placeholder="Value Calculation" label="Value Math" />
      </List>
      <div class="px-4 py-3 text-xs text-gray-500">
        <strong>Optional</strong> - Calculate a new display value based on the provided value. For example:
        <span class="math-examples">{`{value} * 1.5`} </span>
      </div>
    </section>

    <section aria-label="Preview" class="h-20 flex items-center justify-center font-bold font-2xl">
      {uomRendered}
    </section>
  </Panel>
</Modal2>

<style global lang="postcss">
  .math-examples {
    @apply bg-transparent;
    @apply px-1;
    @apply bg-white dark:bg-black;
    @apply text-sm;
    @apply h-6;
    @apply font-mono;
  }
</style>
