<svelte:options runes={true} />

<script lang="ts">
import ListItem from "../../../components/list-item/list-item.svelte";
import type { WidgetClass } from "./widget-class";

const { widget } = $props();
</script>

<ListItem>
  {widget.getLabel()}
</ListItem>
