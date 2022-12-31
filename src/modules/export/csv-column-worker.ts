// import calculateCorrelation from 'calculate-correlation'


import NLog from "../../domains/nomie-log/nomie-log"
import type { ITrackables } from "../../domains/trackable/trackable-utils"
import { Trackable } from "../../domains/trackable/Trackable.class"
import logsToTrackableUsage from "../../domains/usage/usage-utils"
import { calendarMap } from "../time/time"
import dayjs from "dayjs"

type PayloadType = {
  data: {
    logs: Array<NLog>
    includeTrackables: Array<Trackable>,
    knownTrackables: ITrackables
  }
}

onmessage = (e: PayloadType) => {
  const payload = e.data

  const logs = payload.logs.sort((a, b) => (a.end > b.end ? 1 : -1)).map(l => new NLog(l))
  const knownTrackables = payload.knownTrackables;
  Object.keys(knownTrackables).map(tag => {
    knownTrackables[tag] = new Trackable(knownTrackables[tag]);
  })
  const trackableArray = payload.includeTrackables.map((t) => {
    return new Trackable(t);
  })

  console.log("Worker CSV Columsn", {
    logs, knownTrackables, trackableArray
  })

  const columns: Array<any> = ['date']
  const doc: Array<any> = []

  if (logs.length) {
    const start = dayjs(logs[0].end);
    const end = dayjs(logs[logs.length - 1].end);
    const calMap = calendarMap(start.toDate(), end.toDate(), 'day')
    const usage = logsToTrackableUsage(logs, { trackables: knownTrackables })

    trackableArray.forEach((trackable) => {
      columns.push(trackable.tag)
    })

    calMap.forEach((cal) => {
      const d = dayjs(cal.date)
      const row: Array<any> = [d.format('YYYY-MM-DD')]
      doc.push(row)
    })

    trackableArray.forEach((trackable, index) => {
      const tu = usage[trackable.tag]
      if (tu) {
        let tuDay = tu.backfill(calMap[0].date, calMap[calMap.length - 1].date).byDay
        let columnIndex = columns.indexOf(tuDay.trackable.tag)

        tuDay.dates.forEach((d, dIndex) => {
          const rowIndex = doc.findIndex((r) => r[0] === d.format('YYYY-MM-DD'))
          if (rowIndex > -1 && columnIndex > -1) {
            const value = tuDay.values[dIndex];
            doc[rowIndex][columnIndex] = isNaN(value) ? 0 : value
          }
        })
      }
    })
  }
  postMessage([...[columns], ...doc.reverse()])
}
