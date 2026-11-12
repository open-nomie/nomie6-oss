<svelte:options runes={true} />

<script lang="ts">
  import { untrack } from 'svelte'
  import ButtonGroup from '../../../../components/button-group/button-group.svelte'
  import Button from '../../../../components/button/button.svelte'
  import TinyColorPicker from '../../../../components/color-picker/tiny-color-picker.svelte'
  import Divider from '../../../../components/divider/divider.svelte'
  import IonIcon from '../../../../components/icon/ion-icon.svelte'
  import { AddIcon } from '../../../../components/icon/nicons'
  import Input from '../../../../components/input/input.svelte'
  import ListItem from '../../../../components/list-item/list-item.svelte'
  import List from '../../../../components/list/list.svelte'

  import ToggleSwitch from '../../../../components/toggle-switch/toggle-switch.svelte'
  import ToolbarGrid from '../../../../components/toolbar/toolbar-grid.svelte'
  import { objectHash } from '../../../../modules/object-hash/object-hash'
  import { tokenToTrackable } from '../../../../modules/tokenizer/tokenToTrackable'
  import { Interact } from '../../../../store/interact'
  import { Lang } from '../../../../store/lang'

  import TrackablePill from '../../../trackable/trackable-pill.svelte'
  import { TrackableStore } from '../../../trackable/TrackableStore'
  import { trackableToToken } from '../../../trackable/trackable-utils'
  import { upsertWidget } from '../../DashStore'
  import { WidgetClass } from '../widget-class'
  import { timeFrames } from '../widget-timeframe'
  import { getWidgetTypes, type IWidgetType } from '../widget-types'
  import { canSaveWidget } from '../widget-utils'
  // import { activeTypes } from '../widget-types'
  import type { WidgetEditorProps } from './useWidgetEditorModal'
  import WidgetTypeSelector from './widget-type-selector.svelte'
  import { selectTrackable } from '../../../trackable/trackable-selector/TrackableSelectorStore'
  import { isTruthy } from '../../../../utils/truthy/truthy'
  import { closeModal } from '../../../../components/backdrop/BackdropStore2'
  import BackdropModal from '../../../../components/backdrop/backdrop-modal.svelte'
  import CloseOutline from '../../../../n-icons/CloseOutline.svelte'
  import { PluginStore } from "../../../plugins/PluginStore";
  import Storage from '../../../../domains/storage/storage'
  import type { ITrackerType } from '../../../../modules/tracker/TrackerClass'

  let visible = $state(false)
  let editingWidget = $state<WidgetClass | undefined>(undefined)
  let processedWidgetId = $state<string | undefined>(undefined)

  const { props, id } = $props()

  let conditionalStyling = $state(false)
  let canSave = $state(false)

  $effect(() => {
    if (props.widget && props.widget.id !== processedWidgetId) {
      editingWidget = new WidgetClass(props.widget)
      visible = true
      processedWidgetId = props.widget.id
      if (isTruthy(editingWidget.compareValue)) {
        conditionalStyling = true
      }
    }
  })

  let widgetTypes = $state(getWidgetTypes($PluginStore));

  // Callback to handle widget type changes from child
  const handleWidgetTypeChange = (selectedType: IWidgetType) => {
    // Child already mutated widget, but we need to reassign to trigger Svelte 5 reactivity
    if (editingWidget) {
      // Preserve all existing properties and only update type and data
      // Keep conditional coloring settings (compareValue, compareOverColor, compareUnderColor)
      const newData = selectedType.data ? { ...selectedType.data } : (editingWidget.data || {})

      // Create new object to trigger binding reactivity, preserving all other properties
      editingWidget = { ...editingWidget, type: selectedType.id, data: newData }

      // Initialize pointer data if this is a pointer widget
      if (selectedType.id === "pointer" && !editingWidget.data?.pointersamples) {
        editingWidget.data = { ...editingWidget.data, pointersamples: 5 }
      }
    }
    // Force reactivity by incrementing a trigger
    updateTrigger = updateTrigger + 1
  }

  let updateTrigger = $state(0)

  // Compute activeType as derived value (no side effects)
  // Depends on updateTrigger to force re-evaluation when widget type changes
  let activeType = $derived.by(() => {
    const _ = updateTrigger // use trigger to create dependency
    return editingWidget?.type ? widgetTypes.find((wt) => wt.id === editingWidget.type) : undefined
  })

  // Separate effect for plugin side effect
  $effect(() => {
    // Depend on updateTrigger to re-run when widget type changes
    const _ = updateTrigger
    if (editingWidget?.type === "plugin") {
      pluginGetWidgets(editingWidget?.data?.pluginId);
    }
  })

  // Separate effect for pointer data initialization (fallback)
  $effect(() => {
    if (editingWidget?.type === "pointer" && (!editingWidget?.data || !editingWidget?.data?.pointersamples)) {
      editingWidget.data = {"pointersamples": 5}
    }
  })

  let lastWidgetHash = $state<string | undefined>(undefined)
  $effect(() => {
    // Explicitly depend on updateTrigger to re-run when widget type changes
    const _ = updateTrigger

    const currentHash = objectHash(editingWidget)
    const prevHash = untrack(() => lastWidgetHash)

    if (currentHash !== prevHash) {
      lastWidgetHash = currentHash
      try {
        canSave = canSaveWidget(editingWidget, widgetTypes);
      } catch (e) {
        console.error(e)
        canSave = false
      }
    }
  })

  let pluginWidgets = $state([]);
  async function pluginGetWidgets(pluginId:String) {
    let path = `plugins/${pluginId}/prefs.json`
    let data: any = undefined
    try {
      data = await Storage.get(path) || {widgets:[]};
      pluginWidgets = data.widgets || [];
      if (pluginWidgets == undefined || !validateWidgetParams(pluginWidgets)){pluginWidgets = [];}
    } catch (e) {
      console.error(e)
      pluginWidgets = [];
    }
  }

  function validateWidgetParams(widgets){
    let valid = true;
    let i = 0;
    while (i < widgets.length) {
    if (!widgets[i].emoji || !widgets[i].name || !widgets[i].widgetid || widgets[i].emoji =="" || widgets[i].name =="" || widgets[i].widgetid ==""){
      valid = false;
      }
      i++;
    }
    return valid;
  }

  const close = async () => {
    closeModal(id)
  }

  const localSelectTrackables = async (multiple: boolean) => {
    let selected
    if (editingWidget.type == 'habit') {
    selected = await selectTrackable('tracker','habit')}
    else {selected = await selectTrackable()}
    let token = trackableToToken(selected)
    editingWidget.token = token
    // Force reactivity update
    updateTrigger = updateTrigger + 1
  }

  const localSelectPointer = async (multiple: boolean) => {
    let selected
    selected = await selectTrackable('pointer')
    let pointer = trackableToToken(selected)
    editingWidget.pointer = pointer
    // Force reactivity update
    updateTrigger = updateTrigger + 1
  }

  const saveWidget = async () => {
    try {
      if([...activeType.requires, ...activeType.optional].indexOf('timeframe') === -1) {
        editingWidget.timeRange = undefined;
      }

      const widget = new WidgetClass($state.snapshot(editingWidget))

      if(props.onSave) {
        props.onSave(widget);
        await upsertWidget(widget).catch((e) => {
          throw e
        })
      } else {
        await upsertWidget(widget).catch((e) => {
          throw e
        })
      }
      close()
    } catch (e) {
      console.error('Save error:', e)
      Interact.error(e)
    }
  }
