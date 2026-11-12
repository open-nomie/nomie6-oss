/**
 * Custom drag-drop action for Svelte 5
 * Coordinates HTML5 drag events with Svelte's reactive updates
 * No library conflicts - full Svelte control
 */

interface DragDropParams {
    onchange: (items: (string | undefined)[]) => void;
}

// Shared state for cross-container drag tracking
let currentDragItem: HTMLElement | null = null;
let dragSourceContainer: HTMLElement | null = null;
let dragSourceOnChange: ((items: (string | undefined)[]) => void) | null = null;
let instanceCounter = 0;

export default function (node: HTMLElement, params: DragDropParams) {
    const { onchange } = params;
    const instanceId = ++instanceCounter;

    const getItemsOrder = () => {
        return Array.from(node.children)
            .filter((el) => el.hasAttribute('data-id'))
            .map((el) => (el as HTMLElement).dataset.id);
    };

    // Handle dragenter - must preventDefault to establish valid drop target
    const handleDragEnter = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        node.classList.add('drag-over');
    };

    // Handle dragover - accept drops
    const handleDragOver = (e: DragEvent) => {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        node.classList.add('drag-over');
    };

    // Handle dragleave - remove highlight
    const handleDragLeave = (e: DragEvent) => {
        if (e.target === node) {
            node.classList.remove('drag-over');
        }
    };

    // Helper: find insertion index based on drop coordinates
    const getInsertionIndex = (dropEvent: DragEvent): number => {
        const items = Array.from(node.querySelectorAll('[data-id]')) as HTMLElement[];
        if (items.length === 0) return 0;

        const dropY = dropEvent.clientY;

        for (let i = 0; i < items.length; i++) {
            const rect = items[i].getBoundingClientRect();
            // Insert before this item if drop is above its midpoint
            if (dropY < rect.top + rect.height / 2) {
                return i;
            }
        }

        // Drop is below all items, insert at end
        return items.length;
    };

    // Handle drop - accept item and notify changes
    const handleDrop = (e: DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        node.classList.remove('drag-over');

        if (!currentDragItem) return;

        const itemId = currentDragItem.dataset.id;
        if (!itemId) return;

        // Case 1: Item moved to a different container
        if (dragSourceContainer && dragSourceContainer !== node) {
            // Notify source container to remove the item
            if (dragSourceOnChange) {
                const sourceItems = Array.from(dragSourceContainer.children)
                    .filter((el) => el.hasAttribute('data-id') && el !== currentDragItem)
                    .map((el) => (el as HTMLElement).dataset.id);
                dragSourceOnChange(sourceItems);
            }

            // Notify target container to add the item at drop position
            const targetItems = getItemsOrder();
            if (!targetItems.includes(itemId)) {
                const insertIndex = getInsertionIndex(e);
                targetItems.splice(insertIndex, 0, itemId);
            }
            onchange(targetItems);
        }
        // Case 2: Reordering within same container
        else if (dragSourceContainer === node) {
            onchange(getItemsOrder());
        }

        currentDragItem = null;
        dragSourceContainer = null;
        dragSourceOnChange = null;
    };

    // Listen for drag events on this container
    node.addEventListener('dragenter', handleDragEnter);
    node.addEventListener('dragover', handleDragOver);
    node.addEventListener('dragleave', handleDragLeave);
    node.addEventListener('drop', handleDrop);

    // Listen for drag events on child items
    const handleItemDragStart = (e: DragEvent) => {
        const item = (e.target as HTMLElement).closest('[data-id]') as HTMLElement;
        if (item) {
            currentDragItem = item;
            dragSourceContainer = node;
            dragSourceOnChange = onchange;

            const dataTransfer = e.dataTransfer!;
            dataTransfer.effectAllowed = 'move';
            dataTransfer.setData('text/plain', item.dataset.id || '');

            // Create a simple drag image with high visibility
            const dragImage = item.cloneNode(true) as HTMLElement;
            dragImage.style.opacity = '1';
            dragImage.style.position = 'absolute';
            dragImage.style.top = '-9999px';
            dragImage.style.backgroundColor = '#fff';
            dragImage.style.border = '2px solid #04A6F9';
            dragImage.style.borderRadius = '4px';
            dragImage.style.padding = '4px 8px';
            dragImage.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
            document.body.appendChild(dragImage);
            dataTransfer.setDragImage(dragImage, 0, 0);

            setTimeout(() => {
                if (document.body.contains(dragImage)) {
                    document.body.removeChild(dragImage);
                }
            }, 0);

            item.classList.add('dragging');
        }
    };

    const handleItemDragEnd = (e: DragEvent) => {
        const item = (e.target as HTMLElement).closest('[data-id]') as HTMLElement;
        if (item) {
            item.classList.remove('dragging');
        }
    };

    // Attach drag listeners to existing items
    const attachDragListeners = () => {
        node.querySelectorAll('[data-id]').forEach((item) => {
            item.removeEventListener('dragstart', handleItemDragStart);
            item.removeEventListener('dragend', handleItemDragEnd);
            item.removeEventListener('dragover', handleDragOver);
            item.removeEventListener('dragenter', handleDragEnter);

            item.addEventListener('dragstart', handleItemDragStart);
            item.addEventListener('dragend', handleItemDragEnd);
            item.addEventListener('dragover', handleDragOver);
            item.addEventListener('dragenter', handleDragEnter);
        });
    };

    // Initial attachment
    attachDragListeners();

    // Observer to attach listeners to dynamically added items
    const observer = new MutationObserver(() => {
        attachDragListeners();
        updateSpacerHeight();
    });

    observer.observe(node, { childList: true, subtree: false });

    // Watch parent <td> for size changes and recalculate spacer
    const parentTd = node.parentElement as HTMLElement;
    if (parentTd) {
        const resizeObserver = new ResizeObserver(() => {
            updateSpacerHeight();
        });
        resizeObserver.observe(parentTd);
    }

    // Update spacer height to fill available space
    const updateSpacerHeight = () => {
        const spacer = node.querySelector('.sortable-drop-spacer') as HTMLElement;
        if (!spacer) return;

        // Get parent <td>'s total height (the actual constraint)
        const parentTd = node.parentElement as HTMLElement;
        const parentHeight = parentTd?.getBoundingClientRect().height || 60;

        // Get items' total height (excluding spacer)
        const items = Array.from(node.querySelectorAll('[data-id]')) as HTMLElement[];
        let itemsHeight = 0;
        items.forEach(item => {
            itemsHeight += item.getBoundingClientRect().height;
        });

        // Account for padding, gaps, and borders
        const padding = 8; // approximate padding/borders
        const gaps = Math.max(0, (items.length - 1) * 2); // 2px gap between items

        // Calculate spacer height to fill remaining space
        const spacerHeight = Math.max(40, parentHeight - itemsHeight - padding - gaps);
        spacer.style.height = spacerHeight + 'px';
    };

    // Initial spacer height calculation
    setTimeout(updateSpacerHeight, 0);

    return {
        destroy() {
            node.removeEventListener('dragenter', handleDragEnter);
            node.removeEventListener('dragover', handleDragOver);
            node.removeEventListener('dragleave', handleDragLeave);
            node.removeEventListener('drop', handleDrop);
            observer.disconnect();

            node.querySelectorAll('[data-id]').forEach((item) => {
                item.removeEventListener('dragstart', handleItemDragStart);
                item.removeEventListener('dragend', handleItemDragEnd);
                item.removeEventListener('dragover', handleDragOver);
                item.removeEventListener('dragenter', handleDragEnter);
            });
        },
    };
}
