<svelte:options runes={true} />

<script>
    import DropdownNomie from "./DropdownNomie.svelte";

    const { onChange, onUpdate, aggregatorName, aggregators, valAttrs, vals } = $props()

    let numValsAllowed = $derived(aggregators[aggregatorName]([])().numInputs || 0);

    const sortIcons = {
        key_a_to_z: {
            rowSymbol: "↕",
            colSymbol: "↔",
            next: "value_a_to_z",
        },
        value_a_to_z: {
            rowSymbol: "↓",
            colSymbol: "→",
            next: "value_z_to_a",
        },
        value_z_to_a: { rowSymbol: "↑", colSymbol: "←", next: "key_a_to_z" },
    };

    const setAt = (array, index, value) => Object.assign([], array, { [index]: value });
</script>

<DropdownNomie
    current={aggregatorName}
    values={Object.keys(aggregators)}
    on:change={(ev) => onChange(ev.detail)}
/>

<!-- svelte-ignore a11y-missing-attribute -->
<!-- sorting causes problems 
    <a
    role="button"
    class="pvtRowOrder"
    on:click={() => propUpdater("rowOrder")(sortIcons[props.rowOrder].next)}
    >
    {sortIcons[props.rowOrder].rowSymbol}
</a>
-->

<!-- svelte-ignore a11y-missing-attribute -->
<!-- sorting causes problems 
<a
    role="button"
    class="pvtColOrder"
    on:click={() => propUpdater("colOrder")(sortIcons[props.colOrder].next)}
>
    {sortIcons[props.colOrder].colSymbol}
</a>
-->

{#if numValsAllowed > 0} <br />{/if}

{#each new Array(numValsAllowed).fill() as n, i (i)}
    <DropdownNomie current={vals[i]} values={valAttrs} on:change={(ev) => onUpdate(setAt(vals, i, ev.detail))} />
    {#if i + 1 !== numValsAllowed} <br />{/if}
{/each}
