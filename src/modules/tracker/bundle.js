import TrackerClass from './tracker'

export default class Bundle {
  constructor(starter = {}) {
    this.title = starter.title
    this.summary = starter.summary
    this.author = starter.author
    if (starter.trackers) {
      this.trackers = starter.trackers.map((tracker) => {
        return new TrackerClass(tracker)
      })
    }
  }
}
