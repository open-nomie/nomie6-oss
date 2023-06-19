/** @typedef {typeof __propDef.props}  AggregatorsProps */
/** @typedef {typeof __propDef.events}  AggregatorsEvents */
/** @typedef {typeof __propDef.slots}  AggregatorsSlots */
export default class Aggregators extends SvelteComponentTyped<{
    onChange: any;
    onUpdate: any;
    aggregatorName: any;
    aggregators: any;
    valAttrs: any;
    vals: any;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type AggregatorsProps = typeof __propDef.props;
export type AggregatorsEvents = typeof __propDef.events;
export type AggregatorsSlots = typeof __propDef.slots;
import { SvelteComponentTyped } from "svelte";
declare const __propDef: {
    props: {
        onChange: any;
        onUpdate: any;
        aggregatorName: any;
        aggregators: any;
        valAttrs: any;
        vals: any;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
