import ObservableValue from './ObservableValue'
import ls from '../services/ls'

class TaskDisplayNameStore {
  constructor (taskStore) {
    this.taskStore = taskStore
    this.observables = []
  }

  getTaskDisplayName (taskUrl) {
    let observable = this.observables[taskUrl]
    if (observable) return observable.getValue()
    return ''
  }

  getTaskDisplayNameOb (taskUrl) {
    let observable = this.observables[taskUrl]
    if (observable) return observable

    const displayNames = ls.getItem('displayNames') || {}

    const taskOb = this.taskStore.getTaskOb(taskUrl)
    taskOb.addListener(newTask => this.setTaskName(newTask))
    const task = taskOb.getValue()
    const taskName = task && task.name

    observable = this.observables[taskUrl] = new ObservableValue(displayNames[taskUrl] || taskName)
    observable.taskOb = taskOb
    return observable
  }

  setTaskName(task) {
    const displayNames = ls.getItem('displayNames') || {}

    if(!newDisplayName || newDisplayName.length === 0) {
      const observable = this.getTaskDisplayNameOb(task.url)
      observable.setValue(task.name)
    }
  }

  setDisplayName(taskUrl, newDisplayName) {
    const displayNames = ls.getItem('displayNames') || {}
    const observable = this.getTaskDisplayNameOb(taskUrl)

    if(newDisplayName && newDisplayName.length > 0) {
      displayNames[taskUrl] = newDisplayName
      observable.setValue(newDisplayName)
    } else {
      const task = observable.taskOb.getValue()
      newDisplayName = task && task.name
      observable.setValue(newDisplayName)
      delete displayNames[taskUrl]
    }
    ls.setItem('displayNames', displayNames)
  }
}

module.exports = TaskDisplayNameStore
export default TaskDisplayNameStore