</script>

<BackdropModal mainClass="bg-gray-100 dark:bg-gray-800" className="bg-white dark:bg-black h-full">
  <div slot="header" class="bg-white dark:bg-black w-full">
    <ToolbarGrid>
      <Button slot="left" clear primary on:click={close}>{Lang.t('general.cancel', 'Cancel')}</Button>
      <h1 class="ntitle">Widget Settings</h1>
      <div slot="right">
        {#if canSave}
          <Button clear primary on:click={saveWidget}>
            {Lang.t('general.save', 'Save')}
          </Button>
        {:else}
          <Button clear primary disabled>
            {Lang.t('general.save', 'Save')}
          </Button>
        {/if}
      </div>
    </ToolbarGrid>

    <!-- Widget Type Selector -->
    <WidgetTypeSelector bind:widget={editingWidget} onWidgetTypeChange={handleWidgetTypeChange} {updateTrigger} />
  </div>

  <div class="h-4" />

  <main class="px-2">
    {#key updateTrigger}
      <!-- Select the Trackable if its required the by the active ttype  -->
      <List solo>
      {#if (activeType?.requires?.indexOf('token') > -1) || activeType?.optional?.indexOf('token') > -1}
        
        <ListItem
          on:click={() => {
            localSelectTrackables(activeType?.requires?.indexOf('tokens') > -1)
          }}
          className="h-16" >
          Trackable
          {#if !editingWidget?.token}
            <span class="opacity-50 text-black dark:text-white">
              {#if (activeType?.requires?.indexOf('token') > -1)}
                (required)
              {:else}
                (optional)
              {/if}
            </span>
          {/if}
          <div slot="right" class="flex items-center space-x-2">
            {#if !editingWidget?.tokens?.length}
              <div class="text-primary-500">{Lang.t('general.select', 'Select')}</div>
            {:else if editingWidget?.token}
              <TrackablePill size={28} hideValue trackable={tokenToTrackable(editingWidget.token, $TrackableStore.trackables)} />
              {#if (activeType?.requires?.indexOf('token') === -1)}
                <button class="flex items-center justify-center" on:click={()=>{editingWidget.token = undefined}}>
                  <IonIcon icon={CloseOutline} />
                </button>
              {/if}
            {/if}
          </div>
        </ListItem>
      {/if}

      <!-- Select Pointer if required-->
      {#if activeType && [...activeType.requires, ...activeType.optional].indexOf('pointer') > -1}
      <Divider left={18} />
      <ListItem
          on:click={() => {
            localSelectPointer(false)
          }}
          className="h-16" >
          Pointer
          {#if !editingWidget?.pointer}
            <span class="opacity-50 text-black dark:text-white">
              {#if (activeType?.requires?.indexOf('token') > -1)}
                (required)
              {:else}
                (optional)
              {/if}
            </span>
          {/if}
          <div slot="right" class="flex items-center space-x-2">
            {#if !editingWidget?.pointer}
              <div class="text-primary-500">{Lang.t('general.select', 'Select')}</div>
            {:else if editingWidget.pointer}
              <TrackablePill size={28} hideValue trackable={tokenToTrackable(editingWidget.pointer, $TrackableStore.trackables)} />
              {#if (activeType?.requires?.indexOf('token') === -1)}
                <button class="flex items-center justify-center" on:click={()=>{editingWidget.pointer = undefined}}>
                  <IonIcon icon={CloseOutline} />
                </button>
              {/if}
            {/if}
          </div>
        </ListItem>
      {/if}

      <!-- Select the timeframe if required -->
      {#if activeType && [...activeType.requires, ...activeType.optional].indexOf('timeframe') > -1}
        <Divider left={18} />
        {#if editingWidget}
        <Input listItem bind:value={editingWidget.timeRange} type="select" label="Timeframe">
          <div
            slot="left"
            class="{!editingWidget.timeRange
              ? 'pl-2 pt-3 w-full'
              : ''} text-black dark:text-white pointer-events-none absolute"
          >
            {#if !editingWidget.timeRange}
              {Lang.t('dashboard.select-a-timeframe', 'Select a Timeframe')}
            {/if}
          </div>
          <option>Select</option>
          {#each timeFrames as timeFrame}
            <option value={timeFrame.id}>{timeFrame.label}</option>
          {/each}
        </Input>
        {#if activeType && activeType.id == 'value' && editingWidget.timeRange && ['today', 'yesterday'].indexOf(editingWidget.timeRange) == -1}
          <Divider left={18} />
          <ListItem bg="transparent" title="Include Daily Average" className="pl-6">
            <div slot="right">
              <ToggleSwitch bind:value={editingWidget.includeAvg} />
            </div>
          </ListItem>
        {/if}
      {#if editingWidget?.type == "pointer"}
        <Divider left={18} />
        <ListItem>
          Samples: {editingWidget?.data?.pointersamples || 5}
          <div slot="right" style="flex: 1; padding-right: 1rem; display: flex; align-items: center; min-height: 48px; width: 200px;">
            {#if editingWidget?.data}
              <input
                type="range"
                min="1"
                max="8"
                value={editingWidget.data.pointersamples}
                on:input={(e) => {
                  editingWidget.data.pointersamples = parseInt(e.target.value)
                  updateTrigger = updateTrigger + 1
                }}
                step="1"
                style="width: 100%; height: 24px; cursor: pointer; -webkit-appearance: none; appearance: none; background: transparent; border: none; outline: none;"
              >
            {:else}
              <span style="color: #999; font-size: 12px;">initializing...</span>
            {/if}
          </div>
        </ListItem>
      {/if}
      <Divider left={18} />
      <ListItem>
        Size
        <ButtonGroup
          bind:value={editingWidget.size}
          buttons={[
            { value: 'sm', label: 'Small' },
            { value: 'md', label: 'Medium' },
            { value: 'lg', label: 'Large' },
          ]}
          slot="right"
        />
      </ListItem>
        {/if}
      {/if}
    </List>

    <!-- Just Note -->
    {#if activeType?.id == 'text'}
      <List solo className="mt-4">
        <Input listItem placeholder="Message" type="textarea" rows={2} bind:value={editingWidget.description} />
        <div class="text-gray-500 leading-tight px-4 text-sm pb-4">Leave yourself a positive message or something!</div>
      </List>
    {/if}

    
    <!-- Plugins -->
    {#if activeType?.id == 'plugin'}
    <List solo className="mt-4">
      {#if pluginWidgets.length > 0}
        <Input listItem bind:value={editingWidget.data.widgetindex} type="select" label="Widget">
          <div
            slot="left"
            class="{!editingWidget?.data?.widgetindex
              ? 'pl-2 pt-3 w-full'
              : ''} text-black dark:text-white pointer-events-none absolute"
          >
            {#if !editingWidget?.data?.widgetindex}
              Select a Widget
            {/if}
          </div>
          {#each pluginWidgets as pluginWidget}
            <option value={pluginWidget.widgetid}>{pluginWidget.emoji} {pluginWidget.name}</option>
          {/each}
        </Input>
        <div class="text-gray-500 leading-tight px-4 text-sm pb-4">Select your Widget for this Plugin</div>
      {:else}
        <div class="text-gray-500 leading-tight px-4 text-sm pb-4">No widget options available for this plugin</div>
      {/if}
    </List>
    {/if}

    <!-- AI Insight Widget Configuration -->
    {#if activeType?.id == 'insight'}
      <List solo className="mt-4">
        <!-- Prompt Type Selection -->
        <ListItem>
          Prompt Type
          <ButtonGroup
            bind:value={editingWidget.data.promptType}
            buttons={[
              { value: 'predefined', label: 'Predefined' },
              { value: 'custom', label: 'Custom' },
            ]}
            slot="right"
          />
        </ListItem>

        <Divider left={18} />

        <!-- Predefined Prompts Dropdown -->
        {#if editingWidget.data.promptType === 'predefined'}
          <Input listItem bind:value={editingWidget.data.promptValue} type="select" label="Select Prompt">
            <div
              slot="left"
              class="{!editingWidget.data.promptValue
                ? 'pl-2 pt-3 w-full'
                : ''} text-black dark:text-white pointer-events-none absolute"
            >
              {#if !editingWidget.data.promptValue}
                {Lang.t('dashboard.select-prompt', 'Select a prompt')}
              {/if}
            </div>
            <option>Select</option>
            <option value="patterns">Patterns</option>
            <option value="progress">Progress</option>
            <option value="insights">Insights</option>
            <option value="recommendations">Recommendations</option>
            <option value="trends">Trends</option>
            <option value="wellbeing">Wellbeing</option>
            <option value="productivity">Productivity</option>
            <option value="health">Health</option>
            <option value="mood">Mood & Emotions</option>
            <option value="correlation">Correlations</option>
          </Input>
        {/if}

        <!-- Custom Prompt Textarea -->
        {#if editingWidget.data.promptType === 'custom'}
          <Divider left={18} />
          <Input
            listItem
            placeholder="Enter your custom prompt"
            type="textarea"
            rows={4}
            bind:value={editingWidget.data.promptValue}
          />
          <div class="text-gray-500 leading-tight px-4 text-sm pb-4">
            Describe what insight you'd like Claude to provide based on your tracking data
          </div>
        {/if}
      </List>
    {/if}

    <!-- Start Conditional Styling -->
    {#if activeType && [...activeType.requires, ...activeType.optional].indexOf('cond-style') > -1}
      <List solo className="mt-4">
        <ListItem title="Conditional Coloring">
          <ToggleSwitch
            slot="right"
            bind:value={conditionalStyling}
            on:change={(evt) => {
              if (evt.detail === false) {
                editingWidget.compareUnderColor = undefined
                editingWidget.compareOverColor = undefined
                editingWidget.compareValue = undefined
              } else {
                // Set default colors when turning ON conditional coloring
                if (!editingWidget.compareOverColor) {
                  editingWidget.compareOverColor = 'green'
                }
                if (!editingWidget.compareUnderColor) {
                  editingWidget.compareUnderColor = 'red'
                }
              }
              editingWidget = editingWidget
            }}
          />
        </ListItem>
        {#if conditionalStyling}
          <ListItem bg="transparent" title="Compare Value">
            <div slot="right" class="flex items-center justify-end">
              <input
                class="bg-gray-200 dark:bg-gray-800 rounded-md px-2 py-1"
                pattern="[0-9]*"
                inputmode="numeric"
                placeholder={activeType.id == 'value' ? 'Value' : activeType.id == 'last-used' ? 'Days' : 'Value'}
                style="max-width:140px;"
                bind:value={editingWidget.compareValue}
              />

              {#if editingWidget?.token?.type == 'tracker'}
                <Button
                  icon
                  className="mr-2 text-primary-500"
                  on:click={async () => {
                    alert('get Conditional Value?')
                    // getConditionalValue()
                  }}
                >
                  <IonIcon icon={AddIcon} className="text-gray-500" />
                </Button>
              {/if}
            </div>
          </ListItem>
          <Divider center />
          <ListItem>
            {Lang.t('dashboard.widget-above-value-color', 'Above value color')}
            <TinyColorPicker
              slot="right"
              size={16}
              colors={['green', 'orange', 'red', 'blue']}
              value={editingWidget.compareOverColor}
              on:change={(evt) => {
                editingWidget.compareOverColor = evt.detail
                updateTrigger = updateTrigger + 1
              }}
            />
          </ListItem>

          <ListItem>
            {Lang.t('dashboard.widget-under-value-color', 'Under value color')}
            <TinyColorPicker
              slot="right"
              size={16}
              colors={['green', 'orange', 'red', 'blue']}
              value={editingWidget.compareUnderColor}
              on:change={(evt) => {
                editingWidget.compareUnderColor = evt.detail
                updateTrigger = updateTrigger + 1
              }}
            />
          </ListItem>
        {/if}
      </List>
    {/if}
    <!-- </div>
      {/if} -->

    <!-- End Conditional Styling -->

    <!-- Styling -->

    <List solo className="mt-4 dark:text-white" />
    {/key}
  </main>
</BackdropModal>

<style lang="postcss">
  input[type="range"] {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 24px;
    background: transparent;
    cursor: pointer;
    outline: none;
  }

  input[type="range"]::-webkit-slider-runnable-track {
    height: 8px;
    background: linear-gradient(to right, #9ca3af, #6b7280);
    border-radius: 5px;
    outline: none;
    border: none;
  }

  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 2px solid #3b82f6;
    margin-top: -8px;
  }

  input[type="range"]::-moz-range-track {
    height: 8px;
    background: linear-gradient(to right, #9ca3af, #6b7280);
    border-radius: 5px;
    outline: none;
    border: none;
  }

  input[type="range"]::-moz-range-thumb {
    width: 24px;
    height: 24px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    border: 2px solid #3b82f6;
  }

  input[type="range"]::-moz-range-progress {
    background: linear-gradient(to right, #9ca3af, #6b7280);
  }
</style>
