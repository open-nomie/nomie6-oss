
import Papa from 'papaparse'
import dayjs from 'dayjs'
import  NLog from '../../nomie-log/nomie-log'
import nid from '../../../modules/nid/nid'
import NPaths from '../../../paths'
import { createArrayStore } from '../../../store/ArrayStore'

export const CsvTemplateStore = createArrayStore(NPaths.storage.csvTemplates(), {
  key: 'id',
  label: 'CSVTemplate',
  itemInitializer: (item) => {
    return item;
  },
  itemSerializer: (item: IImportConfig) => {
    return item
  },
})



export interface IFieldMapItem {
  index: number
  name?: string
}
export interface IImportConfig {
  name?: string
  id?: string
  hasHeaders?: boolean
  template?: string
  fieldMap?: {
    lat?: number
    lng?: number
    location?: number
    end?: number
    start?: number
    source?: number
  }
}

export interface IImportFields {
  [key: string]: string
}

class CSVRImport {
  parsed: {
    data: Array<Array<string>>
    errors: Array<any>
    meta: {
      delimiter: string
      linebreak: string
      aborted: boolean
      truncated: boolean
      cursor: number
    }
  }
  name: string
  nlogs: Array<NLog>
  config: IImportConfig
  errors: Array<any>

  constructor(config: IImportConfig) {
    this.config = config || {
      name: this.config.name || this.name || 'Untitled',
      fieldMap: {},
    }
    this.config.fieldMap = this.config.fieldMap || {}
    this.config.name = this.config.name || this.name || 'Untitled'
    this.config.id = this.config.id || nid(8)
  }
  public csv(content: string): CSVRImport {
    try {
      this.parsed = Papa.parse(content.trim())
    } catch (e) {
      console.error('Papa parse: Line 59 csvr-import', e.message)
    }
    return this
  }
  public setName(filename: string): void {
    this.name = filename
  }
  public length() {
    if (this.config.hasHeaders) {
      return (this.parsed?.data?.length || 1) - 1
    } else {
      return this.parsed?.data?.length || 0
    }
  }
  private toFields(row: Array<string> = []): IImportFields {
    let fields = {}
    row.forEach((cell: string, index: number) => {
      fields[`f${index}`] = cell
    })
    return fields
  }
  private fieldsToNote(fields: IImportFields): string {
    let base = `${this.config.template}`
    Object.keys(fields).forEach((fieldKey) => {
      base = base.replace('{' + fieldKey + '}', fields[fieldKey])
    })
    return base
  }
  public getHeaders(): Array<string> {
    return this.parsed.data[0]
  }

  public toLog(row: Array<any>, index?: number): NLog {
    let log: NLog
    try {
      let fields: IImportFields = this.toFields(row)
      let note = this.fieldsToNote(fields)
      log = new NLog({
        note,
        end: dayjs(row[this.config.fieldMap.end]).toDate().getTime(),
      })
      if (this.config.fieldMap.start !== undefined) {
        log.start = dayjs(row[this.config.fieldMap.start]).toDate()
      }
      if (this.config.fieldMap.lat !== undefined && this.config.fieldMap.lat !== undefined) {
        log.lat = parseFloat(row[this.config.fieldMap.lat])
        log.lng = parseFloat(row[this.config.fieldMap.lng])
      }
      if (this.config.fieldMap.location !== undefined) {
        log.location = row[this.config.fieldMap.location]
      }
      if (this.config.fieldMap.source !== undefined) {
        if (typeof this.config.fieldMap.source == 'number') {
          log.source = row[this.config.fieldMap.source]
        } else if (typeof this.config.fieldMap.source == 'string') {
          log.source = this.config.fieldMap.source
        }
      } else {
        log.source = 'importer'
      }
    } catch (e) {
      console.error('toLog Error', e.message)
      log = new NLog({ note: `Invalid row data` })
    }
    return log
  }

  public toLogs(): Array<NLog> {
    let logs: Array<NLog> = []
    let rows = this.parsed.data || []
    rows.forEach((row: Array<string>, index: number) => {
      try {
        let log = this.toLog(row, index)
        logs.push(log)
      } catch (e) {
        console.error(e)
        this.errors.push(`Row #${index} errored: ${e.message}`)
      }
    })
    if (this.config.hasHeaders) {
      logs.shift()
    }
    return logs
  }
}

export default CSVRImport
