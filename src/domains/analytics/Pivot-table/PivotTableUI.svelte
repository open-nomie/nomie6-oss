<svelte:options runes={true} />

<script>
    import Aggregators from './UI/Aggregators.svelte';
    import DnDCell from './UI/DnDCell.svelte';
    import DropdownNomie  from './UI/DropdownNomie.svelte';
    import MainTable from './UI/MainTable.svelte';
    import PivotTable from './PivotTable.svelte';
    import TableRenderers from './TableRenderers';
    import { PivotData, sortAs, aggregators as defaultAggregators } from './Utilities';
    import { getRendererConfig } from './PlotlyRenderers.js';

    let {
        rendererName: initialRendererName = 'Table',
        renderers = TableRenderers,
        aggregatorName: initialAggregatorName = 'Count',
        aggregators = defaultAggregators,
        hiddenAttributes = [],
        hiddenFromAggregators = [],
        hiddenFromDragDrop = [],
        unusedOrientationCutoff = 85,
        workingPivotId = "1dummy2",
        workingPivotTag = "Dummy",
        workingPivotEmoji = "🐣",
        workingPivotDefault = false,
        workingPivotDays = 90,
        workingPivotSearchTerm = {"enabled":false,terms:""},
        menuLimit = 500,
        pivotconfig = $bindable(),
        getConfig = $bindable(false),
        derivedAttributes = PivotData.defaultProps.derivedAttributes,
        cols: initialCols = PivotData.defaultProps.cols,
        rows: initialRows = PivotData.defaultProps.rows,
        vals: initialVals = PivotData.defaultProps.vals,
        sorters = PivotData.defaultProps.sorters,
        valueFilter: initialValueFilter = PivotData.defaultProps.valueFilter,
        data,
        ...restProps
    } = $props();

    // Local mutable state for these props
    let cols = $state(initialCols);
    let rows = $state(initialRows);
    let vals = $state(initialVals);
    let rendererName = $state(initialRendererName);
    let aggregatorName = $state(initialAggregatorName);
    let valueFilter = $state(initialValueFilter);
    let unusedOrder = $state([]);


    // Sync prop changes to local state
    $effect(() => {
        cols = initialCols;
        rows = initialRows;
        vals = initialVals;
        rendererName = initialRendererName;
        aggregatorName = initialAggregatorName;
        valueFilter = initialValueFilter;
    });

    // Compute attrValues from data
    let attrValues = $derived.by(() => {
        const result = {};
        let recordsProcessed = 0;
        PivotData.forEachRecord(data, derivedAttributes, function (record) {
            for (const attr of Object.keys(record)) {
                if (!(attr in result)) {
                    result[attr] = {};
                    if (recordsProcessed > 0) {
                        result[attr].null = recordsProcessed;
                    }
                }
            }
            for (const attr in result) {
                const value = attr in record ? record[attr] : 'null';
                if (!(value in result[attr])) {
                    result[attr][value] = 0;
                }
                result[attr][value]++;
            }
            recordsProcessed++;
        });
        return result;
    });

    function notHidden(e) {
        return !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e);
    }

    // Filter columns and rows
    let colAttrs = $derived(cols.filter(notHidden));
    let rowAttrs = $derived(rows.filter(notHidden));

    // Compute unused attributes
    let unusedAttrs = $derived(Object.keys(attrValues)
        .filter((e) => !colAttrs.includes(e) && !rowAttrs.includes(e) && notHidden(e))
        .sort(sortAs(unusedOrder)));

    let horizUnused = $derived(unusedAttrs.reduce((r, e) => r + e.length, 0) < unusedOrientationCutoff);

    let valAttrs = $derived(Object.keys(attrValues).filter(
        (e) => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e)
    ));

    // Select renderer
    let renderer = $derived.by(() => {
        const validRendererName = rendererName in renderers ? rendererName : Object.keys(renderers)[0];
        return renderers[validRendererName];
    });

    // Compute heatmap options based on renderer name
    let heatmapOpts = $derived.by(() => {
        if (rendererName === 'Table Heatmap') {
            return { heatmapMode: 'full' };
        } else if (rendererName === 'Table Col Heatmap') {
            return { heatmapMode: 'col' };
        } else if (rendererName === 'Table Row Heatmap') {
            return { heatmapMode: 'row' };
        }
        return {};
    });

    // Get renderer configuration (traceOptions, layoutOptions, transpose)
    let rendererOptions = $derived.by(() => {
        const config = getRendererConfig(rendererName);
        return {
            traceOptions: config.traceOptions || {},
            layoutOptions: config.layoutOptions || {},
            transpose: config.transpose || false
        };
    });

    // Select aggregator
    let aggregator = $derived.by(() => {
        const validAggregatorName = aggregatorName in aggregators ? aggregatorName : Object.keys(aggregators)[0];
        return aggregators[validAggregatorName];
    });
</script>
<div class="mtcontainer">
<MainTable horizUnused={true}>
    <DropdownNomie slot="rendererCell" bind:current={rendererName} values={Object.keys(renderers)} />

    <Aggregators
        slot="aggregatorCell"
        {aggregatorName}
        {aggregators}
        {valAttrs}
        onChange={(v) => (aggregatorName = v)}
        onUpdate={(v) => (vals = v)}
        {vals}
    />

    <DnDCell
        slot="unusedAttrsCell"
        {sorters}
        {valueFilter}
        {attrValues}
        items={unusedAttrs}
        onChange={(order) => (unusedOrder = order)}
        onUpdate={(v) => (valueFilter = v)}
        {menuLimit}
    />

    <DnDCell
        slot="colAttrsCell"
        {sorters}
        {valueFilter}
        {attrValues}
        items={colAttrs}
        onChange={(v) => (cols = v)}
        onUpdate={(v) => (valueFilter = v)}
        {menuLimit}
    />

    <DnDCell
        slot="rowAttrsCell"
        {sorters}
        {valueFilter}
        {attrValues}
        items={rowAttrs}
        onChange={(v) => (rows = v)}
        onUpdate={(v) => (valueFilter = v)}
        {menuLimit}
    />
    
    <PivotTable
        slot="outputCell"
        {renderer}
        {...restProps}
        {cols}
        {rows}
        {vals}
        {derivedAttributes}
        {aggregator}
        {data}
        {sorters}
        {valueFilter}
        {workingPivotId}
        {workingPivotTag}
        {workingPivotEmoji}
        {workingPivotDefault}
        {workingPivotDays}
        {workingPivotSearchTerm}
        {renderers}
        opts={heatmapOpts}
        traceOptions={rendererOptions.traceOptions}
        layoutOptions={rendererOptions.layoutOptions}
        transpose={rendererOptions.transpose}
        bind:pivotconfig={pivotconfig}
        bind:getConfig={getConfig}
    />
</MainTable></div>

<style>
    .mtcontainer {
   
     max-width: 100%;
    }
    
     
   
   </style>