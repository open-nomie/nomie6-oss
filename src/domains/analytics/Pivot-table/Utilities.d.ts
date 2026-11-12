export namespace aggregatorTemplates {
    export function countUnique(f: any): ([attr]: [any]) => () => {
        uniq: any[];
        push(record: any): void;
        value(): any;
        format: (x: any) => string;
        numInputs: number;
    };
    export function listUnique(s: any): ([attr]: [any]) => () => {
        uniq: any[];
        push(record: any): void;
        value(): any;
        format: (x: any) => string;
        numInputs: number;
    };
    export function max(f: any): ([attr]: [any]) => (data: any) => {
        val: any;
        sorter: any;
        push(record: any): void;
        value(): any;
        format(x: any): any;
        numInputs: number;
    };
    export function min(f: any): ([attr]: [any]) => (data: any) => {
        val: any;
        sorter: any;
        push(record: any): void;
        value(): any;
        format(x: any): any;
        numInputs: number;
    };
    export function first(f: any): ([attr]: [any]) => (data: any) => {
        val: any;
        sorter: any;
        push(record: any): void;
        value(): any;
        format(x: any): any;
        numInputs: number;
    };
    export function last(f: any): ([attr]: [any]) => (data: any) => {
        val: any;
        sorter: any;
        push(record: any): void;
        value(): any;
        format(x: any): any;
        numInputs: number;
    };
    export function median(f: any): ([attr]: [any]) => () => {
        vals: any[];
        push(record: any): void;
        value(): number;
        format: (x: any) => string;
        numInputs: number;
    };
    export function average(f: any): ([attr]: [any]) => () => {
        n: number;
        m: number;
        s: number;
        push(record: any): void;
        value(): number;
        format: (x: any) => string;
        numInputs: number;
    };
    function _var(ddof: any, f: any): ([attr]: [any]) => () => {
        n: number;
        m: number;
        s: number;
        push(record: any): void;
        value(): number;
        format: (x: any) => string;
        numInputs: number;
    };
    export { _var as var };
    export function stdev(ddof: any, f: any): ([attr]: [any]) => () => {
        n: number;
        m: number;
        s: number;
        push(record: any): void;
        value(): number;
        format: (x: any) => string;
        numInputs: number;
    };
}
export const aggregators: {
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
export namespace derivers {
    function bin(col: any, binWidth: any): (record: any) => number;
    function dateFormat(col: any, formatString: any, utcOutput?: boolean, mthNames?: string[], dayNames?: string[]): (record: any) => any;
}
export namespace locales {
    namespace en {
        export { aggregators };
        export namespace localeStrings {
            const renderError: string;
            const computeError: string;
            const uiRenderError: string;
            const selectAll: string;
            const selectNone: string;
            const tooMany: string;
            const filterResults: string;
            const apply: string;
            const cancel: string;
            const totals: string;
            const vs: string;
            const by: string;
        }
    }
}
export function naturalSort(as?: any, bs?: any, nulls_first?: boolean): number;
export function numberFormat(opts_in: any): (x: any) => string;
export function getSort(sorters: any, attr: any): any;
export function sortAs(order: any): (a?: any, b?: any, nulls_first?: boolean) => number;
export class PivotData {
    constructor(inputProps?: {});
    props: {
        aggregators: {
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
        cols: any[];
        rows: any[];
        vals: any[];
        aggregatorName: string;
        sorters: {};
        valueFilter: {};
        rowOrder: string;
        colOrder: string;
        derivedAttributes: {};
        grouping: boolean;
        rowGroupBefore: boolean;
        colGroupBefore: boolean;
    };
    aggregator: any;
    tree: {};
    rowKeys: any[];
    colKeys: any[];
    rowTotals: {};
    colTotals: {};
    allTotal: any;
    sorted: boolean;
    filter(record: any): boolean;
    forEachMatchingRecord(criteria: any, callback: any): any;
    arrSort(attrs: any, nulls_first: any): (a: any, b: any) => any;
    sortKeys(): void;
    getColKeys(all_keys?: boolean): any[];
    getRowKeys(all_keys?: boolean): any[];
    processRecord(record: any): void;
    getAggregator(rowKey: any, colKey: any): any;
}
export namespace PivotData {
    function forEachRecord(input: any, derivedAttributes: any, f: any): any;
    namespace defaultProps {
        export { aggregators };
        export const cols: any[];
        export const rows: any[];
        export const vals: any[];
        export const aggregatorName: string;
        export const sorters: {};
        export const valueFilter: {};
        export const rowOrder: string;
        export const colOrder: string;
        export const derivedAttributes: {};
        export const grouping: boolean;
        export const rowGroupBefore: boolean;
        export const colGroupBefore: boolean;
    }
}
