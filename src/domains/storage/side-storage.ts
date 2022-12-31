import appConfig from '../../config/appConfig'

/* SideStore is a class that allows you to store data in the browser's localStorage, and it's a lot
easier to use than localStorage directly. */
export class SideStore {
  dbPath: string
  data: any
  constructor(path) {
    this.dbPath = `${appConfig.data_root}/localDB/${path}`
    try {
      this.data = JSON.parse(localStorage.getItem(this.dbPath) || '{}')
    } catch (e) {
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
