/** @typedef {typeof __propDef.props}  PlotlyRendererProps */
/** @typedef {typeof __propDef.events}  PlotlyRendererEvents */
/** @typedef {typeof __propDef.slots}  PlotlyRendererSlots */
export default class PlotlyRenderer extends SvelteComponent<{
    [x: string]: any;
    onRendererUpdate: any;
    plotlyOptions?: {};
    plotlyConfig?: {};
    traceOptions?: {};
    layoutOptions?: {};
    transpose?: boolean;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type PlotlyRendererProps = typeof __propDef.props;
export type PlotlyRendererEvents = typeof __propDef.events;
export type PlotlyRendererSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        onRendererUpdate: any;
        plotlyOptions?: {};
        plotlyConfig?: {};
        traceOptions?: {};
        layoutOptions?: {};
        transpose?: boolean;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
