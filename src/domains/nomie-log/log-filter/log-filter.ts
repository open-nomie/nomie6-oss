import searchItems from '../../../utils/search/search-items'
import latinize from '../../../utils/search/latinize'
import NLog from '../nomie-log'
import type { Dayjs } from 'dayjs'
import type { Token } from '../../../modules/tokenizer/lite'

type LogFilterProps = {
  search?: Token | string
  fuzzy?: boolean
  start?: Dayjs
  end?: Dayjs
  limit?: number
}

const logFilter = (searchLogs: Array<NLog>, filter: LogFilterProps) => {
  let logs: Array<NLog> = searchLogs || []

  filter = filter || { fuzzy: false }

  let term
  if (typeof filter.search === 'object') {
    term = latinize(`${filter.search.prefix}${filter.search.id}`)
  } else if (filter.search) {
    term = latinize(filter.search)
  }

  // If a search term is provided, filter it
  if (term) {
    logs = searchItems(term, searchLogs, { fields: ['note'], fuzzy: filter.fuzzy })
  }

  // Filter by date if provided
  if (filter.start || filter.end) {
    let start = filter.start.startOf('day')?.valueOf()
    let end = filter.end?.endOf('day').valueOf()

    logs = logs.filter((log: NLog) => {
      log = log instanceof NLog ? log : new NLog(log)
      let pass = false
      if (start && end) {
        pass = log.end.getTime() >= start && log.end.getTime() <= end
      } else if (filter.start) {
        pass = log.end.getTime() >= start
      } else if (filter.end) {
        pass = log.end.getTime() <= end
      }
      return pass
    })
  } // end if data provided

  // If limit
  if (filter.limit) {
    logs = logs.filter((row, i) => {
      return i <= filter.limit
    })
  }
  // end if limit

  return logs
}

export default logFilter
