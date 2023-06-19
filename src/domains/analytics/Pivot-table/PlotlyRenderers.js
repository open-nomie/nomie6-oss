import PlotlyComponent from './PlotlyRenderer.svelte';
import ScatterRenerer from './ScatterRenderer.svelte';
import { initPlotly } from './UI/Plotly.svelte';
import { partial } from './UI/utils';

function makeRenderer(Component, traceOptions = {}, layoutOptions = {}, transpose = false) {
    return partial(Component, { traceOptions, layoutOptions, transpose });
}

export default function (Plotly) {
    initPlotly(Plotly);

    return {
        'Grouped Column Chart': makeRenderer(PlotlyComponent, { type: 'bar' }, { barmode: 'group' }),
        'Stacked Column Chart': makeRenderer(PlotlyComponent, { type: 'bar' }, { barmode: 'relative' }),
        'Grouped Bar Chart': makeRenderer(
            PlotlyComponent,
            { type: 'bar', orientation: 'h' },
            { barmode: 'group' },
            true
        ),
        'Stacked Bar Chart': makeRenderer(
            PlotlyComponent,
            { type: 'bar', orientation: 'h' },
            { barmode: 'relative' },
            true
        ),
        'Line Chart': makeRenderer(PlotlyComponent),
        'Dot Chart': makeRenderer(PlotlyComponent, { mode: 'markers' }, {}, true),
        'Area Chart': makeRenderer(PlotlyComponent, { stackgroup: 1}),
        'Scatter Chart': ScatterRenerer,
        'Multiple Pie Chart': makeRenderer(
            PlotlyComponent,
            { type: 'pie', scalegroup: 1, hoverinfo: 'label+value', textinfo: 'none' },
            {},
            true
        ),
    };
}
