export default class Timer {
  name: string
  started: number
  display: boolean = true
  checks: Array<{ name: string; time: number }>
  constructor(name: string, display: boolean = true) {
    this.display = display
    this.name = name
    this.checks = []
  }

  start() {
    if (this.display) {
      this.started = new Date().getTime()
      console.log(`⏱ 🟢 ${this.name} - Started`)
    }
    this.checks.push({ name: `${this.name} Started`, time: 0 })
    return this
  }

  check(name) {
    const diff = new Date().getTime() - this.started
    if (this.display) {
      console.log(`⏱ ✅ ${this.name}: ${name} - ${diff}ms`)
    }
    this.checks.push({ name: `${name}`, time: diff })
    return this
  }

  done() {
    if (this.display) {
      console.log(`⏱ 🟥 ${this.name}: - ${new Date().getTime() - this.started}ms`)
    }
    this.check('done')
    console.table(this.checks)
  }
}
