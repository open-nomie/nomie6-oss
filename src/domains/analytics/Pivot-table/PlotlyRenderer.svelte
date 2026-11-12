<svelte:options runes={true} />

<script>
    import { untrack } from 'svelte';
    import Plotly from './UI/Plotly.svelte';
    import { PivotData } from './Utilities';
    import { Prefs } from '../../preferences/Preferences'

    const props = $props();
    const { plotlyOptions = {}, plotlyConfig = {}, onRendererUpdate, traceOptions = {}, layoutOptions = {}, transpose = false } = props;

    let currentwidth = $state(500);
    let screenratio = $state(1);
    let plotbgcolor = $state('#ffffff')
    let paperbgcolor = $state('#ffffff')
    let plottextcolor = $state('#000000')
    let theme = $state($Prefs.theme);
    if (theme == 'dark') {
        plotbgcolor = '#0D324F';
        paperbgcolor = '#0D324F';
        plottextcolor = 'ffffff';

    }

    // With Plotly autosize, we don't need to manually calculate width
    $effect(() => {
        screenratio = window.innerHeight / window.innerWidth;
    })



    let pivotData = $state(undefined);
    let rowKeys = $state([]);
    let colKeys = $state([]);
    let traceKeys = $state([]);
    let datumKeys = $state([]);
    let numInputs = $state(0);
    let data = $state([]);
    let hAxisTitle = $state('');
    let groupByTitle = $state('');
    let layout = $state({});

    let recomputeKey = $state(0);

    $effect(() => {
        // Establish dependencies by accessing props outside untrack
        // Only the state writes are untracked, not the dependency tracking
        const {
            cols = [],
            rows = [],
            vals = [],
            data: propData = [],
            derivedAttributes = [],
            aggregator,
            sorters = {}
        } = props;
        const currentTranspose = transpose;
        const currentTraceOptions = traceOptions;
        const currentLayoutOptions = layoutOptions;

        // Untrack all state writes to prevent effect from re-running when it modifies state
        untrack(() => {
            pivotData = new PivotData(props);
            rowKeys = pivotData.getRowKeys();
            colKeys = pivotData.getColKeys();
            traceKeys = currentTranspose ? colKeys : rowKeys;
            if (traceKeys.length === 0) {
                traceKeys.push([]);
            }
            datumKeys = currentTranspose ? rowKeys : colKeys;
            if (datumKeys.length === 0) {
                datumKeys.push([]);
            }

            let fullAggName = pivotData.props.aggregatorName;
            numInputs = pivotData.props.aggregators[fullAggName]([])().numInputs || 0;
            if (numInputs !== 0) {
                fullAggName += ` of ${pivotData.props.vals.slice(0, numInputs).join(', ')}`;
            }
            data = traceKeys.map((traceKey) => {
                const values = [];
                const labels = [];
                for (const datumKey of datumKeys) {
                    const val = parseFloat(
                        pivotData
                            .getAggregator(currentTranspose ? datumKey : traceKey, currentTranspose ? traceKey : datumKey)
                            .value()
                    );
                    values.push(isFinite(val) ? val : null);
                    labels.push(datumKey.join('-') || ' ');
                }
                const trace = { name: traceKey.join('-') || fullAggName };
                if (currentTraceOptions.type === 'pie') {
                    trace.values = values;
                    trace.labels = labels.length > 1 ? labels : [fullAggName];
                } else {
                    trace.x = currentTranspose ? values : labels;
                    trace.y = currentTranspose ? labels : values;
                }
                return Object.assign(trace, currentTraceOptions);
            });

            let titleText = fullAggName;
            hAxisTitle = currentTranspose ? pivotData.props.rows.join('-') : pivotData.props.cols.join('-');
            groupByTitle = currentTranspose ? pivotData.props.cols.join('-') : pivotData.props.rows.join('-');
            if (hAxisTitle !== '') {
                titleText += ` vs ${hAxisTitle}`;
            }
            if (groupByTitle !== '') {
                titleText += ` by ${groupByTitle}`;
            }

            layout = {
                title: titleText,
                hovermode: 'closest',
                xaxis: {fixedrange: true},
                yaxis: {fixedrange: true},
                /* eslint-disable no-magic-numbers */
                autosize: true,
                dragmode:false,
                plot_bgcolor: plotbgcolor,
                paper_bgcolor: paperbgcolor,
                font: {size:18 / (1400/currentwidth),color:plottextcolor},
                legend: {"orientation": "h"},
                margin: {
        l: 0,
        r: 0,
        b: 100,
        t: 100,
        pad: 4
      },
                /* eslint-enable no-magic-numbers */
            };


            if (currentTraceOptions.type === 'pie') {
                const columns = Math.ceil(Math.sqrt(data.length));
                const rows = Math.ceil(data.length / columns);
                layout.grid = { columns, rows };
                data.forEach((d, i) => {
                    d.domain = {
                        row: Math.floor(i / columns),
                        column: i - columns * Math.floor(i / columns),
                    };
                    if (data.length > 1) {
                        d.title = d.name;
                    }
                });
                if (data[0].labels.length === 1) {
                    layout.showlegend = false;
                }
            } else {
                layout.xaxis = {
                    title: currentTranspose ? fullAggName : null,
                    automargin: true,
                };
                layout.yaxis = {
                    title: currentTranspose ? null : fullAggName,
                    automargin: true,
                };
            }
        });
    })

</script>

<Plotly
    {data}
    layout={Object.assign({}, layout, layoutOptions, plotlyOptions)}
    config={plotlyConfig}
    onUpdate={onRendererUpdate}
/>
