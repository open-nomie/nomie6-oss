<script context="module">
    let zIndexGlobal = 1000;
</script>

<script>
    import { createEventDispatcher } from "svelte";
    import { Prefs } from '../../../preferences/Preferences'

    const dispatch = createEventDispatcher();

    export let name;
    export let values;
    export let valueFilter = {};
    export let menuLimit = 500;

    let theme = $Prefs.theme;
    let cssVarStyles = "";
    if (theme == 'dark') {
    let bgbt= '#0D324F';
    let borderbt ='#0D324F'
    let fontcolorbt = '#C8C8C8'
	cssVarStyles = `--btbg:${bgbt};--btborder:${borderbt};--fontcolor:${fontcolorbt}`;}
    else {
        let bgbt= '#DFF0F8';
        let borderbt = '#CDEEFF'
        let fontcolorbt = '#000000'
        cssVarStyles = `--btbg:${bgbt};--btborder:${borderbt};--fontcolor:${fontcolorbt}`;
    
    }

    
    let filterText = "";

    let shown;
    $: filterText, (shown = values.filter(matchesFilter));

    function toggleValue(value) {
        value in valueFilter ? removeValuesFromFilter([value]) : addValuesToFilter([value]);
        dispatch("change", valueFilter);
    }

    function setValuesInFilter(values) {
        Object.keys(valueFilter).forEach((key) => delete valueFilter[key]);
        addValuesToFilter(values);
        // values.forEach((v) => (valueFilter[v] = true));
    }

    function addValuesToFilter(values) {
        values.forEach((v) => (valueFilter[v] = true));
    }

    function removeValuesFromFilter(values) {
        values.forEach((v) => delete valueFilter[v]);
    }

    function matchesFilter(x) {
        return x.toLowerCase().trim().includes(filterText.toLowerCase().trim());
    }

    function selectOnly(value) {
        setValuesInFilter(values.filter((y) => y !== value));
        dispatch("change", valueFilter);
    }

    function select(all) {
        const func = all ? removeValuesFromFilter : addValuesToFilter;
        return function () {
            func(values.filter(matchesFilter));
            dispatch("change", valueFilter);
        };
    }
    function init(node) {
        node.style.zIndex = "" + zIndexGlobal++;
    }
</script>

<div
    class="pvtFilterBox" style="display:block;cursor:initial;{cssVarStyles}"
    use:init
>
    <span class="pvtCloseX"> × </span>
    <span class="pvtDragHandle">☰</span>
    <h4>{name}</h4>

    {#if values.length < menuLimit}
        <p>
            <input type="text" placeholder="Filter values" class="pvtSearch" bind:value={filterText} />
            <br />
            <button class="pvtButton" on:click|stopPropagation={select(true)}>
                Select {values.length === shown.length ? "All" : shown.length}
            </button>{" "}
            <button class="pvtButton" on:click|stopPropagation={select(false)}>
                Deselect {values.length === shown.length ? "All" : shown.length}
            </button>
        </p>

        <div class="pvtCheckContainer">
            {#each shown as x (x)}
                <p on:click={() => toggleValue(x)} on:keypress class={x in valueFilter ? "" : "selected"}>
                    <!-- svelte-ignore a11y-missing-attribute -->
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    <a class="pvtOnly" on:click|stopPropagation={() => selectOnly(x)}> only </a>
                    <span class="pvtOnlySpacer">&nbsp;</span>

                    {#if x === ""}<em>null</em>{:else}{x}{/if}
                </p>
            {/each}
        </div>
    {:else}
        <p>(too many values to show)</p>
    {/if}
</div>
