/** @typedef {typeof __propDef.props}  DropdownProps */
/** @typedef {typeof __propDef.events}  DropdownEvents */
/** @typedef {typeof __propDef.slots}  DropdownSlots */
export default class Dropdown extends SvelteComponentTyped<{
    current: any;
    values?: any[];
}, {
    change: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type DropdownProps = typeof __propDef.props;
export type DropdownEvents = typeof __propDef.events;
export type DropdownSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        current: any;
        values?: any[];
    };
    events: {
        change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
