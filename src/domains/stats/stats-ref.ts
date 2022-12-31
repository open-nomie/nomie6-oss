//Modules utils
import { strToColor } from '../../components/dymoji/dymoji'
import Tracker from '../../modules/tracker/TrackerClass'
import type { ITrackerMath } from '../../modules/tracker/TrackerClass'
import StatsV5 from './statsV5'
import type { ITimeSpanKey } from './statsV5'
import type { IStats } from './statsV5'
import extractor from '../../utils/extract/extract'

// Stores
import { LedgerStore } from '../../domains/ledger/LedgerStore'
import nid from '../../modules/nid/nid'
import type { Dayjs } from 'dayjs'

class StatsReference {
  type: string
  key: string
  base: any
  label: string
  stats: IStats
  math: ITrackerMath
  is24Hour: boolean
  id: string
  distance?: any

  constructor(starter?: any) {
    starter = starter || {}
    this.type = starter.type
    this.key = starter.key
    this.base = starter.base
    this.label = starter.label
    this.stats = null
    this.math = starter.math
    this.is24Hour = starter.is24Hour == true ? true : false
    this.id = starter.id || nid()
  }

  getSearchTerm() {
    return extractor.generateRaw(this.key, this.type)
  }

  getTracker() {
    if (this.type == 'tracker') {
      return this.base
    } else {
      // We have to force everything to kinda a tracker
      return new Tracker({
        math: 'sum',
        tag: this.key,
        color: strToColor(this.label),
      })
    }
  }

  async getStats(timeSpan: ITimeSpanKey, fromDate: Dayjs, toDate: Dayjs, fresh: boolean = false) {
    // Prepare the Stat Processor
    const statsV5 = new StatsV5({ is24Hour: this.is24Hour })
    try {
      // Get SEarch Term
      let searchTerm = this.getSearchTerm()
      // Create Search Payload
      let payload = {
        search: searchTerm,
        start: fromDate,
        end: toDate,
        fresh: fresh,
      }
      // Get Resutls from Ledger
      let results = await LedgerStore.query(payload)
      // Process the Stats
      this.stats = statsV5.generate({
        rows: results,
        fromDate: fromDate,
        toDate: toDate,
        mode: timeSpan,
        math: this.base.math || 'sum', // added to fix compares not showing right math
        tracker: this.getTracker(),
        trackableElement: extractor.toElement(searchTerm),
      })
      return this.stats
    } catch (e) {
      throw e
    }
  }
} // End Compare Model - TODO : move\

export default StatsReference
