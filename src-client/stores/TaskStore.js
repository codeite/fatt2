import faApi from '../services/fa-api'

class TaskStore {
  constructor() {
    this._tasks = {}
    this._activeTasksCallbacks = []
  }

  loadActiveTasks () {
    faApi.getActiveTasks().then(tasks => {
      console.log('tasks:', tasks)
      this.storeActiveTasks(tasks)
    })
  }

  loadTask(taskUrl) {
    if (this._tasks[taskUrl]) this.storeTask(this._tasks[taskUrl])

    faApi.resolveTask(taskUrl).then(task => {
      console.log('resolveTask -> response:', task)
      this.storeTask(task)
    })
  }

  getTask(taskUrl) {
    const taskVector = this._tasks[taskUrl]
    if(!taskVector) return null
    return taskVector.task
  }

  getOrCreateTaskVector(taskUrl) {
    let taskVector = this._tasks[taskUrl]
    if (!taskVector) {
      taskVector = this._tasks[taskUrl] = {
        taskUrl: taskUrl,
        callbacks: [],
        task: null
      }
    }
    return taskVector
  }

  registerCallback(taskUrl, callback) {
    if (taskUrl === 'activeTasks' || taskUrl === '/fatt/freeagent/tasks?view=active') {
      this._activeTasksCallbacks.push(callback)
      return
    }

    const taskVector = this.getOrCreateTaskVector(taskUrl)
    taskVector.callbacks.push(callback)
  }

  unregisterCallback(taskUrl, callback) {
    if (taskUrl === 'activeTasks' || taskUrl === '/fatt/freeagent/tasks?view=active') {
      this._activeTasksCallbacks = _activeTasksCallbacks.filter(c => c != callback)
      return
    }

    let taskVector = this._tasks[taskUrl]
    if (!taskVector) return

    taskVector.callbacks = task.callbacks.filter(c => c != callback)
  }

  storeActiveTasks(tasks) {
    tasks.forEach(p => this.storeTask(p))
    this._activeTasksCallbacks.forEach(cb => cb(tasks))
  }

  storeTask(task) {
    const taskVector = this.getOrCreateTaskVector(task.url)
    taskVector.task = task
    taskVector.callbacks.forEach(cb => cb(taskVector.task))
  }
}

module.exports = TaskStore
export default TaskStore