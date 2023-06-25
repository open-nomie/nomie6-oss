import nid from '../../modules/nid/nid'

export type PivotType = {
  id?: string
  tag?: string
  days?: number
  emoji?: string
  default?: boolean
  grouping?: boolean
  compactRows?: boolean
  rowGroupBefore?: boolean
  colGroupBefore?: boolean
  rendererName? : string
  aggregatorName? : string
  hiddenAttributes? : []
  hiddenFromAggregators? : []
  hiddenFromDragDrop? : []
  unusedOrientationCutoff? :  number
  menuLimit? : number
  options?: object
  searchterm?: object
}

export class PivotClass {
  id?: string
  tag?: string
  days?: number
  emoji?: string
  default?: boolean
  grouping?: boolean
  compactRows?: boolean
  rowGroupBefore?: boolean
  colGroupBefore?: boolean
  rendererName? : string
  aggregatorName? : string
  hiddenAttributes? : []
  hiddenFromAggregators? : []
  hiddenFromDragDrop? : []
  unusedOrientationCutoff? :  number
  menuLimit? : number
  options?: object
  searchterm?: object

  constructor(starter: PivotType = {}) {
    this.id = starter.id || nid()
    this.tag = starter.tag || "New Pivot"
    this.days = starter.days || 90
    this.emoji = starter.emoji || "🧊"
    this.default = starter.default || false
    this.grouping = starter.grouping || false
    this.compactRows = starter.compactRows || false
    this.rowGroupBefore = starter.rowGroupBefore || false
    this.colGroupBefore = starter.colGroupBefore || false
    this.rendererName = starter.rendererName || "Table"
    this.aggregatorName = starter.aggregatorName || "Count"
    this.hiddenAttributes = starter.hiddenAttributes || []
    this.hiddenFromAggregators = starter.hiddenFromAggregators || []
    this.hiddenFromDragDrop = starter.hiddenFromDragDrop || []
    this.unusedOrientationCutoff = starter.unusedOrientationCutoff || 85
    this.menuLimit = starter.menuLimit || 500
    this.options = starter.options || {rows: [],cols: [],derivedAttributes: {},vals: [],sorters:{},valueFilter:{}}
    this.searchterm = starter.searchterm || {enable: false, terms: ""}
  }

  get asObject() {
    return {
      id: this.id,
      tag: this.tag,
      days: this.days,
      emoji: this.emoji,
      default: this.default,
      grouping: this.grouping,
      compactRows: this.compactRows,
      rowGroupBefore: this.rowGroupBefore,
      colGroupBefore: this.colGroupBefore,
      rendererName: this.rendererName,
      aggregatorName: this.aggregatorName,
      hiddenAttributes: this.hiddenAttributes,
      hiddenFromAggregators: this.hiddenFromAggregators,
      hiddenFromDragDrop: this.hiddenFromDragDrop,
      unusedOrientationCutoff: this.unusedOrientationCutoff,
      menuLimit: this.menuLimit,
      options: this.options,
      searchterm: this.searchterm
    }
  }
}
