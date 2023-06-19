<script>
    import { clickClose } from './utils';

    export let handle; // query
    export let close;

    let left = 0;
    let top = 0;

    let moving = false;

    function onMouseDown() {
        moving = true;
    }

    function onMouseMove(e) {
        if (moving) {
            left += e.movementX;
            top += e.movementY;
        }
    }

    function onMouseUp() {
        moving = false;
    }

    function init(node) {
        const handleElem = node.querySelector(handle) ?? node;
        handleElem.addEventListener('mousedown', onMouseDown, true);

        return {
            destroy() {
                handleElem.removeEventListener('mousedown', onMouseDown, true);
            },
        };
    }
</script>

<section use:init use:clickClose={close} style="left: {left}px; top: {top}px;" class={'draggable'} on:close>
    <slot />
</section>

<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

<style>
    .draggable {
        user-select: none;
        cursor: auto;
        position: relative;
    }
</style>
