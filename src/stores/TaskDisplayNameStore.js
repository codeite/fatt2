import ObservableValue from './ObservableValue'
import ls from '../services/ls'

export default class TaskDisplayNameStore {
  constructor (taskStore) {
    this.taskStore = taskStore
    this._observables = []
  }

  getTaskDisplayName (taskUrl) {
    let observable = this._observables[taskUrl]

    if (observable) return observable.getValue()
    return ''
  }

  getTaskDisplayNameOb (taskUrl) {
    let observable = this._observables[taskUrl]
    if (observable) return observable

    const displayNames = ls.getItem('displayNames') || {}

    const taskOb = this.taskStore.getTaskOb(taskUrl)
    taskOb.addListener(newTask => this.setTask(newTask))
    const task = taskOb.getValue()
    const taskName = task && task.name

    observable = this._observables[taskUrl] = new ObservableValue('tdns'+taskUrl, displayNames[taskUrl] || taskName)
    observable.taskOb = taskOb
    return observable
  }

  setTask (task) {
    const displayNames = ls.getItem('displayNames') || {}
    if (!displayNames[task.url]) {
      const observable = this.getTaskDisplayNameOb(task.url)
      observable.setValue(task.name)
    }
  }

  setDisplayName (taskUrl, newDisplayName) {
    const displayNames = ls.getItem('displayNames') || {}
    const observable = this.getTaskDisplayNameOb(taskUrl)

    if (newDisplayName && newDisplayName.length > 0) {
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
