<script context="module">
    let Plotly;

    export function initPlotly(module) {
        Plotly = module;
    }
</script>

<script>
  
    export let data, layout, config;
    export const onUpdate = () => {}; // TODO: connect to plotly events

    function create(node, options) {
        Plotly.newPlot(node, options);

        return {
            update(options) {
                //options.layout.width = width;
                //options.layout.height = height;
                Plotly.newPlot(node, options);
            },
            destroy() {
                Plotly.purge(node);
            },
        };
    }
</script>

{#if Plotly}
    <div use:create={{ data, layout, config }} />
{:else}
    <p>Error! Plotly.js not initialized.</p>
{/if}
