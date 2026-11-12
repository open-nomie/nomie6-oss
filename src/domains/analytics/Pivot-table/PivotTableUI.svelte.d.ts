/** @typedef {typeof __propDef.props}  PivotTableUiProps */
/** @typedef {typeof __propDef.events}  PivotTableUiEvents */
/** @typedef {typeof __propDef.slots}  PivotTableUiSlots */
export default class PivotTableUi extends SvelteComponent<{
    [x: string]: any;
    data: any;
    aggregatorName?: string;
    aggregators?: {
        Count: () => () => {
            count: number;
            push(): void;
            value(): number;
            format: (x: any) => string;
        };
        'Count Unique Values': any;
        'List Unique Values': any;
        Sum: ([attr]: [any]) => () => {
            sum: number;
            push(record: any): void;
            value(): number;
            format: (x: any) => string;
            numInputs: number;
        };
        'Integer Sum': ([attr]: [any]) => () => {
            sum: number;
            push(record: any): void;
            value(): number;
            format: (x: any) => string;
            numInputs: number;
        };
        Average: any;
        Median: any;
        'Sample Variance': any;
        'Sample Standard Deviation': any;
        Minimum: any;
        Maximum: any;
        First: any;
        Last: any;
        'Sum over Sum': ([num, denom]: [any, any]) => () => {
            sumNum: number;
            sumDenom: number;
            push(record: any): void;
            value(): number;
            format: (x: any) => string;
            numInputs: number;
        };
        'Sum as Fraction of Total': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
            selector: any;
            inner: any;
            push(record: any): void;
            format: (x: any) => string;
            value(): number;
            numInputs: any;
        };
        'Sum as Fraction of Rows': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
            selector: any;
            inner: any;
            push(record: any): void;
            format: (x: any) => string;
            value(): number;
            numInputs: any;
        };
        'Sum as Fraction of Columns': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
            selector: any;
            inner: any;
            push(record: any): void;
            format: (x: any) => string;
            value(): number;
            numInputs: any;
        };
        'Count as Fraction of Total': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
            selector: any;
            inner: any;
            push(record: any): void;
            format: (x: any) => string;
            value(): number;
            numInputs: any;
        };
        'Count as Fraction of Rows': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
            selector: any;
            inner: any;
            push(record: any): void;
            format: (x: any) => string;
            value(): number;
            numInputs: any;
        };
        'Count as Fraction of Columns': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
            selector: any;
            inner: any;
            push(record: any): void;
            format: (x: any) => string;
            value(): number;
            numInputs: any;
        };
    };
    vals?: any[];
    valueFilter?: {};
    menuLimit?: number;
    sorters?: {};
    derivedAttributes?: {};
    cols?: any[];
    rows?: any[];
    rendererName?: string;
    renderers?: {
        Table: typeof import("./TableRenderer.svelte").default;
        'Table Heatmap': any;
        'Table Col Heatmap': any;
        'Table Row Heatmap': any;
        TsvExport: typeof import("./TSVExportRenderer.svelte").default;
    };
    hiddenAttributes?: any[];
    hiddenFromAggregators?: any[];
    hiddenFromDragDrop?: any[];
    unusedOrientationCutoff?: number;
}, {
    [evt: string]: CustomEvent<any>;
}, {}> {
}
export type PivotTableUiProps = typeof __propDef.props;
export type PivotTableUiEvents = typeof __propDef.events;
export type PivotTableUiSlots = typeof __propDef.slots;
import { SvelteComponent } from "svelte";
declare const __propDef: {
    props: {
        [x: string]: any;
        data: any;
        aggregatorName?: string;
        aggregators?: {
            Count: () => () => {
                count: number;
                push(): void;
                value(): number;
                format: (x: any) => string;
            };
            'Count Unique Values': any;
            'List Unique Values': any;
            Sum: ([attr]: [any]) => () => {
                sum: number;
                push(record: any): void;
                value(): number;
                format: (x: any) => string;
                numInputs: number;
            };
            'Integer Sum': ([attr]: [any]) => () => {
                sum: number;
                push(record: any): void;
                value(): number;
                format: (x: any) => string;
                numInputs: number;
            };
            Average: any;
            Median: any;
            'Sample Variance': any;
            'Sample Standard Deviation': any;
            Minimum: any;
            Maximum: any;
            First: any;
            Last: any;
            'Sum over Sum': ([num, denom]: [any, any]) => () => {
                sumNum: number;
                sumDenom: number;
                push(record: any): void;
                value(): number;
                format: (x: any) => string;
                numInputs: number;
            };
            'Sum as Fraction of Total': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
                selector: any;
                inner: any;
                push(record: any): void;
                format: (x: any) => string;
                value(): number;
                numInputs: any;
            };
            'Sum as Fraction of Rows': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
                selector: any;
                inner: any;
                push(record: any): void;
                format: (x: any) => string;
                value(): number;
                numInputs: any;
            };
            'Sum as Fraction of Columns': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
                selector: any;
                inner: any;
                push(record: any): void;
                format: (x: any) => string;
                value(): number;
                numInputs: any;
            };
            'Count as Fraction of Total': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
                selector: any;
                inner: any;
                push(record: any): void;
                format: (x: any) => string;
                value(): number;
                numInputs: any;
            };
            'Count as Fraction of Rows': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
                selector: any;
                inner: any;
                push(record: any): void;
                format: (x: any) => string;
                value(): number;
                numInputs: any;
            };
            'Count as Fraction of Columns': (...x: any[]) => (data: any, rowKey: any, colKey: any) => {
                selector: any;
                inner: any;
                push(record: any): void;
                format: (x: any) => string;
                value(): number;
                numInputs: any;
            };
        };
        vals?: any[];
        valueFilter?: {};
        menuLimit?: number;
        sorters?: {};
        derivedAttributes?: {};
        cols?: any[];
        rows?: any[];
        rendererName?: string;
        renderers?: {
            Table: typeof import("./TableRenderer.svelte").default;
            'Table Heatmap': any;
            'Table Col Heatmap': any;
            'Table Row Heatmap': any;
            TsvExport: typeof import("./TSVExportRenderer.svelte").default;
        };
        hiddenAttributes?: any[];
        hiddenFromAggregators?: any[];
        hiddenFromDragDrop?: any[];
        unusedOrientationCutoff?: number;
    };
    events: {
        [evt: string]: CustomEvent<any>;
    };
    slots: {};
};
export {};
