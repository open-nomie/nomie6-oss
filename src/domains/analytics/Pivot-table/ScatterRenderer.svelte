<svelte:options runes={true} />

<script>
    import { PivotData } from './Utilities';
    import Plotly from './UI/Plotly.svelte';
    import { Prefs } from '../../preferences/Preferences'

    const props = $props();
    const { plotlyOptions = {}, plotlyConfig = {}, onRendererUpdate } = props;

    let pivotData = $state(undefined);
    let rowKeys = $state([]);
    let colKeys = $state([]);
    let data = $state({});
    let layout = $state({});
    let screenratio = $state(1);
    let currentwidth = $state(500);
    let plotbgcolor = $state('#ffffff')
    let paperbgcolor = $state('#ffffff')
    let plottextcolor = $state('#000000')
    let theme = $state($Prefs.theme);
    if (theme == 'dark') {
        plotbgcolor = '#0D324F';
        paperbgcolor = '#0D324F';
        plottextcolor = 'ffffff';

    }


    setTimeout(()=>{currentwidth = document.querySelector('.pvtAxisContainer').clientWidth;
        screenratio = window.innerHeight/window.innerWidth;},10)

    import { untrack } from 'svelte';

    $effect(() => {
        // Establish dependencies by accessing props outside untrack
        const currentProps = props;
        const currentCurrentwidth = currentwidth;
        const currentScreenratio = screenratio;
        const currentPlotbgcolor = plotbgcolor;
        const currentPaperbgcolor = paperbgcolor;
        const currentPlottextcolor = plottextcolor;

        // Untrack all state writes to prevent effect from re-running when it modifies state
        untrack(() => {
            pivotData = new PivotData(currentProps);
            rowKeys = pivotData.getRowKeys();
            colKeys = pivotData.getColKeys();
            if (rowKeys.length === 0) {
                rowKeys.push([]);
            }
            if (colKeys.length === 0) {
                colKeys.push([]);
            }

            const dataObj = { x: [], y: [], text: [], type: 'scatter', mode: 'markers' };

            rowKeys.map((rowKey) => {
                colKeys.map((colKey) => {
                    const v = pivotData.getAggregator(rowKey, colKey).value();
                    if (v !== null) {
                        dataObj.x.push(colKey.join('-'));
                        dataObj.y.push(rowKey.join('-'));
                        dataObj.text.push(v);
                    }
                });
            });

            data = dataObj;

            layout = {
                title: pivotData.props.rows.join('-') + ' vs ' + pivotData.props.cols.join('-'),
                hovermode: 'closest',
                /* eslint-disable no-magic-numbers */
                xaxis: { title: pivotData.props.cols.join('-'), automargin: true },
                yaxis: { title: pivotData.props.rows.join('-'), automargin: true },
                width: currentCurrentwidth,
                height: currentCurrentwidth * currentScreenratio,
                dragmode: false,
                plot_bgcolor: currentPlotbgcolor,
                paper_bgcolor: currentPaperbgcolor,
                font: { size: 18 / (1400 / currentCurrentwidth), color: currentPlottextcolor },
                legend: { "orientation": "h" },
                margin: {
                    l: 0,
                    r: 0,
                    b: 100,
                    t: 100,
                    pad: 4
                },
            };
        });
    })
</script>

<Plotly
    data={[data]}
    layout={Object.assign(layout, plotlyOptions)}
    config={plotlyConfig}
    onUpdate={onRendererUpdate}
/>
