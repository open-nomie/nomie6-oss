import nid from '../../../modules/nid/nid'
import type NLog from '../../nomie-log/nomie-log'

import { truncateText } from '../../../utils/text/text'
import NDate from '../../../utils/ndate/ndate'
import type { Token } from '../../../modules/tokenizer/lite'
import type { ITrackables } from '../../trackable/trackable-utils'

import { tokenToTrackable } from '../../../modules/tokenizer/tokenToTrackable'
import type { Trackable } from '../../trackable/Trackable.class'
import dayjs, { Dayjs } from 'dayjs'

import { parseNumber } from '../../../utils/parseNumber/parseNumber'
import { timeFrames, WidgetTimeFrame } from './widget-timeframe'
import type { WidgetTimeFrameConfig } from './widget-timeframe'
import type { TimeFramesType } from './widget-timeframe'
import type { PrefsWeekStartTypes } from '../../preferences/Preferences'

/**
 * Widget
 * The Widget is a central object that defines
 * what we're showing, what type of block we should show,
 * and what the timeframe is.
 */

export const TimeframeType = {
  start: Dayjs,
  end: Dayjs,
}

export type WidgetPayloadType = {
  element?: Token
  id?: string
  size?: 'sm' | 'md' | 'lg'
  type?: string
  timeRange?: TimeFramesType
  includeAvg?: boolean
  description?: string
  compareValue?: number
  compareOverColor?: string
  compareUnderColor?: string
  value?: any
  math?: string
  logs?: Array<NLog>
  positivity?: any
  stats?: any
  lastUsed?: any
  trackables?: ITrackables
  trackable?: Trackable
  token?: Token
  tokens?: Array<Token>
  data?: any
}

export class WidgetClass {
  public _editing?: any
  public compareOverColor?: string
  public compareUnderColor?: string
  public compareValue?: number
  public dateFormat: string
  public description?: string
  public token?: Token
  public tokens?: Array<Token>
  public id?: string
  public includeAvg?: boolean = false
  public lastUsed?: any
  public logs?: Array<NLog>
  public math?: 'mean' | 'sum'
  public positivity?: any
  public size?: 'sm' | 'md' | 'lg' = 'md'
  public stats?: any
  public timeFormat?: string = 'h:mm a'
  public timeRange?: TimeFramesType
  public type?: string = 'value'
  public loading?: boolean = false
  public data?: any;

  constructor(payload?: WidgetPayloadType) {
    payload = payload || {}

    this.id = payload.id || nid()
    this.type = payload.type
    this.description = payload.description
    this.size = payload.size || 'md'
    // Compare Value
    if (typeof payload.compareValue == 'string') {
      payload.compareValue = parseNumber(payload.compareValue)
    }
    this.data = payload.data || {};
    this.compareValue = payload.compareValue
    this.compareOverColor = payload.compareOverColor
    this.compareUnderColor = payload.compareUnderColor
    // Including Avg
    this.includeAvg = payload.includeAvg ? true : false

    const oldTimeRange: any = payload.timeRange
    if (typeof oldTimeRange === 'string') {
      this.timeRange = `${oldTimeRange}`
    } else if (typeof oldTimeRange === 'object') {
      this.timeRange = oldTimeRange.id
    } else {
      // TODO: Make sure this doesn't screw anything up
      this.timeRange = 'today'
    }
    // If an element

    this.token = payload.token || payload.element
    this.tokens = payload.tokens?.length ? payload.tokens : [this.token]
  }

  get timeframe(): { start: Dayjs; end: Dayjs; details: WidgetTimeFrame } {
    let timeFrame: WidgetTimeFrameConfig = timeFrames.find((t) => t.id == this.timeRange)
    let res = new WidgetTimeFrame(timeFrame)
    return {
      end: res.end.toDate(),
      start: res.start.toDate(),
      details: res,
    }
  }

  get asObject(): any {
    const obj = JSON.parse(JSON.stringify(this))
    // if (!obj.element) {
    //   obj.element = trackableToToken(this.trackable)
    // }
    delete obj.trackables
    delete obj.trackaable
    delete obj.logs
    delete obj._editing
    return obj
  }

  getTrackable(trackables: ITrackables): Trackable {
    return tokenToTrackable(this.token, trackables)
  }

  getColor(trackables: ITrackables): string {
    const trackable = tokenToTrackable(this.token, trackables || {})
    return trackable.color
  }

  getTitle(def?:string): string {
    if (this.type == 'text') {
      return truncateText(this.description, 30)
    } else if (this.token?.id) {
      return this.token?.id
    } else if(def) {
      return def;
    } else if(this.type) {
      return this.type
    }
    return 'unknown'
  }

  getLabel(): string {
    if (this.timeRange) {
      return this.timeframe?.details.getLabel()
    } else {
      return 'Unknown'
    }
  }

  isValid(): boolean {
    return this.type && this.id ? true : false
  }

  toObject(): any {
    return JSON.parse(JSON.stringify(this))
  }

  private getStartOfWeek(weekStartsOn: PrefsWeekStartTypes): Dayjs {
    let start = NDate.setFirstDayOfWeek(weekStartsOn).getFirstDayOfWeek()
    let startOfWeek = dayjs(start).startOf('day')
    return startOfWeek
  }

  private getEndOfWeek(weekStartsOn: PrefsWeekStartTypes): Dayjs {
    let end = NDate.setFirstDayOfWeek(weekStartsOn).getLastDayOfWeek()
    let endOfWeek = end.endOf('day')
    return endOfWeek
  }

  /**
   * jank alert
   * Since there isn't a good way to paramaterize the start of the week
   * since we have monday and sunday, I'm just going to
   * hard code the this-week and last-week conditions.
   */

  getStartDate(weekStartsOn: PrefsWeekStartTypes): Dayjs {
    if (this.timeRange && ['this-week', 'last-week'].indexOf(this.timeframe.details.id) > -1) {
      // This is hacky
      let startOfWeek = this.getStartOfWeek(weekStartsOn)
      switch (this.timeframe.details.id) {
        case 'this-week':
          return startOfWeek.startOf('day')

        case 'last-week':
          return startOfWeek.startOf('day').subtract(7, 'day')
      }
    } else if (this.timeRange && this.timeframe.start && this.timeframe.start.date) {
      // If a set Date
      return this.timeframe.start
    } else if (this.timeRange && this.timeframe.start) {
      return this.timeframe.start
    } else {
      return dayjs().startOf('day')
    }
    return dayjs()
  }

  getEndDate(weekStartsOn: PrefsWeekStartTypes): Dayjs {
    if (this.timeRange && ['this-week', 'last-week'].indexOf(this.timeframe.details.id) > -1) {
      // This is hacky
      let endOfWeek = this.getEndOfWeek(weekStartsOn)
      switch (this.timeframe.details.id) {
        case 'this-week':
          return endOfWeek.endOf('day')

        case 'last-week':
          return endOfWeek.subtract(1, 'week').endOf('day')
      }
    } else if (this.timeframe.end) {
      return this.timeframe.end
    } else {
      return dayjs().endOf('day')
    }
    return dayjs()
  }

  getDateRange(weekStartsOn: PrefsWeekStartTypes) {
    return [this.getStartDate(weekStartsOn), this.getEndDate(weekStartsOn)]
  }
}
