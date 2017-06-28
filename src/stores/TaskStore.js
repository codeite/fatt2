import faApi from '../services/fa-api'
import ObservableValue from './ObservableValue'

export default class TaskStore {
  constructor () {
    this._tasks = {}
    this._acitveTasks = []
    this._activeTasksCallbacks = []
  }

  loadActiveTasks (reload) {
    faApi.getActiveTasks(reload).then(tasks => {
      this.storeActiveTasks(tasks)
    })
  }

  getActiveTasks () {
    return this._acitveTasks
  }

  loadTask (taskUrl) {
    const taskVector = this.getOrCreateTaskVector(taskUrl)
    if (taskVector.task) {
      this.storeTask(taskVector.task)
      return Promise.resolve(taskVector.task)
    }

    return faApi.resolveTask(taskUrl).then(task => {
      // console.log('Got task:', task)
      this.storeTask(task)
      return task
    })
  }

  getTask (taskUrl) {
    const taskVector = this._tasks[taskUrl]
    if (!taskVector) return null
    return taskVector.task
  }

  getTaskOb (taskUrl) {
    return this.getOrCreateTaskVector(taskUrl).observer
  }

  getOrCreateTaskVector (taskUrl) {
    let taskVector = this._tasks[taskUrl]
    if (!taskVector) {
      taskVector = this._tasks[taskUrl] = {
        taskUrl: taskUrl,
        callbacks: [],
        observer: new ObservableValue(taskUrl),
        task: null
      }
      this.loadTask(taskUrl)
    }
    return taskVector
  }

  completeTask (taskUrl) {
    faApi.completeTask(taskUrl)
      .then(() => this.loadActiveTasks(true))
  }

  registerCallback (taskUrl, callback) {
    if (taskUrl === 'activeTasks' || taskUrl === '/fatt/freeagent/tasks?view=active') {
      this._activeTasksCallbacks.push(callback)
      return
    }

    const taskVector = this.getOrCreateTaskVector(taskUrl)
    taskVector.callbacks.push(callback)
  }

  unregisterCallback (taskUrl, callback) {
    if (taskUrl === 'activeTasks' || taskUrl === '/fatt/freeagent/tasks?view=active') {
      this._activeTasksCallbacks = this._activeTasksCallbacks.filter(c => c !== callback)
      return
    }

    let taskVector = this._tasks[taskUrl]
    if (!taskVector) return

    taskVector.callbacks = taskVector.callbacks.filter(c => c !== callback)
  }

  storeActiveTasks (tasks) {
    this._acitveTasks = tasks.map(x => x)

    tasks.forEach(p => this.storeTask(p))
    this._activeTasksCallbacks.forEach(cb => cb(tasks))
  }

  storeTask (task) {
    const taskVector = this.getOrCreateTaskVector(task.url)
    taskVector.observer.setValue(task)
    taskVector.task = task
    taskVector.callbacks.forEach(cb => cb(taskVector.task))
  }
}
