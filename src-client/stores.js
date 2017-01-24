import TimeslipStore from './stores/TimeslipStore'
import TaskStore from './stores/TaskStore'
import ProjectStore from './stores/ProjectStore'

const stores = {
  timeslipStore: new TimeslipStore(),
  taskStore: new TaskStore(),
  projectStore: new ProjectStore()
}

module.exports = stores
export default stores