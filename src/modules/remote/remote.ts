class Remote {
  url: any;
  syncEnabled: boolean;
  username: any;
  password: any;
  dbPrefix: any;
  database: any;
  _dirty: boolean;
  constructor(starter) {
    starter = starter || {};
    this.url = starter.url ? new URL(starter.url) : null;
    if (starter.host) {
      this.url = new URL(starter.host);
    }
    if (starter.valid) {
      this.syncEnabled = true;
    }
    this.username = starter.username || null;
    this.password = starter.password || null;
    this.dbPrefix = starter.dbPrefix || "";
    this.database = starter.database || "nomie";
    this.syncEnabled = starter.syncEnabled || false;
  }
  setURL(url) {
    try {
      this.url = new URL(url);
      this._dirty = false;
    } catch (e) {
      console.error("Set URL error", e.message);
    }
    return this;
  }
  isValid() {
    return this.url;
  }
  getURL() {
    this.url;
  }
  auth() {
    return btoa(`${this.username}:${this.password}`);
  }
}

export default Remote;
