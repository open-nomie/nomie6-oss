<script>
    import Draggable from "./Draggable.svelte";
    import FilterBox from "./FilterBox.svelte";
    import { is_empty } from "svelte/internal";
    import { Prefs } from '../../../preferences/Preferences'

    export let valueFilter;
    export let name;
    export let attrValues;
    export let menuLimit;
    export let updateValuesInFilter;

    let open = false;
    let fontsize = Math.round(14 /(1400/window.innerWidth));
    if (fontsize < 12) {fontsize=12}

    let theme = $Prefs.theme;
    let cssVarStyles = "";
    if (theme == 'dark') {
    let bgdark= '#0D324F';
    let borderdark ='#0D324F'
    let fontcolordark = '#C8C8C8'
    if (name.includes("🕵🏻‍♂️")) {bgdark= '#6BBFF9';fontcolordark = '#000000'}
	cssVarStyles = `--btbg:${bgdark};--btborder:${borderdark};--fontcolor:${fontcolordark}`;}
    else {
        let bglight= '#DFF0F8';
        let borderlight = '#CDEEFF'
        let fontcolorlight = '#000000'
        if (name.includes("🕵🏻‍♂️")) {bglight= '#6BBFF9';}
	cssVarStyles = `--btbg:${bglight};--btborder:${borderlight};--fontcolor:${fontcolorlight}`;
    }

    const toggleOpen = () => (open = !open);
</script>


<li data-id={name} style="padding:2px">
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


