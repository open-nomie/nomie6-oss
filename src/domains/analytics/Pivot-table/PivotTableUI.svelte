<script>
    import Aggregators from './UI/Aggregators.svelte';
    import DnDCell from './UI/DnDCell.svelte';
    import DropdownNomie  from './UI/DropdownNomie.svelte';
    import MainTable from './UI/MainTable.svelte';
    import PivotTable from './PivotTable.svelte';
    import TableRenderers from './TableRenderers';
    import { PivotData, sortAs, aggregators as defaultAggregators } from './Utilities';

    export let rendererName = 'Table',
        renderers = TableRenderers,
        aggregatorName = 'Count',
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
        pivotconfig ,
        getConfig = false;

    // pivotData props managed by PivotTableUI
    export let { derivedAttributes, cols, rows, vals, sorters, valueFilter } = PivotData.defaultProps;
    export let data;

    let unusedOrder = [],
        attrValues = {};


    $: {
        attrValues = {};
        let recordsProcessed = 0;
        PivotData.forEachRecord(data, derivedAttributes, function (record) {
            for (const attr of Object.keys(record)) {
                if (!(attr in attrValues)) {
                    attrValues[attr] = {};
                    if (recordsProcessed > 0) {
                        attrValues[attr].null = recordsProcessed;
                    }
                }
            }
            for (const attr in attrValues) {
                const value = attr in record ? record[attr] : 'null';
                if (!(value in attrValues[attr])) {
                    attrValues[attr][value] = 0;
                }
                attrValues[attr][value]++;
            }
            recordsProcessed++;
        });
    }

    function notHidden(e) {
        return !hiddenAttributes.includes(e) && !hiddenFromDragDrop.includes(e);
    }

    let colAttrs, rowAttrs;
    $: colAttrs = cols.filter(notHidden);
    $: rowAttrs = rows.filter(notHidden);

    let unusedAttrs, horizUnused, valAttrs;
    $: {
        unusedAttrs = Object.keys(attrValues)
            .filter((e) => !colAttrs.includes(e) && !rowAttrs.includes(e) && notHidden(e))
            .sort(sortAs(unusedOrder));

        const unusedLength = unusedAttrs.reduce((r, e) => r + e.length, 0);
        horizUnused = unusedLength < unusedOrientationCutoff;

        valAttrs = Object.keys(attrValues).filter(
            (e) => !hiddenAttributes.includes(e) && !hiddenFromAggregators.includes(e)
        );
    }

    let renderer;
    $: {
        rendererName = rendererName in renderers ? rendererName : Object.keys(renderers)[0];
        renderer = renderers[rendererName];
    }
    let aggregator;
    $: {
        aggregatorName = aggregatorName in aggregators ? aggregatorName : Object.keys(aggregators)[0];
        aggregator = aggregators[aggregatorName];
    }
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
        {...$$restProps}
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
        bind:pivotconfig={pivotconfig}
        bind:getConfig={getConfig}
    />
</MainTable></div>

<style>
    .mtcontainer {
   
     max-width: 100%;
    }
    
     
   
   </style>