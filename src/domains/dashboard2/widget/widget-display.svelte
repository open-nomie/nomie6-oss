<script lang="ts">
  import { createEventDispatcher } from 'svelte'
  import nid from '../../../modules/nid/nid'
  import type { WidgetClass } from './widget-class'
  import { showTrackablePopmenu } from '../../board/boardActions'

  import TrackablePill from '../../trackable/trackable-pill.svelte'

  import Button from '../../../components/button/button.svelte'
  import WidgetDisplayType from './widget-display-type.svelte'
  import type { Trackable } from '../../trackable/Trackable.class'
  import type { TrackableUsage } from '../../usage/trackable-usage.class'
  import { showWidgetPopmenu, upsertWidget } from '../DashStore'
  import Spinner from '../../../components/spinner/spinner.svelte'
  import type NLog from '../../nomie-log/nomie-log'
  import { MoreVertical } from '../../../components/icon/nicons'
  import IonIcon from '../../../components/icon/ion-icon.svelte'
  import { timeFrames } from './widget-timeframe'
  import { openDropMenu } from '../../../components/menu/useDropmenu'
  import { Interact } from '../../../store/interact'
  import { Lang } from '../../../store/lang'
  import { showToast } from '../../../components/toast/ToastStore'
  import { PluginStore } from "../../plugins/PluginStore";

  const dispatch = createEventDispatcher()
  const id = nid()
  export let widget: WidgetClass
  export let trackable: Trackable
  export let loaded: boolean
  export let usage: TrackableUsage
  export let logs: Array<NLog>
  export let hideTools: boolean = false

  function widgetActions() {
    showTrackablePopmenu(trackable, {
      title: trackable.label,
    })
  }

  const showSizeMenu = (htmlTarget) => {
    const buttons = [
      { id: 'sm', label: 'Small' },
      { id: 'md', label: 'Medium' },
      { id: 'lg', label: 'Large' },
    ].map((b) => {
      return {
        title: b.label,
        click() {
          //@ts-ignore
          widget.size = b.id
          upsertWidget(widget)
        },
      }
    })
    openDropMenu(htmlTarget, buttons)
  }

  const showTimeframeMenu = (evt) => {
    const buttons = timeFrames.map((tf) => {
      return {
        title: tf.label,
        async click() {
          widget.timeRange = tf.id
          try {
            await upsertWidget(widget)
            showToast({ message: Lang.t('general.saved', 'Saved') })
          } catch (e) {
            showToast({ message: e.message })
          }
        },
      }
    })
    Interact.popmenu({
      id: `widget-time-frame`,
      title: 'Time Frame',
      buttons,
    })
  }

  /**
   * Generate a Class Name for this widget
   * @param widget
   */
  function getClass(widget: WidgetClass): string {
    let classes = [`type-${widget.type}`]
    let value
    if (widget.stats) {
      if (widget.type == 'last-used') {
        value = widget.stats.daysPast
      } else {
        value = widget.math !== 'sum' ? widget.stats.avg : widget.stats.sum
      }
    }
    value = value || 0

    if (widget.compareValue) {
      if (value > widget.compareValue) {
        classes.push(`over widget-${widget.compareOverColor}`)
      } else if (value < widget.compareValue) {
        classes.push(`over widget-${widget.compareUnderColor}`)
      }
    }
    classes.push(`widget-size-${widget.size}`)
    return classes.join(' ')
  }

  let label:string = 'loading';

  $: if(widget.type == 'plugin') {
      let plugin = $PluginStore.find(p=>p.id == widget.data.pluginId);
      if(plugin) {
        label = `${plugin.emoji} ${plugin.name}`;
      } else {
        label = "Unknown Plugin"
      }
    }
  

</script>

