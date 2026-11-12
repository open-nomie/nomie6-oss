import dayjs, { Dayjs } from 'dayjs'

import type { ITrackables } from '../trackable/trackable-utils'
import { LedgerStore } from '../ledger/LedgerStore'
import type NLog from '../nomie-log/nomie-log'
import type { TrackableUsageMap } from '../usage/trackable-usage.class'
import logsToTrackableUsage from '../usage/usage-utils'

export const getPointersOn = async (date: Date, knownTrackables: ITrackables,startdate?: Date,enddate?: Date): Promise<TrackableUsageMap> => {
  const dayjsDate = dayjs(date)
  const end = dayjs(enddate) || dayjsDate.add(30, 'day')
  const start = dayjs(startdate).subtract(90, 'day') || dayjsDate.subtract(30, 'day')
  
  const notes: Array<NLog> = (await LedgerStore.query({ start: start, end: end })).filter((log: NLog) => {
    return log.elements.filter((e) => e.type == 'pointer')
  })
  //@ts-ignore
  const allUsage = logsToTrackableUsage(notes, { trackables: knownTrackables })

  const pointerUsage: TrackableUsageMap = {}
  Object.keys(allUsage).forEach((trackableId: string) => {
    const tu = allUsage[trackableId]

    if (tu.trackable.type === 'pointer') {
      let allowed: boolean = false

      tu.dates.forEach((loopDate: Dayjs) => {
        // Add and subtract one to add a wider "view" buffer
        let pointerStart = dayjs(loopDate).subtract(2, 'day').toDate()
        if (date >= pointerStart) {
          allowed = true
        }
      })
      if (allowed) {
        pointerUsage[trackableId] = tu
      }
    }
  })

  return pointerUsage
}
