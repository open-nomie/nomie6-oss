<script lang="ts">
  import { WidgetClass } from './widget/widget-class.ts'
  import ListItem from '../../components/list-item/list-item.svelte'
  import type { DashboardClass } from './dashboard-class'
  import { openWidgetEditor } from './widget/widget-editor/useWidgetEditorModal'

  export let dashboard: DashboardClass

  const createWidget = () => {
    openWidgetEditor({
      widget: new WidgetClass(),
      onSave(widget) {
        console.log({widget});
      }
    })
  }
</script>

<ListItem>
  <main>
    <div class="ntitle">{dashboard.label}</div>
    <div class="widgets -ml-1 text-xs p-1 rounded-md flex flex-wrap">
      {#if dashboard.widgets.length}
        {#each dashboard.widgets as widget, index}
          <button class="pill sm space-x- flex">
            <strong>{widget.getTitle()}</strong>
            <span>{widget.type}</span>
            <span>{widget.getLabel().replace('days','')}</span>
          </button>
        {/each}
      {:else}
      
      {/if}
      <div>
        <button
          on:click={() => {
            createWidget()
          }}>+ Widget</button
        >
      </div>
    </div>
  </main>
</ListItem>
