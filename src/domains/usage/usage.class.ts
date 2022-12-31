import type { Dayjs } from "dayjs"
import type { CalendarMapOptionsType } from "../../modules/time/time"
import math from "../../utils/math/math"
import type NLog from "../nomie-log/nomie-log"

export type NomieUsageType = {
  values: Array<number>
  hours: Array<number>
  dates: Array<Dayjs>
  positivity: Array<number>
  displayValue?: string
  groupedBy?: CalendarMapOptionsType
  logs: Array<NLog>
  unitScores?: Array<Number>
  noteScores?: Array<Number>
  formatValue?: Function
}

export class NomieUsage {
  values: Array<number>
  hours: Array<number>
  dates: Array<Dayjs>
  positivity: Array<number>
  displayValue?: string
  groupedBy?: CalendarMapOptionsType
  logs: Array<NLog>
  unitScores?: Array<Number>
  noteScores?: Array<Number>
  formatValue?: Function 

  constructor(starter: NomieUsageType) {
    this.values = starter.values || []
    this.dates = starter.dates || []
    this.displayValue = starter.displayValue
    this.hours = starter.hours || []
    this.groupedBy = starter.groupedBy
    this.logs = starter.logs || []
    this.positivity = starter.positivity || []
    this.formatValue = starter.formatValue || this.plainFormatter
  }

  private plainFormatter = (v:number | string):string=>{
    return `${v}`
  }

  get average(): number {
    return math.average(this.values.filter((n) => !isNaN(n)))
  }

  private getMinMax(type: 'min' | 'max'): undefined | { date: Dayjs; value: number; display?: string } {
    let value: any
    if (type == 'min') {
      value = math.min(this.values)
    } else {
      value = math.max(this.values)
    }
    let index = this.values.indexOf(value)
    if (index > -1) {
      return {
        date: this.dates[index],
        value: this.values[index],
        display: this.formatValue(this.values[index]),
      }
    } else {
      return undefined
    }
  }

  get max(): any {
    return this.getMinMax('max')
  }

  get min(): any {
    return this.getMinMax('min')
  }

}

