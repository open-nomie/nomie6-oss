import type { Dayjs, OpUnitType } from 'dayjs'
import dayjs from 'dayjs'

export type WidgetDateConfig = {
  date?: Dayjs
  add?: Array<any>
  subtract?: Array<any>
  startOf?: OpUnitType
  endOf?: OpUnitType
}

export class WidgetDate {
  date?: Dayjs
  add?: Array<any>
  subtract?: Array<any>
  startOf?: OpUnitType
  endOf?: OpUnitType

  constructor(part: WidgetDateConfig) {
    if (part) {
      this.date = part.date
      this.subtract = part.subtract
      this.add = part.add
      this.endOf = part.endOf
      this.startOf = part.startOf
    }
  }

  public toDate(): Dayjs {
    let date = this.date ? this.date : dayjs()
    if (this.subtract instanceof Array) {
      date = date.subtract(this.subtract[0], this.subtract[1])
    }
    if (this.add instanceof Array) {
      date = date.add(this.subtract[0], this.subtract[1])
    }
    if (this.startOf) {
      date = date.startOf(this.startOf)
    }
    if (this.endOf) {
      date = date.endOf(this.endOf)
    }
    return date
  }
}
