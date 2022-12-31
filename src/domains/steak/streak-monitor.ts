import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'

type StreakMonitorType = {
  date: string
  streak: number
  today?: Dayjs
}

export class StreakMonitor {
  today: Dayjs = dayjs()
  date: Dayjs
  streak: number = 0
  constructor(starter: StreakMonitorType) {
    if (starter.today) this.today = starter.today

    this.date = dayjs(new Date(starter.date))
    let diff = this.date.diff(this.today, 'day')
    if (diff == 1) {
      this.streak = this.streak + 1
      this.date = dayjs()
    } else if (diff > 1) {
      this.streak = 0
    }
  }
  get asObject() {
    return {
      date: this.date.toJSON(),
      streak: this.streak,
    }
  }
}
