import faApi from '../services/fa-api'
import ObservableValue from './ObservableValue'

class ProjectStore {
  constructor() {
    this._projects = {}
    this._activeProjectsCallbacks = []
  }

  loadActiveProjects () {
    faApi.getActiveProjects().then(projects => {
      this.storeActiveProjects(projects)
    })
  }

  loadProject(projectUrl) {
    const projectVector = this.getOrCreateVector(projectUrl)
    if (projectVector.project) return this.storeProject(projectVector.project)

    faApi.resolveProject(projectUrl).then(project => {
      this.storeProject(project)
    })
  }

  getProject(projectUrl) {
    const projectVector = this._projects[projectUrl]
    if(!projectVector) return null
    return projectVector.project
  }

  getProjectOb (projectUrl) {
    return this.getOrCreateVector(projectUrl).observer;
  }

  getOrCreateVector(url) {
    let projectVector = this._projects[url]
    if (!projectVector) {
      projectVector = this._projects[url] = {
        projectUrl: url,
        callbacks: [],
        observer: new ObservableValue(url),
        project: null
      }
      this.loadProject(url)
    }
    return projectVector
  }

  registerCallback(projectUrl, callback) {
    if (projectUrl === 'activeProjects' || projectUrl === '/fatt/freeagent/projects?view=active') {
      this._activeProjectsCallbacks.push(callback)
      return
    }

    const projectVector = this.getOrCreateVector(projectUrl)
    projectVector.callbacks.push(callback)
  }

  unregisterCallback(projectUrl, callback) {
    if (projectUrl === 'activeProjects' || projectUrl === '/fatt/freeagent/projects?view=active') {
      this._activeProjectsCallbacks = _activeProjectsCallbacks.filter(c => c != callback)
      return
    }

    let projectVector = this._projects[projectUrl]
    if (!projectVector) return

    projectVector.callbacks = project.callbacks.filter(c => c != callback)
  }

  storeActiveProjects(projects) {
    projects.forEach(p => this.storeProject(p))
    this._activeProjectsCallbacks.forEach(cb => cb(projects))
  }

  storeProject(project) {
    const projectVector = this.getOrCreateVector(project.url)
    projectVector.observer.setValue(project)
    projectVector.project = project
    projectVector.callbacks.forEach(cb => cb(projectVector.project))
  }
}

module.exports = ProjectStore
export default ProjectStore