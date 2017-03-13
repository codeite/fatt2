import TimeslipStore from './stores/TimeslipStore'
import TaskStore from './stores/TaskStore'
import ProjectStore from './stores/ProjectStore'
import SelectedStore from './stores/SelectedStore'
import TaskDisplayNameStore from './stores/TaskDisplayNameStore'

const stores = {
  timeslipStore: new TimeslipStore(),
  taskStore: new TaskStore(),
  projectStore: new ProjectStore(),
  selectedStore: new SelectedStore()
}

stores.taskDisplayNameStore = new TaskDisplayNameStore(stores.taskStore)

module.exports = stores
export default stores