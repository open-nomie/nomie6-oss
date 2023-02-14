<script lang="ts">
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
  import { getWidgetTypes, IWidgetType } from '../widget-types'
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

  let visible: boolean = false
  let editingWidget: WidgetClass | undefined

  export let props: WidgetEditorProps
  export let id: string

  let activeType: IWidgetType | undefined
  let conditionalStyling: boolean = false
  let canSave: boolean = false

  $: if (props.widget && !visible) {
    visible = true
    editingWidget = new WidgetClass(props.widget)
    if (isTruthy(editingWidget.compareValue)) {
      conditionalStyling = true
    }
  }

  let widgetTypes = getWidgetTypes($PluginStore);

  $: if (editingWidget.type) {
    activeType = widgetTypes.find((wt) => wt.id === editingWidget.type)
    if (editingWidget.type == "plugin"){
      pluginGetWidgets(editingWidget.data.pluginId);
    }
  }

  let lastWidgetHash: string | undefined = undefined
  $: if (objectHash(editingWidget) !== lastWidgetHash) {
    lastWidgetHash = objectHash(editingWidget)
    try {
      canSave = canSaveWidget(editingWidget, widgetTypes);
    } catch (e) {
      console.error(e)
      canSave = false
    }
  }

  let pluginWidgets = [];
  async function pluginGetWidgets(pluginId:String) {
    let path = `plugins/${pluginId}/prefs.json`
    let data: any = undefined
    try {
      data = await Storage.get(path) || {widgets:[]};
      pluginWidgets = data.widgets;
      if (pluginWidgets == undefined || !validateWidgetParams(data.widgets)){pluginWidgets = [];}
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
    const selected = await selectTrackable()
    let token = trackableToToken(selected)
    editingWidget.token = token
  }

  const saveWidget = async () => {
    try {

      if([...activeType.requires, ...activeType.optional].indexOf('timeframe') === -1) {
        editingWidget.timeRange = undefined;
      }

      if(props.onSave) {
        props.onSave(editingWidget);
        await upsertWidget(editingWidget).catch((e) => {
          throw e
        })
      } else {
        await upsertWidget(editingWidget).catch((e) => {
          throw e
        })
      }
      close()
    } catch (e) {
      Interact.error(e)
    }
  }
</script>

<BackdropModal mainClass="bg-gray-100 dark:bg-gray-800" className="bg-white dark:bg-black h-full">
  <header slot="header" class="bg-white dark:bg-black">
    <ToolbarGrid slot="header">
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
    <WidgetTypeSelector bind:widget={editingWidget} />
  </header>

  <div class="h-4" />

  <main class="px-2">
    <!-- Select the Trackable if its required the by the active ttype  -->
    <List solo>
      {#if (activeType?.requires?.indexOf('token') > -1) || activeType?.optional?.indexOf('token') > -1}
        <ListItem
          on:click={() => {
            localSelectTrackables(activeType?.requires?.indexOf('tokens') > -1)
          }}
          className="h-16"
        >
          Trackable
          {#if !editingWidget.token}
            <span class="opacity-50 text-black dark:text-white">
              {#if (activeType?.requires?.indexOf('token') > -1)}
                (required)
              {:else}
                (optional)
              {/if}
            </span>
          {/if}
          <div slot="right" class="flex items-center space-x-2">
            {#if !editingWidget.tokens.length}
              <div class="text-primary-500">{Lang.t('general.select', 'Select')}</div>
            {:else if editingWidget.token}
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

      <!-- Select the timeframe if required -->
      {#if activeType && [...activeType.requires, ...activeType.optional].indexOf('timeframe') > -1}
        <Divider left={18} />
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
    {#if pluginWidgets.length > 0}
    <List solo className="mt-4">
    <Input listItem bind:value={editingWidget.data.widgetindex} type="select" label="Widget">
      <div
        slot="left"
        class="{!editingWidget.data.widgetindex
          ? 'pl-2 pt-3 w-full'
          : ''} text-black dark:text-white pointer-events-none absolute"
      >
        {#if !editingWidget.data.widgetindex}
          Select a Widget
        {/if}
      </div>
      {#each pluginWidgets as pluginWidget}
        <option value={pluginWidget.widgetid}>{pluginWidget.emoji} {pluginWidget.name}</option>
      {/each}
    </Input>
      
        <div class="text-gray-500 leading-tight px-4 text-sm pb-4">Select your Widget for this Plugin</div>
      </List>
    {/if}
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
              }
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
              value={editingWidget.compareOverColor}
              on:change={(evt) => {
                editingWidget.compareOverColor = evt.detail
              }}
            />
          </ListItem>

          <ListItem>
            {Lang.t('dashboard.widget-under-value-color', 'Under value color')}
            <TinyColorPicker
              slot="right"
              size={16}
              value={editingWidget.compareUnderColor}
              on:change={(evt) => {
                editingWidget.compareUnderColor = evt.detail
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
  </main>
</BackdropModal>
