<script context="module">
    // your script goes here
</script>

<script>
    import Sortable from 'sortablejs';
    import { createEventDispatcher } from 'svelte';

    const dispatch = createEventDispatcher();

    function notify(el) {
        const val = [...el.children].map((i) => i.dataset.id);
        dispatch('change', val);
    }

    export let options = {};
    export let items = [];

    function create(node) {
        const sortable = Sortable.create(node.parentNode, {
            ...options,
            onUpdate: (ev) => notify(ev.to),
            onAdd: (ev) => notify(ev.to),
            onRemove: (ev) => notify(ev.from),
        });

        // Temporary node removal
        node.parentNode.removeChild(node);

        return {
            update() {},
            onDestroy() {
                sortable.destroy();
            },
        };
    }
</script>

<div use:create><!-- Temporary node only for the initialization. --></div>
{#each items as item (item)}
    <slot {item} />
{/each}
