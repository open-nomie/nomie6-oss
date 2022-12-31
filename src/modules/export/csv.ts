import dayjs from 'dayjs'


import type { ITrackables } from '../../domains/ledger/ledger-tools'
import type NLog from '../../domains/nomie-log/nomie-log'

import type { Trackable } from '../../domains/trackable/Trackable.class'
import logsToTrackableUsage from '../../domains/usage/usage-utils'
import { calendarMap } from '../time/time'

import { tokenToTag } from '../tokenizer/tokenToTrackable'

import CSVColumnWorker from "./csv-column-worker?worker";

export const logsToCSV = async (
  logs: Array<NLog>,
  includeTrackables: Array<Trackable>,
  knownTrackables: ITrackables
): Promise<Array<any>> => {


  return new Promise((resolve) => {
    let csvWorker = new CSVColumnWorker()
    csvWorker.onmessage = (message) => {
      let data = message.data
      resolve(data);
    }

    csvWorker.postMessage({
      logs, includeTrackables, knownTrackables
    })
  })


}

export const logsToCSVOLD = async (
  logs: Array<NLog>,
  includeTrackables: Array<Trackable>,
  knownTrackables: ITrackables
) => {
  logs = logs.sort((a, b) => (a.end > b.end ? 1 : -1))

  const trackableArray = includeTrackables
  const columns: Array<any> = ['date']
  const doc: Array<any> = []

  if (logs.length) {
    const start = logs[0].endDayjs()
    const end = logs[logs.length - 1].endDayjs()
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

  return [...[columns], ...doc.reverse()]
}

export const logsToDetailedCSV = (logs: Array<NLog>, trackersToInclude: Array<any>) => {
  let header = ['epoch', 'start', 'end', 'offset', 'note', 'lat', 'lng', 'location', 'score']
  let rows: Array<any> = []
  // Get an array of tag names from the trackers
  let tokensToInclude: Array<string> = trackersToInclude.map((tracker) => tracker.tag)

  // Loop over logs
  logs.forEach((log) => {
    log.getMeta()
    // Extract log tracker tags

    const tzoffset = (log.offset || new Date().getTimezoneOffset()) * 60000 //offset in milliseconds
    const localStart = new Date(log.start.getTime() - tzoffset).toISOString().slice(0, -1)
    const localEnd = new Date(log.end.getTime() - tzoffset).toISOString().slice(0, -1)

    // Loop over tracker tags
    const logTokens = log.elements.filter(t => t.type !== 'generic').map(t => tokenToTag(t));
    const found = logTokens.filter((obj: string) => {
      return tokensToInclude.indexOf(obj) !== -1;
    });

    // Should Push Log to CSV?
    let pushLog: boolean = false;

    // If no trackables provided 
    if (!tokensToInclude.length) {
      pushLog = true;
    } else if (found.length) {
      // Otherwise, if we find a match
      pushLog = true;
    }

    if (pushLog) {
      rows.push([
        log.end.getTime(),
        localStart,
        localEnd,
        log.offset,
        (log.note || '').replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
        log.lat,
        log.lng,
        `${log.location || ''}`.replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
        log.score,
      ])
    }
  })
  return [...[header], ...rows.reverse()]
}

// export default class CSVGenerator {
//   constructor() {}

//   logsToCSV(logs, trackersToInclude) {
//     let header = ['epoch', 'start', 'end', 'offset', 'tracker', 'value', 'note', 'lat', 'lng', 'location', 'score']
//     let rows = [header]
//     // Get an array of tag names from the trackers
//     let tagsToInclude = trackersToInclude.map((tracker) => tracker.tag)
//     // Loop over logs
//     logs.forEach((log) => {
//       log.getMeta()
//       // Extract log tracker tags

//       const tzoffset = (log.offset || new Date().getTimezoneOffset()) * 60000 //offset in milliseconds
//       const localStart = new Date(log.start - tzoffset).toISOString().slice(0, -1)
//       const localEnd = new Date(log.end - tzoffset).toISOString().slice(0, -1)

//       // Loop over tracker tags
//       log.trackers.forEach((trackerElement) => {
//         let trackerTag = trackerElement.id
//         const shouldInclude = tagsToInclude.length > 0 ? tagsToInclude.indexOf(trackerTag) > -1 : true
//         // Is it a match?
//         if (shouldInclude) {
//           // Include it..
//           rows.push([
//             log.end,
//             localStart,
//             localEnd,
//             log.offset,
//             trackerTag,
//             trackerElement.value,
//             (log.note || '').replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
//             log.lat,
//             log.lng,
//             `${log.location || ''}`.replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
//             log.score,
//           ])
//         }
//       }) // end looping over logTrackers
//       // TODO: Make this output notes
//       if (!log.trackers.length) {
//         rows.push([
//           log.end,
//           localStart,
//           localEnd,
//           log.offset,
//           'note',
//           1,
//           log.note.replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
//           log.lat,
//           log.lng,
//           `${log.location || ''}`.replace(/(\"|\,|\n|\r)/g, ' '), // Remove csv breaking chars
//           log.score,
//         ])
//       }
//     })
//     return rows
//   }

//   /**
//    * Download a CSV file
//    *
//    * @param {String} filename
//    * @param {Array} rows
//    */
//   // download(filename, rows) {
//   //   let file = rows.join("\r\n");
//   //   this.filename = filename || "nomie4.csv";

//   //   if (navigator.msSaveBlob) {
//   //     // IE 10+
//   //     navigator.msSaveBlob(new Blob([file], { type: "text/csv;charset=utf-8;" }), filename);
//   //   } else {
//   //     let encodedUri = "data:text/csv;charset=UTF-8," + encodeURIComponent(file);
//   //     let link = document.createElement("a");
//   //     link.setAttribute("href", encodedUri);
//   //     link.setAttribute("download", filename);
//   //     document.body.appendChild(link); // Firefox
//   //     link.click();
//   //   }
//   // }

//   /**
//    * Generate the CSV
//    * generate({ start, end, [trackers] })
//    *
//    * @param {Object} options
//    */
//   async generate(options) {
//     options = options || {}
//     let start = options.start
//     let end = options.end
//     let trackers = options.trackers

//     // Loop over provided trackers - make them real trackers
//     trackers.map((tracker) => {
//       if (typeof tracker == 'string') {
//         return new Tracker({ tag: tracker })
//       } else {
//         return new Tracker(tracker)
//       }
//     })
//     // Get the logs for the provided time period

//     let logs = await LedgerStore.query({
//       start: dayjs(start).startOf('day'),
//       end: dayjs(end).endOf('day'),
//       // end TODO: See why end date is not working in query
//     })
//     // Expand and filter the logs
//     logs = logs.map((record) => {
//       record.getMeta() // get more data like trackers and values
//       return record
//     })

//     // generate CSV array
//     let csvArray = this.logsToCSV(logs, trackers)
//     let filename = `n-${dayjs(start).format('YYYY-MM-DD')}-${dayjs(end).format('YYYY-MM-DD')}.${nid(6)}.${
//       import.meta.env.PACKAGE_VERSION
//     }.csv`
//     download.csv(filename, csvArray.join('\r\n'))
//     // this.download(filename, csvArray.join("\r\n"));
//   }
// }
