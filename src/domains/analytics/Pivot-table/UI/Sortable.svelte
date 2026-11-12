<svelte:options runes={true} />

<script>
    import { createEventDispatcher } from 'svelte';
    import customDragDrop from './CustomDragDrop';

    const dispatch = createEventDispatcher();

    const { options = {}, items = [] } = $props();
</script>

<div use:customDragDrop={{ onchange: (val) => dispatch('change', val) }}>
    {#each items as item, i (i)}
        <slot {item} />
    {/each}
    <!-- Invisible spacer to catch drops in empty space below items (height set dynamically by action) -->
    <div class="sortable-drop-spacer" style="height: 40px; pointer-events: auto;"></div>
</div>

<style>
    div :global([data-id]) {
        user-select: none;
    }

    div :global([data-id].dragging) {
        opacity: 0.5;
    }

    div.drag-over {
        background-color: rgba(107, 191, 249, 0.1);
        border: 2px dashed rgba(107, 191, 249, 0.5);
    }
</style>
