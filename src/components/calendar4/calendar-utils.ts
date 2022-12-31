import type NLog from '../../domains/nomie-log/nomie-log'

export type CalendarDayUnit = {
  date: Date
  value?: number
  max?: number
  positivity?: number
  percentage?: number
  logs?: Array<NLog>
}
