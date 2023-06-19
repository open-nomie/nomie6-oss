/** @typedef {typeof __propDef.props}  FilterBoxProps */
/** @typedef {typeof __propDef.events}  FilterBoxEvents */
/** @typedef {typeof __propDef.slots}  FilterBoxSlots */
export default class FilterBox extends SvelteComponentTyped<{
    values: any;
    name: any;
    valueFilter?: {};
    menuLimit?: number;
}, {
    keypress: KeyboardEvent;
    change: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type FilterBoxProps = typeof __propDef.props;
export type FilterBoxEvents = typeof __propDef.events;
export type FilterBoxSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        values: any;
        name: any;
        valueFilter?: {};
        menuLimit?: number;
    };
    events: {
        keypress: KeyboardEvent;
        change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
