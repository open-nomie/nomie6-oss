<script context="module">
    let Plotly = $state(undefined);

    export function initPlotly(module) {
        Plotly = module;
    }
</script>

<svelte:options runes={true} />

<script>
    import { untrack } from 'svelte';

    const { data, layout, config } = $props()
    const onUpdate = () => {}; // TODO: connect to plotly events

    function create(node, options) {
        // Extract plain values from reactive proxies so Plotly's mutations don't trigger reactivity
        untrack(() => {
            Plotly.newPlot(
                node,
                JSON.parse(JSON.stringify(options.data)),
                JSON.parse(JSON.stringify(options.layout)),
                options.config
            );
        });

        return {
            update(newOptions) {
                // Extract plain values to prevent Plotly's mutations from triggering reactive updates
                untrack(() => {
                    Plotly.newPlot(
                        node,
                        JSON.parse(JSON.stringify(newOptions.data)),
                        JSON.parse(JSON.stringify(newOptions.layout)),
                        newOptions.config
                    );
                });
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
