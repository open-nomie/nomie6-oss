/** @typedef {typeof __propDef.props}  TableRendererProps */
/** @typedef {typeof __propDef.events}  TableRendererEvents */
/** @typedef {typeof __propDef.slots}  TableRendererSlots */
export default class TableRenderer extends SvelteComponent<{
    [x: string]: any;
    tableColorScaleGenerator?: (values: any) => (x: any) => string;
    tableOptions?: {};
    compactRows?: boolean;
    opts?: {};
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type TableRendererProps = typeof __propDef.props;
export type TableRendererEvents = typeof __propDef.events;
export type TableRendererSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        tableColorScaleGenerator?: (values: any) => (x: any) => string;
        tableOptions?: {};
        compactRows?: boolean;
        opts?: {};
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
