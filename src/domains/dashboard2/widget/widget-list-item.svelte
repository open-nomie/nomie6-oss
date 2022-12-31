<script lang="ts">
import ListItem from "../../../components/list-item/list-item.svelte";
import type { WidgetClass } from "./widget-class";



export let widget:WidgetClass;
</script>

<ListItem>
  {widget.getLabel()}
</ListItem>
