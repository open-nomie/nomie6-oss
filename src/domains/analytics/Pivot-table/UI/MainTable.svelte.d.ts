/** @typedef {typeof __propDef.props}  MainTableProps */
/** @typedef {typeof __propDef.events}  MainTableEvents */
/** @typedef {typeof __propDef.slots}  MainTableSlots */
export default class MainTable extends SvelteComponentTyped<{
    horizUnused: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {
    rendererCell: {};
    unusedAttrsCell: {};
    aggregatorCell: {};
    colAttrsCell: {};
    rowAttrsCell: {};
    outputCell: {};
}> {
}
export type MainTableProps = typeof __propDef.props;
export type MainTableEvents = typeof __propDef.events;
export type MainTableSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        horizUnused: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        rendererCell: {};
        unusedAttrsCell: {};
        aggregatorCell: {};
        colAttrsCell: {};
        rowAttrsCell: {};
        outputCell: {};
    };
};
export {};
