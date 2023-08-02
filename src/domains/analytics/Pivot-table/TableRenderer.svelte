<script>
    import { PivotData } from "./Utilities";
    import "./grouping.css";
    import "./groupingdark.css";
   import "./pivottable.css";
    
    import { Prefs } from '../../preferences/Preferences' 

    export let tableColorScaleGenerator = redColorScaleGenerator;
    export let tableOptions = {};
    export let compactRows = true;

    export let opts = {};

    let pvtValBGPlaceholder ="";
    let darkPlaceholder ="";
    let theme = $Prefs.theme;
    let cssVarStyles = "";
    if (theme == 'dark') {
        darkPlaceholder="D"
        if (!opts.heatmapMode) {pvtValBGPlaceholder = ";background-color:black;color:white"};
    let bgdark= '#1D2737';
    let border = '#2A303C';
    let bgbt= '#0D324F';
    let borderbt ='#0D324F'
    let fontcolorbt = '#C8C8C8'
    let pvtTotalcolor = '#716e6e'
	cssVarStyles = `--bg:${bgdark};--border:${border};--btbg:${bgbt};--btborder:${borderbt};--fontcolor:${fontcolorbt};--totalcolor:${pvtTotalcolor}`;}
    else {
        if (!opts.heatmapMode) {pvtValBGPlaceholder = ";background-color:white"};
        let bglight= '#E2F0F7';
        let border = '#CCCCCC';
        let bgbt= '#DFF0F8';
        let borderbt = '#CDEEFF'
        let fontcolorbt = '#000000'
        let pvtTotalcolor = '#b0b0b0'
        cssVarStyles = `--bg:${bglight};--border:${border};--btbg:${bgbt};--btborder:${borderbt};--fontcolor:${fontcolorbt};--totalcolor:${pvtTotalcolor}`;
    
    }
	
    
    let pivotData = new PivotData($$restProps);
    $: pivotData = new PivotData($$restProps);


    // helper function for setting row/col-span in pivotTableRenderer
    const spanSize = function (arr, i, j, no_loop = false) {
        let x;
        if (i !== 0) {
            let asc, end;
            let noDraw = true;
            for (x = 0, end = j, asc = end >= 0; asc ? x <= end : x >= end; asc ? x++ : x--) {
                if (arr[i - 1][x] !== arr[i][x]) {
                    noDraw = false;
                }
            }
            if (noDraw) {
                return -1;
            }
        }
        let len = 0;
        while (i + len < arr.length) {
            let asc1, end1;
            let stop = false;
            for (
                x = no_loop ? j : 0, end1 = j, asc1 = end1 >= 0;
                asc1 ? x <= end1 : x >= end1;
                asc1 ? x++ : x--
            ) {
                if (arr[i][x] !== arr[i + len][x]) {
                    stop = true;
                }
            }
            if (stop) {
                break;
            }
            len++;
        }
        return len;
    };

    function redColorScaleGenerator(values) {
        const min = Math.min.apply(Math, values);
        const max = Math.max.apply(Math, values);
        return (x) => {
            // eslint-disable-next-line no-magic-numbers
            const nonRed = 255 - Math.round((255 * (x - min)) / (max - min));
            if (theme == 'dark' && nonRed == 255) {return `background-color: rgb(0,0,0)` }
            else {return `background-color: rgb(255,${nonRed},${nonRed})`;}
        };
    }

    const flatKey = (arr) => arr.join(String.fromCharCode(0));
    const has = (set, arr) => arr.every(set.has, set);
    const add = (set, arr) => arr.forEach(set.add, set) || set;
    const remove = (set, arr) => arr.forEach(set.delete, set) || set;
    const toggle = (set, arr) => (has(set, arr) ? remove : add)(set, arr);

    let grandTotalAggregator;
    $: colAttrs = pivotData.props.cols;
    $: rowAttrs = pivotData.props.rows;
    $: grandTotalAggregator = pivotData.getAggregator([], []);

    let grouping, specialCase, useCompactRows;
    $: grouping = pivotData.props.grouping;
    $: useCompactRows = grouping && compactRows;
    // speacial case for spanSize counting (no_loop)
    $: specialCase = grouping && !pivotData.props.rowGroupBefore;

    let folded = new Set();
    const isFolded = (keys) => has(folded, keys.map(flatKey));
    const fold = (keys) => (folded = toggle(new Set(folded), keys.map(flatKey)));

    let rowKeys;
    let colKeys;
    let valueCellColors = (r, c, v) => "";
    let rowTotalColors = (r, c, v) => "";
    let colTotalColors = (v) => "";

    $: {
        rowKeys = pivotData.getRowKeys(true);
        colKeys = pivotData.getColKeys(true);

        if (grouping) {
            for (const key of folded) {
                const keyEx = key + String.fromCharCode(0);
                colKeys = colKeys.filter((colKey) => !flatKey(colKey).startsWith(keyEx));
                rowKeys = rowKeys.filter((rowKey) => !flatKey(rowKey).startsWith(keyEx));
            }
        }

        if (opts.heatmapMode) {
            const colorScaleGenerator = tableColorScaleGenerator;
            const rowTotalValues = colKeys.map((x) => pivotData.getAggregator([], x).value());
            rowTotalColors = colorScaleGenerator(rowTotalValues);
            const colTotalValues = rowKeys.map((x) => pivotData.getAggregator(x, []).value());
            colTotalColors = colorScaleGenerator(colTotalValues);

            if (opts.heatmapMode === "full") {
                const allValues = [];
                rowKeys.map((r) =>
                    colKeys.map((c) => allValues.push(pivotData.getAggregator(r, c).value()))
                );
                const colorScale = colorScaleGenerator(allValues);
                valueCellColors = (r, c, v) => colorScale(v);
            } else if (opts.heatmapMode === "row") {
                const rowColorScales = {};
                rowKeys.map((r) => {
                    const rowValues = colKeys.map((x) => pivotData.getAggregator(r, x).value());
                    rowColorScales[r] = colorScaleGenerator(rowValues);
                });
                valueCellColors = (r, c, v) => rowColorScales[r](v);
            } else if (opts.heatmapMode === "col") {
                const colColorScales = {};
                colKeys.map((c) => {
                    const colValues = rowKeys.map((x) => pivotData.getAggregator(x, c).value());
                    colColorScales[c] = colorScaleGenerator(colValues);
                });
                valueCellColors = (r, c, v) => colColorScales[c](v);
            }
        }
    }
    let getClickHandler;
    $: getClickHandler =
        tableOptions && tableOptions.clickCallback
            ? (value, rowValues, colValues) => {
                  const filters = {};
                  for (const i of Object.keys(colAttrs || {})) {
                      const attr = colAttrs[i];
                      if (colValues[i] !== null) {
                          filters[attr] = colValues[i];
                      }
                  }
                  for (const i of Object.keys(rowAttrs || {})) {
                      const attr = rowAttrs[i];
                      if (rowValues[i] !== null) {
                          filters[attr] = rowValues[i];
                      }
                  }
                  return (e) => tableOptions.clickCallback(e, value, filters, pivotData);
              }
            : null;

    let rbClass, cbClass, clickClass;
    $: rbClass = grouping ? (pivotData.props.rowGroupBefore ? "rowGroupBefore" : "rowGroupAfter") : "";
    $: cbClass = grouping ? (pivotData.props.colGroupBefore ? "colGroupBefore" : "colGroupAfter") : "";
    $: clickClass = (pred, closed) => (pred ? " pvtClickable" + (closed ? " closed" : "") : "");
