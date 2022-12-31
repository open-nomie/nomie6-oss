export class ConcurrentTaskQueue {
  batchSize: number
  todoTasks: Array<Function>
  resolvedValues: Array<any>
  constructor(taskPromisesFunc = [], batchSize = 1) {
    this.batchSize = batchSize > taskPromisesFunc.length ? taskPromisesFunc.length : batchSize
    this.todoTasks = taskPromisesFunc
    this.resolvedValues = []
  }

  run(resolve, reject) {
    if (this.todoTasks.length > 0) {
      const taskPromises = this.todoTasks.splice(0, this.batchSize)
      Promise.all(taskPromises.map((p) => p()))
        .then((resolvedValues) => {
          this.resolvedValues = [...this.resolvedValues, ...resolvedValues]
          this.run(resolve, reject)
        })
        .catch((err) => reject(err))
    } else {
      resolve(this.resolvedValues)
    }
  }

  runTasks() {
    return new Promise((resolve, reject) => {
      this.run(resolve, reject)
    })
  }
}
