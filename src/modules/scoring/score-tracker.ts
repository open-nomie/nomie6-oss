import type TrackerClass from '../tracker/TrackerClass'
import dayjs from 'dayjs'

export type IConditionIsUnit = 'lt' | 'lte' | 'gt' | 'gte' | 'eq'
export type IConditionIfUnit = 'hour' | 'month' | 'value'

export const ConditionIfs: Array<IConditionIfUnit> = ['hour', 'month', 'value']
export const ConditionIs: Array<IConditionIsUnit> = ['lt', 'lte', 'eq', 'gt', 'gte']

export interface ICondition {
  is: IConditionIsUnit
  v: number
  if: IConditionIfUnit
  sc: number
  key?: string
}

function isConditionTrue(condition: ICondition, baseValue: number): boolean {
  let response = false
  if (typeof condition.v == 'string') {
    condition.v = parseFloat(condition.v)
  }
  let value = condition.v
  if (condition.is == 'gt') {
    response = baseValue > value
  } else if (condition.is == 'lt') {
    response = baseValue < value
  } else if (condition.is == 'lte') {
    response = baseValue <= value
  } else if (condition.is == 'gte') {
    response = baseValue >= value
  } else if (condition.is == 'eq') {
    response = baseValue == value
  }
  return response
}

export interface IConditionResponse {
  true: boolean
  next: boolean
  score: number
}

function checkCondition(condition: ICondition, value: number, endTime: Date): IConditionResponse {
  let response: IConditionResponse = {
    true: false,
    next: true,
    score: 0,
  }
  switch (condition.if) {
    case 'hour':
      let hour = new Date(endTime).getHours()
      response.true = isConditionTrue(condition, hour)
      break
    case 'month':
      let dayOfMonth = parseInt(dayjs(endTime).format('DD'))
      response.true = isConditionTrue(condition, dayOfMonth)
      break
    case 'value':
      if (typeof value == 'string') {
        value = parseFloat(value)
      }
      response.true = isConditionTrue(condition, value)
      break
  }
  response.next = !response.true
  response.score = condition.sc
  return response
}

export default function ScoreTracker(value: number, tracker: TrackerClass, time?: Date) {
  let score = 0
  if (tracker.score && !tracker.score_calc) {
    score = parseInt(`${tracker.score}`)
  } else if (tracker.score_calc) {
    let conditionsMet = tracker.score_calc.map((condition) => {
      return checkCondition(condition, value, time)
    })
    let met = conditionsMet.filter((condition) => condition.true)
    score = met.length ? parseFloat(`${met[0].score}`) : score
  }
  return score
}