</script>

<table class={`pvtTable ${rbClass} ${cbClass}`} style={cssVarStyles}>
    <thead>
        {#each colAttrs as c, j (`colAttr${j}`)}
            {@const clickable = grouping && colAttrs.length > j + 1}
            {@const levelKeys = colKeys.filter((x) => x.length === j + 1)}
            <tr>
                {#if j === 0 && rowAttrs.length !== 0}
                    <th colSpan={rowAttrs.length} rowSpan={colAttrs.length} />
                {/if}

                <th
                    class={"pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys))}
                    on:click={clickable ? (_) => fold(levelKeys) : null}
                >
                    {c}
                </th>
                {#each colKeys as colKey, i (`colKey${i}`)}
                    {@const xx = spanSize(colKeys, i, j)}
                    {#if xx !== -1}
                        <th
                            class={"pvtColLabel" +
                                clickClass(clickable && colKey[j], isFolded([colKey.slice(0, j + 1)]))}
                            colSpan={xx}
                            rowSpan={j === colAttrs.length - 1 && rowAttrs.length !== 0 ? 2 : 1}
                            on:click={clickable && colKey[j] ? (_) => fold([colKey.slice(0, j + 1)]) : null}
                        >   {#if grouping && colKey[j]=== undefined }
                            {colKey[j] ?? "Total"} <!-- RdL changed null to Total -->
                            {:else}
                            {colKey[j] ?? "null"} <!-- RdL changed null to Null -->
                            {/if}
                        </th>
                    {/if}
                {/each}

                {#if j === 0}
                    <th class="pvtTotalLabel" rowSpan={colAttrs.length + (rowAttrs.length === 0 ? 0 : 1)}>
                        Totals
                    </th>
                {/if}
            </tr>
        {/each}

        {#if rowAttrs.length !== 0}
            <tr>
                {#each rowAttrs as r, i (`rowAttr${i}`)}
                    {@const clickable = grouping && rowAttrs.length > i + 1}
                    {@const levelKeys = rowKeys.filter((x) => x.length === i + 1)}

                    <th
                        class={"pvtAxisLabel" + clickClass(clickable, isFolded(levelKeys))}
                        on:click={clickable ? (_) => fold(levelKeys) : null}
                    >
                        {r}
                    </th>
                {/each}
                <th class="pvtTotalLabel">
                    {colAttrs.length === 0 ? "Totals" : ""}
                </th>
            </tr>
        {/if}
    </thead>

    <tbody>
        {#each rowKeys as rowKey, i (`rowKeyRow${i}`)}
            {@const totalAggregator = pivotData.getAggregator(rowKey, [])}
            {@const rowGap = rowAttrs.length - rowKey.length}

            <tr class={rowGap ? "pvtLevel" +darkPlaceholder + rowGap : "pvtData"}>
                {#each rowKey as txt, j (`rowKeyLabel${i}-${j}`)}
                    {@const clickable = grouping && rowAttrs.length > j + 1}
                    {@const xx = useCompactRows ? 1 : spanSize(rowKeys, i, j, specialCase)}
                    {#if !((useCompactRows && j < rowKey.length - 1) || xx === -1)}
                        <th
                            class={"pvtRowLabel" +
                                clickClass(clickable && rowKey[j], isFolded([rowKey.slice(0, j + 1)]))}
                            rowSpan={xx}
                            colSpan={useCompactRows
                                ? rowAttrs.length + 1
                                : j === rowAttrs.length - 1 && colAttrs.length !== 0
                                ? 2
                                : 1}
                            style:padding-left={useCompactRows
                                ? `calc(var(--pvt-row-padding, 5px) + ${j} * var(--pvt-row-indent, 20px))`
                                : null}
                            on:click={clickable && rowKey[j] ? (_) => fold([rowKey.slice(0, j + 1)]) : null}
                        >
                            {txt}
                        </th>
                    {/if}
                {/each}
                {#if !useCompactRows && rowGap}
                    <th class="pvtRowLabel" colSpan={rowGap + 1}>
                        {"Total (" + rowKey[rowKey.length - 1] + ")"}
                    </th>
                {/if}

                {#each colKeys as colKey, j (`pvtVal${i}-${j}`)}
                    {@const aggregator = pivotData.getAggregator(rowKey, colKey)}
                    {@const colGap = colAttrs.length - colKey.length}
                    <!-- svelte-ignore a11y-click-events-have-key-events -->
                    {#if theme == "light" }
                    <td
                        class={"pvtVal" + (colGap ? " pvtLevel" + colGap : "")}
                        on:click={getClickHandler && getClickHandler(aggregator.value(), rowKey, colKey)}
                        style={valueCellColors(rowKey, colKey, aggregator.value())}
                        
                    >
                        {aggregator.format(aggregator.value())}
                    </td>
                    {:else}
                    <td
                        class={"pvtVal" + (colGap ? " pvtLevelD" + colGap : "")}
                        on:click={getClickHandler && getClickHandler(aggregator.value(), rowKey, colKey)}
                        style={valueCellColors(rowKey, colKey, aggregator.value())+";color:white"}
                        
                    >
                        {aggregator.format(aggregator.value())}
                    </td>
                    {/if}
                    
                {/each}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <td
                    class="pvtTotal"
                    on:click={getClickHandler && getClickHandler(totalAggregator.value(), rowKey, [null])}
                    style={colTotalColors(totalAggregator.value())}
                >
                    {totalAggregator.format(totalAggregator.value())}
                </td>
            </tr>
        {/each}
        <tr>
            <th class="pvtTotalLabel" colSpan={rowAttrs.length + (colAttrs.length === 0 ? 0 : 1)}>
                Totals
            </th>

            {#each colKeys as colKey, i (`total${i}`)}
                {@const totalAggregator = pivotData.getAggregator([], colKey)}
                {@const colGap = colAttrs.length - colKey.length}
                <!-- svelte-ignore a11y-click-events-have-key-events -->
                <td
                    class={"pvtTotal" + (colGap ? " pvtLevel" + colGap : "")}
                    on:click={getClickHandler && getClickHandler(totalAggregator.value(), [null], colKey)}
                    style={rowTotalColors(totalAggregator.value())}
                >
                    {totalAggregator.format(totalAggregator.value())}
                </td>
            {/each}
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <td
                on:click={getClickHandler && getClickHandler(grandTotalAggregator.value(), [null], [null])}
                class="pvtGrandTotal"
            >
                {grandTotalAggregator.format(grandTotalAggregator.value())}
            </td>
        </tr>
    </tbody>
</table>

