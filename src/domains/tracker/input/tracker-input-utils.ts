import type TrackerClass from '../../../modules/tracker/TrackerClass'

export type TrackerInputResponseType = {
  value?: number
  tracker: TrackerClass
  ready?: boolean
  suffix?: string
  action?: 'add' | 'save'
  note?: string
}
