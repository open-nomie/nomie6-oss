<script>
    import Plotly from './UI/Plotly.svelte';
    import { PivotData } from './Utilities';
    import { Prefs } from '../../preferences/Preferences'

    export let plotlyOptions = {},
        plotlyConfig = {},
        onRendererUpdate;

    export let traceOptions = {},
        layoutOptions = {},
        transpose = false;
    
    let currentwidth = 500;
    let screenratio = 1;
    let plotbgcolor = '#ffffff'
    let paperbgcolor = '#ffffff'
    let plottextcolor = '#000000'
    let theme = $Prefs.theme;
    if (theme == 'dark') {
        plotbgcolor = '#0D324F';
        paperbgcolor = '#0D324F';
        plottextcolor = 'ffffff';

    }
  
    setTimeout(()=>{currentwidth = document.querySelector('.pvtAxisContainer').clientWidth;
        screenratio = window.innerHeight/window.innerWidth;},10)
    
    

    let pivotData, rowKeys, colKeys, traceKeys, datumKeys, numInputs, data, hAxisTitle, groupByTitle, layout;
    $: {
        pivotData = new PivotData($$restProps);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        traceKeys = transpose ? colKeys : rowKeys;
        if (traceKeys.length === 0) {
            traceKeys.push([]);
        }
        datumKeys = transpose ? rowKeys : colKeys;
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
                        .getAggregator(transpose ? datumKey : traceKey, transpose ? traceKey : datumKey)
                        .value()
                );
                values.push(isFinite(val) ? val : null);
                labels.push(datumKey.join('-') || ' ');
            }
            const trace = { name: traceKey.join('-') || fullAggName };
            if (traceOptions.type === 'pie') {
                trace.values = values;
                trace.labels = labels.length > 1 ? labels : [fullAggName];
            } else {
                trace.x = transpose ? values : labels;
                trace.y = transpose ? labels : values;
            }
            return Object.assign(trace, traceOptions);
        });

        let titleText = fullAggName;
        hAxisTitle = transpose ? pivotData.props.rows.join('-') : pivotData.props.cols.join('-');
        groupByTitle = transpose ? pivotData.props.cols.join('-') : pivotData.props.rows.join('-');
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
            //width: window.innerWidth / getSizeFactor(window.innerWidth),
            width: currentwidth,
            //height: window.innerHeight / getSizeFactor(window.innerHeight),
            height:currentwidth * screenratio,
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
            //autosize:true,
            /* eslint-enable no-magic-numbers */
        };


        if (traceOptions.type === 'pie') {
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
                title: transpose ? fullAggName : null,
                automargin: true,
            };
            layout.yaxis = {
                title: transpose ? null : fullAggName,
                automargin: true,
            };
        }
    }
</script>

<Plotly
    {data}
    layout={Object.assign(layout, layoutOptions, plotlyOptions)}
    config={plotlyConfig}
    onUpdate={onRendererUpdate}
/>
