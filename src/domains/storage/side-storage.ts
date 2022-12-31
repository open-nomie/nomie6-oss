import appConfig from '../../config/appConfig'

export class SideStore {
  dbPath: string
  data: any
  constructor(path) {
    this.dbPath = `${appConfig.data_root}/localDB/${path}`
    try {
      this.data = JSON.parse(localStorage.getItem(this.dbPath) || '{}')
    } catch(e) {
      console.error("SideStorage could not parse the JSON data");
    }
  }
  get(key) {
    return this.data.hasOwnProperty(key) ? this.data[key] : null
  }
  put(key, value) {
    this.data[key] = value
    localStorage.setItem(this.dbPath, JSON.stringify(this.data))
  }
}
