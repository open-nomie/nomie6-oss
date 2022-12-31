import dayjs from 'dayjs'
import TrackerClass from '../../modules/tracker/TrackerClass'
import NLog from '../nomie-log/nomie-log'
import type { ITrackables } from '../trackable/trackable-utils'
import { Trackable } from '../trackable/Trackable.class'
import { logsToTimeline } from './timeline-utils'
import { test, describe, expect } from 'vitest'
describe('Timeline  Helper', () => {
  const trackables: ITrackables = {
    '#walked': new Trackable({
      type: 'tracker',
      tracker: new TrackerClass({ tag: 'walked' }),
    }),
    '#mood': new Trackable({
      type: 'tracker',
      tracker: new TrackerClass({ tag: 'mood', math: 'mean' }),
    }),
  }

  const logs = [
    { note: '#walked(4) #mood(4) and ran home', date: dayjs().hour(2).minute(12).subtract(11, 'day').toDate() },
    { note: '#walked(4) #sex(4) and ran home', date: dayjs().hour(1).minute(30).subtract(11, 'day').toDate() },
    { note: '#walked(4) #fried(4) testing timeline', date: dayjs().hour(1).minute(12).subtract(11, 'day').toDate() },
  ].map((d) => new NLog({ note: d.note, end: d.date }))

  test('should chunk', () => {
    let timeline = logsToTimeline(logs, trackables)
    expect(timeline).toBeTruthy()
  })
})
