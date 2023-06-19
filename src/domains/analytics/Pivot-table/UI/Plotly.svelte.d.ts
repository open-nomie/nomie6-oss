export function initPlotly(module: any): void;
/** @typedef {typeof __propDef.props}  PlotlyProps */
/** @typedef {typeof __propDef.events}  PlotlyEvents */
/** @typedef {typeof __propDef.slots}  PlotlySlots */
export default class Plotly extends SvelteComponentTyped<{
    data: any;
    layout: any;
    config: any;
    onUpdate?: () => void;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
    get onUpdate(): () => void;
}
export type PlotlyProps = typeof __propDef.props;
export type PlotlyEvents = typeof __propDef.events;
export type PlotlySlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        data: any;
        layout: any;
        config: any;
        onUpdate?: () => void;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
