/** @typedef {typeof __propDef.props}  ScatterRendererProps */
/** @typedef {typeof __propDef.events}  ScatterRendererEvents */
/** @typedef {typeof __propDef.slots}  ScatterRendererSlots */
export default class ScatterRenderer extends SvelteComponentTyped<{
    [x: string]: any;
    onRendererUpdate: any;
    plotlyOptions?: {};
    plotlyConfig?: {};
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type ScatterRendererProps = typeof __propDef.props;
export type ScatterRendererEvents = typeof __propDef.events;
export type ScatterRendererSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        onRendererUpdate: any;
        plotlyOptions?: {};
        plotlyConfig?: {};
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
