import dayjs, { Dayjs } from 'dayjs'

import type { ITrackables } from '../trackable/trackable-utils'
import { LedgerStore } from '../ledger/LedgerStore'
import type NLog from '../nomie-log/nomie-log'
import type { TrackableUsageMap } from '../usage/trackable-usage.class'
import logsToTrackableUsage from '../usage/usage-utils'

export const getContextOn = async (date: Date, knownTrackables: ITrackables): Promise<TrackableUsageMap> => {
  const dayjsDate = dayjs(date)
  const end = dayjsDate.add(30, 'day')
  const start = dayjsDate.subtract(30, 'day')
  const notes: Array<NLog> = (await LedgerStore.query({ start: start, end: end })).filter((log: NLog) => {
    return log.elements.filter((e) => e.type == 'context')
  })
  //@ts-ignore
  const allUsage = logsToTrackableUsage(notes, { trackables: knownTrackables })

  const contextUsage: TrackableUsageMap = {}
  Object.keys(allUsage).forEach((trackableId: string) => {
    const tu = allUsage[trackableId]

    if (tu.trackable.type === 'context') {
      let allowed: boolean = false

      tu.dates.forEach((loopDate: Dayjs) => {
        // Add and subtract one to add a wider "view" buffer
        let contextStart = dayjs(loopDate).subtract(2, 'day').toDate()
        if (date >= contextStart) {
          allowed = true
        }
      })
      if (allowed) {
        contextUsage[trackableId] = tu
      }
    }
  })

  return contextUsage
}
