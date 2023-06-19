<script>
    import { PivotData } from './Utilities';
    import Plotly from './UI/Plotly.svelte';
    import { Prefs } from '../../preferences/Preferences'


    export let plotlyOptions = {},
        plotlyConfig = {},
        onRendererUpdate;

    let pivotData, rowKeys, colKeys, data, layout;
    let screenratio = 1;
    let currentwidth = 500;
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
    

    $: {
        pivotData = new PivotData($$restProps);
        rowKeys = pivotData.getRowKeys();
        colKeys = pivotData.getColKeys();
        if (rowKeys.length === 0) {
            rowKeys.push([]);
        }
        if (colKeys.length === 0) {
            colKeys.push([]);
        }

        data = { x: [], y: [], text: [], type: 'scatter', mode: 'markers' };

        rowKeys.map((rowKey) => {
            colKeys.map((colKey) => {
                const v = pivotData.getAggregator(rowKey, colKey).value();
                if (v !== null) {
                    data.x.push(colKey.join('-'));
                    data.y.push(rowKey.join('-'));
                    data.text.push(v);
                }
            });
        });

        layout = {
            title: pivotData.props.rows.join('-') + ' vs ' + pivotData.props.cols.join('-'),
            hovermode: 'closest',
            /* eslint-disable no-magic-numbers */
            xaxis: { title: pivotData.props.cols.join('-'), automargin: true },
            yaxis: { title: pivotData.props.rows.join('-'), automargin: true },
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
        };
    }
</script>

<Plotly
    data={[data]}
    layout={Object.assign(layout, plotlyOptions)}
    config={plotlyConfig}
    onUpdate={onRendererUpdate}
/>
