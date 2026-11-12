<svelte:options runes={true} />

<script lang="ts">
    import TableRenderers from './TableRenderers';
    import { PivotClass } from '../pivot-class';
    import { aggregators as defaultAggregators } from '../Pivot-table/Utilities';

    let {
        renderer = TableRenderers.Table,
        pivotconfig = $bindable(),
        getConfig = $bindable(false),
        opts = {},
        workingPivotId = "1dummy2",
        workingPivotTag = "Dummy",
        workingPivotEmoji = "🐣",
        workingPivotDefault = false,
        workingPivotDays = 90,
        workingPivotSearchTerm = {"enabled":false,terms:""},
        renderers = {},
        ...restProps
    } = $props();

    let aggregators = $state(defaultAggregators);

    // Build pivot config when getConfig changes
    $effect(() => {
        if (getConfig) {
            console.log('[PivotTable] getConfig effect triggered - rebuilding pivotconfig', {
                rows: restProps.rows,
                cols: restProps.cols,
                rowsDuplicates: restProps.rows?.filter((item, index) => restProps.rows.indexOf(item) !== index),
                colsDuplicates: restProps.cols?.filter((item, index) => restProps.cols.indexOf(item) !== index),
            });
            const config = { ...restProps, renderer };
            const currentconfig = new PivotClass({
                id: workingPivotId,
                tag: workingPivotTag,
                emoji: workingPivotEmoji,
                default: workingPivotDefault,
                days: workingPivotDays,
                searchterm: workingPivotSearchTerm,
                grouping: config.grouping,
                compactRows: config.compactRows,
                rowGroupBefore: config.rowGroupBefore,
                colGroupBefore: config.colGroupBefore,
                rendererName: Object.keys(renderers).find(key => renderers[key] === renderer) || "Table",
                aggregatorName: Object.keys(aggregators).find(key => aggregators[key] === config.aggregator) || "Count",
                hiddenAttributes: config.hiddenAttributes || [],
                hiddenFromAggregators: config.hiddenFromAggregators || [],
                hiddenFromDragDrop: config.hiddenFromDragDrop || [],
                unusedOrientationCutoff: config.unusedOrientationCutoff || 85,
                menuLimit: config.menuLimit || 500,
                options: {
                    "rows": config.rows || [],
                    "cols": config.cols || [],
                    "vals": config.vals || [],
                    "valueFilter": config.valueFilter || {},
                    "sorters": config.sorters || {},
                    "derivedAttributes": config.derivedAttributes,
                },
            });
            console.log('[PivotTable] pivotconfig rebuilt', {
                rows: currentconfig.options.rows,
                cols: currentconfig.options.cols,
            });
            pivotconfig = currentconfig;
        }
    });
</script>


<div class="cont">
<svelte:component this={renderer} {pivotconfig} {opts} {...restProps} />
</div>

<style>
    .cont {
        width: 100%;
        height: 100%;
    }
</style>
