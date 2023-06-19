<script>
    import { PivotData } from "./Utilities";
    import { onMount } from "svelte";

    let options;

    let pivotData, rowKeys, colKeys, headerRow, value;
    $: {
        options = $$props;

        pivotData = new PivotData(options);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        if (rowKeys.length === 0) {
            rowKeys.push([]);
        }
        if (colKeys.length === 0) {
            colKeys.push([]);
        }

        headerRow = pivotData.props.rows.map((r) => r);
        if (colKeys.length === 1 && colKeys[0].length === 0) {
            headerRow.push(options.aggregatorName);
        } else {
            colKeys.map((c) => headerRow.push(c.join("-")));
        }

        const result = rowKeys.map((r) => {
            const row = r.map((x) => x);
            colKeys.map((c) => {
                const v = pivotData.getAggregator(r, c).value();
                row.push(v ? v : "");
            });
            return row;
        });

        result.unshift(headerRow);

        value = result.map((r) => r.join("\t")).join("\n");
    }
    // style={{ width: window.innerWidth / 2, height: window.innerHeight / 2 }}

    let node;
    onMount(() => {
        node.style.width = node.parentElement.clientWidth + "px";
        node.style.height = node.parentElement.clientHeight + "px";
    });
</script>

<textarea bind:this={node} {value} readOnly={true} />
