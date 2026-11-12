/** @typedef {typeof __propDef.props}  DnDCellProps */
/** @typedef {typeof __propDef.events}  DnDCellEvents */
/** @typedef {typeof __propDef.slots}  DnDCellSlots */
export default class DnDCell extends SvelteComponent<{
    items: any;
    onChange: any;
    valueFilter: any;
    attrValues: any;
    sorters: any;
    menuLimit: any;
    onUpdate: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type DnDCellProps = typeof __propDef.props;
export type DnDCellEvents = typeof __propDef.events;
export type DnDCellSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        items: any;
        onChange: any;
        valueFilter: any;
        attrValues: any;
        sorters: any;
        menuLimit: any;
        onUpdate: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
