/** @typedef {typeof __propDef.props}  SortableProps */
/** @typedef {typeof __propDef.events}  SortableEvents */
/** @typedef {typeof __propDef.slots}  SortableSlots */
export default class Sortable extends SvelteComponentTyped<{
    options?: {};
    items?: any[];
}, {
    change: CustomEvent<any>;
} & {
    [evt: string]: CustomEvent<any>;
}, {
    default: {
        item: any;
    };
}> {
}
export type SortableProps = typeof __propDef.props;
export type SortableEvents = typeof __propDef.events;
export type SortableSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        options?: {};
        items?: any[];
    };
    events: {
        change: CustomEvent<any>;
    } & {
        [evt: string]: CustomEvent<any>;
    };
    slots: {
        default: {
            item: any;
        };
    };
};
export {};
