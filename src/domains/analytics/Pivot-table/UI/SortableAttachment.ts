import Sortable from 'sortablejs';
import { tick } from 'svelte';

interface SortableActionParams {
    options?: any;
    onchange: (v: (string | undefined)[]) => void;
}

export default function (node: HTMLElement, params: SortableActionParams) {
    const { options = {}, onchange } = params;

    const notify = (el: HTMLElement) => {
        const val = Array.from(el.children).map((i) => (i as HTMLElement).dataset.id);
        onchange(val);
    };

    // Handle dragover to accept drops
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
    };

    if (node) {
        node.addEventListener('dragover', handleDragOver);

        const sortable = Sortable.create(node, {
            ...options,
            onUpdate: (ev) => {
                // Reordering within same list - remove to prevent duplicate
                ev.item.remove();
                notify(ev.to);
            },
            onAdd: async (ev) => {
                // Item added from another list - remove element then notify
                // This prevents duplicate since Svelte will re-render it
                await tick();
                ev.item.remove();
                notify(ev.to);
            },
            onRemove: (ev) => {
                // Item removed to another list - just notify state
                notify(ev.from);
            },
        });

        return {
            destroy() {
                sortable?.destroy();
                node.removeEventListener('dragover', handleDragOver);
            },
        };
    }
}
