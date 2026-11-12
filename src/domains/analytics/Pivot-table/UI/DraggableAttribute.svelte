<svelte:options runes={true} />

<script>
    import Draggable from "./Draggable.svelte";
    import FilterBox from "./FilterBox.svelte";
    import { Prefs } from '../../../preferences/Preferences'

    const is_empty = (obj) => !obj || Object.keys(obj).length === 0

    const { valueFilter, name, attrValues, menuLimit, updateValuesInFilter } = $props()

    let open = $state(false);
    let fontsize = $state(Math.round(14 /(1400/window.innerWidth)));
    if (fontsize < 12) {fontsize=12}

    let cssVarStyles = $derived.by(() => {
        const theme = $Prefs.theme;
        const isSearchTerm = name.includes("🕵🏻‍♂️");

        if (theme === 'dark') {
            const bgdark = isSearchTerm ? '#6BBFF9' : '#0D324F';
            const borderdark = '#0D324F';
            const fontcolordark = isSearchTerm ? '#000000' : '#C8C8C8';
            return `--btbg:${bgdark};--btborder:${borderdark};--fontcolor:${fontcolordark}`;
        } else {
            const bglight = isSearchTerm ? '#6BBFF9' : '#DFF0F8';
            const borderlight = '#CDEEFF';
            const fontcolorlight = '#000000';
            return `--btbg:${bglight};--btborder:${borderlight};--fontcolor:${fontcolorlight}`;
        }
    });

    const toggleOpen = () => (open = !open);
</script>


<li data-id={name} draggable="true" style="padding:2px;cursor:move">
    <span class={`pvtAttr ${is_empty(valueFilter) ? "" : "pvtFilteredAttribute"}`} style="font-size:{fontsize}px;{cssVarStyles}">
        {name}
        <span class="pvtTriangle" on:click={toggleOpen} on:keypress={toggleOpen}>
            {" "}
            ▾
        </span>
    </span>
</li>
    {#if open}
        <Draggable handle=".pvtDragHandle" close=".pvtCloseX" on:click={toggleOpen} on:close={toggleOpen}>
            <FilterBox
                {name}
                {valueFilter}
                values={attrValues}
                {menuLimit}
                on:change={(ev) => updateValuesInFilter(name, ev.detail)}
            />
        </Draggable>
    {/if}


