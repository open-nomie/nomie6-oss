import type { GoalClass, GoalComparisonType } from './goal-class'

import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

type GoalComparisonItemType = {
  id: GoalComparisonType
  label: string
  symbol: string
}

export const getGoalComparisonLabel = (id: GoalComparisonType) => {
  return GoalComparisonItems.find((g) => g.id == id).label
}

export const getGoalComparisonSymbol = (id: GoalComparisonType) => {
  return GoalComparisonItems.find((g) => g.id == id).symbol
}

export const GoalComparisonItems: Array<GoalComparisonItemType> = [
  {
    id: 'lt',
    label: 'Less than',
    symbol: '<',
  },
  {
    id: 'lte',
    label: 'Less or Equal',
    symbol: '<=',
  },
  {
    id: 'eq',
    label: 'Equal',
    symbol: '=',
  },
  {
    id: 'gt',
    label: 'Greater than',
    symbol: '>',
  },
  {
    id: 'gte',
    label: 'Greater or Equal',
    symbol: '>=',
  },
]

export const getTimespanFromGoal = (goal: GoalClass, base?: Dayjs): { start: Dayjs; end: Dayjs } => {
  let start: Dayjs
  let end: Dayjs
  const date = base || dayjs()
  if (goal.duration === 'month') {
    start = date.startOf('month')
    end = date.endOf('month')
  } else if (goal.duration === 'week') {
    start = date.startOf('week')
    end = date.endOf('week')
  } else if (goal.duration === 'day') {
    start = date.startOf('day')
    end = date.endOf('day')
  }
  return { start, end }
}

export const getDurationFromGoals = (goals: Array<GoalClass>, base?: Dayjs): { start: Dayjs; end: Dayjs } => {
  const durations = goals.filter((g) => g).map((g) => g?.duration)

  const date = base || dayjs()
  let start: Dayjs
  let end: Dayjs
  if (durations.indexOf('month') > -1) {
    start = date.startOf('month')
    end = date.endOf('month')
  } else if (durations.indexOf('week') > -1) {
    start = date.startOf('week')
    end = date.endOf('week')
  } else if (durations.indexOf('day') > -1) {
    start = date.startOf('day')
    end = date.endOf('day')
  }
  return { start, end }
}
