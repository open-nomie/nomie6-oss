<script context="module">
    let zIndexGlobal = 1000;
</script>

<svelte:options runes={true} />

<script>
    import { createEventDispatcher } from "svelte";
    import { Prefs } from '../../../preferences/Preferences'

    const dispatch = createEventDispatcher();
    const { name, values, valueFilter: initialValueFilter = {}, menuLimit = 500 } = $props();

    let valueFilter = $state(initialValueFilter);

    let filterText = $state("");

    let shown = $derived(values.filter(matchesFilter));

    let theme = $state($Prefs.theme);
    let cssVarStyles = $state("");
    if (theme == 'dark') {
        let bgbt= '#0D324F';
        let borderbt ='#0D324F'
        let fontcolorbt = '#C8C8C8'
        cssVarStyles = `--btbg:${bgbt};--btborder:${borderbt};--fontcolor:${fontcolorbt}`;
    } else {
        let bgbt= '#DFF0F8';
        let borderbt = '#CDEEFF'
        let fontcolorbt = '#000000'
        cssVarStyles = `--btbg:${bgbt};--btborder:${borderbt};--fontcolor:${fontcolorbt}`;
    }

    function toggleValue(value) {
        value in valueFilter ? removeValuesFromFilter([value]) : addValuesToFilter([value]);
        dispatch('change', valueFilter);
    }

    function setValuesInFilter(vals) {
        Object.keys(valueFilter).forEach((key) => delete valueFilter[key]);
        addValuesToFilter(vals);
        dispatch('change', valueFilter);
    }

    function addValuesToFilter(vals) {
        vals.forEach((v) => (valueFilter[v] = true));
    }

    function removeValuesFromFilter(vals) {
        vals.forEach((v) => delete valueFilter[v]);
    }

    function matchesFilter(x) {
        return x.toLowerCase().trim().includes(filterText.toLowerCase().trim());
    }

    function selectOnly(ev, value) {
        ev.preventDefault();
        ev.stopPropagation();
        setValuesInFilter(values.filter((y) => y !== value));
    }

    function select(all) {
        const func = all ? removeValuesFromFilter : addValuesToFilter;
        return function (ev) {
            ev.stopPropagation();
            func(values.filter(matchesFilter));
        };
    }

    function init(node) {
        node.style.zIndex = "" + zIndexGlobal++;
    }
</script>

<div class="pvtFilterBox" style:display="block" style:cursor="initial" use:init>
    <span class="pvtCloseX"> × </span>
    <span class="pvtDragHandle">☰</span>
    <h4>{name}</h4>

    {#if values.length < menuLimit}
        <p>
            <input type="text" placeholder="Filter values" class="pvtSearch" bind:value={filterText} />
            <br />
            <button class="pvtButton" onclick={select(true)}>
                Select {values.length === shown.length ? "All" : shown.length}
            </button>{" "}
            <button class="pvtButton" onclick={select(false)}>
                Deselect {values.length === shown.length ? "All" : shown.length}
            </button>
        </p>

        <div class="pvtCheckContainer">
            {#each shown as x (x)}
                <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
                <!-- svelte-ignore a11y_click_events_have_key_events -->
                <p onclick={() => toggleValue(x)} class={x in valueFilter ? "" : "selected"} style={cssVarStyles}>
                    <!-- svelte-ignore a11y_missing_attribute -->
                    <!-- svelte-ignore a11y_click_events_have_key_events -->
                    <a class="pvtOnly" onclick={(ev) => selectOnly(ev, x)} role="presentation"> only </a>
                    <span class="pvtOnlySpacer">&nbsp;</span>

                    {#if x === ""}<em>null</em>{:else}{x}{/if}
                </p>
            {/each}
        </div>
    {:else}
        <p>(too many values to show)</p>
    {/if}
</div>
