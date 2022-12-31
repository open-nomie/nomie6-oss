import type { Dayjs } from 'dayjs'
import type { ITrackables } from '../trackable/trackable-utils'
import type NLog from '../nomie-log/nomie-log'
import type { TrackableUsageMap } from '../usage/trackable-usage.class'

import logsToTrackableUsage from '../usage/usage-utils'

export type TimelineItemType = {
  time: Dayjs
  usage: TrackableUsageMap
  logs: Array<NLog>
}

type TimelineLogChunkType = {
  [key: string]: Array<NLog>
}

export type TimelineFilterProps = {
  notes?: boolean;
  maps?: boolean;
  trackables?: boolean;
  context?: boolean;
  search?: string;
}

export const logsToTimeline = (logs: Array<NLog>, knownTrackables: ITrackables): Array<TimelineItemType> => {
  const map: TimelineLogChunkType = {}

  logs.forEach((log: NLog) => {
    // let dayPart = dateToDayPart(log.end)
    let keyTemplate = 'YYYY-MM-DD'
    let key = `${log.endDayjs().format(keyTemplate)}`
    map[key] = map[key] || []
    map[key].push(log)
  })
  return Object.keys(map).map((dateKey: string) => {
    const usage = logsToTrackableUsage(map[dateKey], { trackables: knownTrackables })
    return {
      time: map[dateKey][0].endDayjs(),
      usage,
      logs: map[dateKey],
    }
  })
}