{#if widget && widget.type !== 'text'}
  <div class="dashboard-widget {getClass(widget)}" {id}>
    <div class="flex widget-header px-2 py-1">
      {#if trackable}
        <TrackablePill hideValue size={30} transparent {trackable} on:click={widgetActions} />
      {:else if widget.type == 'plugin'}
        {label}
      {:else}
        <span class="capitalize text-xs font-semibold pt-1 pl-1">{widget.getTitle()}</span>
      {/if}
      <div class="filler" />
      {#if !hideTools}
        <Button
          size="xs"
          icon
          primary
          className="p-1 -mr-1 bg-gray-500 bg-opacity-5 mt-px"
          on:click={() => {
            showWidgetPopmenu(widget)
          }}
        >
          <IonIcon icon={MoreVertical} size={16} />
        </Button>
      {/if}
    </div>
    <div class="widget-main">
      {#if !loaded}
        <div class="flex items-center justify-center px-4 py-6 h-28">
          <Spinner size={32} />
        </div>
      {:else if usage || logs}
        <WidgetDisplayType {widget} {trackable} {logs} {usage} />
      {:else if loaded && !usage}
        <div class="flex items-center justify-center px-4 py-6 h-28">No Value</div>
      {/if}
    </div>
    <footer class="px-1 flex widget-footer space-x-2 justify-between">
      {#if widget.timeRange &&  widget.type !== 'plugin'}
        <button on:click={(evt) => showTimeframeMenu(evt)} class="">
          {widget.getLabel().replace('days', '')}
        </button>
      {/if}
      {#if !hideTools}
        <button
          class="text-xs  px-1 "
          on:click={(evt) => {
            // TODO: Move this to the new drop menu - when it follows better
            showSizeMenu(evt.target)
          }}
        >
        <svg width="13" height="13" viewBox="0 0 13 13" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="6" width="7" height="7" fill="#868686" fill-opacity="0.31"/>
          <rect x="0.5" y="6.5" width="6" height="6" stroke="white" stroke-opacity="0.34"/>
          <rect x="3" width="10" height="10" fill="#868686" fill-opacity="0.31"/>
          <rect x="3.5" y="0.5" width="9" height="9" stroke="white" stroke-opacity="0.34"/>
          </svg>
          
        </button>
      {/if}
      <div class="filler pointer-events-none" />
    </footer>
  </div>
{:else}
  <div
    {id}
    class="dashboard-text type-text text-center widget-size-{widget.size}"
    on:click={() => {
      dispatch('click')
    }}
  >
    {widget.description}
  </div>
{/if}

<style lang="postcss" global>
  .dashboard-text.widget-size-md {
    font-size: 1em;
    font-weight: 500;
    padding: 8px 16px;
    line-height: 1.1em;
  }
  .dashboard-text.widget-size-lg {
    padding: 8px 16px;
    font-size: 1.6em;
    line-height: 1.7em;
    font-weight: 700;
    padding: 16px;
  }
  .dashboard-widget footer button,
  .dashboard-widget .usage-chart-tools button {
    @apply bg-gray-100 dark:bg-gray-900 rounded-md h-6 px-2;
    @apply text-xs whitespace-nowrap text-gray-600 dark:text-gray-400;
    @apply flex-shrink-0 flex-grow-0 flex items-center;
    @apply z-40;
  }

  .dashboard-widget .usage-chart-tools {
    left: 50%;
    top: auto !important;
    justify-content: end !important;
  }

  .dashboard-widget .usage-chart-tools .filler {
    display:none !important;
  }

  .dashboard-widget footer button:hover ,
  .dashboard-widget .usage-chart-tools button:hover { 
    
  }
  
  .dashboard-text + .dashboard-text {
    padding-top: 0px !important;
    padding-bottom: 16px;
  }
  .dashboard-widget {
    @apply transition-all duration-100 ease-in-out;
    max-height: 300px;
    position: relative;
    @apply text-black dark:text-white;
  }


  .dashboard-widget:after {
    content: '';
    @apply pointer-events-none;
    @apply bottom-0;
    @apply opacity-20;
    @apply w-full;
    @apply absolute;
    @apply -top-20;
    z-index: 1;
  }
  .dashboard-widget.over .widget-footer .n-text {
    color: #fff !important;
  }
  .dashboard-widget.under .widget-footer .n-text {
    color: #fff !important;
  }
  .dashboard-widget.widget-red .widget-footer .n-text {
    color: var(--color-red) !important;
  }
  .dashboard-widget.widget-blue .widget-footer .n-text {
    color: var(--color-blue) !important;
  }
  .dashboard-widget.widget-green .widget-footer .n-text {
    color: var(--color-green) !important;
  }
  .dashboard-widget.widget-orange .widget-footer .n-text {
    color: var(--color-orange) !important;
  }
  .dashboard-widget.widget-red:after {
    /* background-color: var(--color-red) !important; */
    background: linear-gradient(180deg, rgba(0, 174, 255, 0) 0%, var(--color-red)) !important;
  }
  .dashboard-widget.widget-blue:after {
    background: linear-gradient(180deg, rgba(0, 174, 255, 0) 0%, var(--color-blue)) !important;
  }
  .dashboard-widget.widget-green:after {
    background: linear-gradient(180deg, rgba(0, 174, 255, 0) 0%, var(--color-green)) !important;
  }
  .dashboard-widget.widget-orange:after {
    background: linear-gradient(180deg, rgba(0, 174, 255, 0) 0%, var(--color-orange)) !important;
  }
  .dashboard-widget {
    display: flex;
    flex-direction: column;
    @apply bg-white dark:bg-black;
    @apply text-gray-900 dark:text-gray-100;
    @apply shadow-md;
    @apply rounded-lg;
    @apply flex-grow flex-shrink;
    @apply overflow-hidden;
  }
  .dashboard-widget .widget-header,
  .dashboard-widget .widget-footer {
    @apply text-xs;
    @apply flex items-center;
    flex-grow: 0;
    flex-shrink: 0;
    min-height: 32px;
    @apply relative;
    @apply z-10;
  }
  .dashboard-widget .widget-footer {
  }
  .dashboard-widget .widget-main {
    min-height: 90px;
    flex-grow: 1;
  }
  .widget-size-lg {
    @apply col-span-2 lg:col-span-6;
  }
  .widget-size-md {
    @apply col-span-2 lg:col-span-3;
  }
  .widget-size-sm {
    @apply col-span-1 lg:col-span-2;
  }
</style>
