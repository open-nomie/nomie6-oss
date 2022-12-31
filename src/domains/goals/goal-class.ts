// import type NLog from '../nomie-log/nomie-log'
import type { Dayjs } from 'dayjs'
import { Trackable } from '../trackable/Trackable.class'
import type { TrackableUsage } from '../usage/trackable-usage.class'
import math from '../../utils/math/math'
import nid from '../../modules/nid/nid'
import { parseNumber } from '../../utils/parseNumber/parseNumber'

export type GoalDurationType = 'day' | 'week' | 'month'

export type GoalComparisonType = 'lt' | 'lte' | 'eq' | 'gt' | 'gte'

export type GoalType = {
  id?: string
  tag?: string
  trackable?: Trackable
  duration?: GoalDurationType
  target?: number // the goal target
  comparison?: GoalComparisonType
}

export type GoalScoreType = {
  success: boolean
  failure: boolean
  target: number
  actual: number
  og: number
  date?: Dayjs
  percent: number
}

export class GoalClass {
  id?: string
  trackable?: Trackable
  tag?: string
  duration?: GoalDurationType
  target?: number // the goal target
  comparison?: GoalComparisonType

  constructor(starter: GoalType = {}) {
    this.id = starter.id || nid()

    this.trackable = starter.trackable ? new Trackable(starter.trackable) : undefined
    this.tag = starter.tag || this.trackable?.tag || undefined

    this.duration = 'day' // todo:// make this work for week
    this.target = parseNumber(starter.target)
    this.comparison = starter.comparison
  }

  get asObject() {
    return {
      id: this.id,
      duration: this.duration,
      target: this.target,
      comparison: this.comparison,
      tag: this.tag,
    }
  }

  get durationLabel(): string {
    return this.durationToLabel(this.duration)
  }

  public durationToLabel(duration: GoalDurationType) {
    switch (duration) {
      case 'day':
        return 'Daily'
      case 'week':
        return 'Weekly'
      case 'month':
        return 'Monthly'
    }
  }

  get isDontDoIt(): boolean {
    return this.comparison === 'lt' || this.comparison === 'lte'
  }

  private compare(value: number): boolean {
    if (this.comparison === 'eq' && value == this.target) {
      return true
    } else if (this.comparison === 'lt' && value < this.target) {
      return true
    } else if (this.comparison === 'lte' && value <= this.target) {
      return true
    } else if (this.comparison === 'gt' && value > this.target) {
      return true
    } else if (this.comparison === 'gte' && value >= this.target) {
      return true
    }
    return false
  }

  public calculateScores(trackableUsage: TrackableUsage | undefined): Array<GoalScoreType> {
    let scores: Array<GoalScoreType> = []
    let usage: TrackableUsage

    if (this.duration === 'month' && trackableUsage) {
      usage = trackableUsage.groupBy('month', 'YYYY-MM').backfill()
    }
    if (this.duration === 'week' && trackableUsage) {
      usage = trackableUsage.groupBy('week', 'YYYY-MM-w').backfill()
    }
    if (this.duration === 'day' && trackableUsage) {
      usage = trackableUsage.byDay.backfill()
    }

    // if we don't have any usage
    // if ((!usage && this.comparison === 'lt') || this.comparison === 'lte') {
    //
    // } else
    if (usage) {
      scores = usage.values.map((value, index) => {
        // If Not a Number
        let ogValue = value
        if (isNaN(value)) value = 0

        // Does it meet the criteria?
        const meetsCriteria = this.compare(value)

        const payload: GoalScoreType = {
          success: meetsCriteria,
          failure: !meetsCriteria,
          target: this.target,
          actual: value,
          og: ogValue,
          date: usage.dates[index],
          percent: math.percentage(this.target, value),
        }

        // What type of goal is this - a DOIT or DONTDOIT goal?
        if (this.comparison == 'lt' || (this.comparison == 'lte' && !meetsCriteria)) {
          // It's a DontDoit Goal
          payload.failure = true
        }

        return payload
      })
    }

    return scores
  }
}
