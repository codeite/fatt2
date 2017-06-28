import TimeslipStore from './stores/TimeslipStore'
import TaskStore from './stores/TaskStore'
import ProjectStore from './stores/ProjectStore'
import SelectedStore from './stores/SelectedStore'
import TaskDisplayNameStore from './stores/TaskDisplayNameStore'

const taskStore = new TaskStore()
const timeslipStore = new TimeslipStore(taskStore)
const projectStore = new ProjectStore()
const selectedStore = new SelectedStore()
const taskDisplayNameStore = new TaskDisplayNameStore(taskStore)

const stores = {
  timeslipStore,
  taskStore,
  projectStore,
  selectedStore,
  taskDisplayNameStore
}

module.exports = stores
export default stores
