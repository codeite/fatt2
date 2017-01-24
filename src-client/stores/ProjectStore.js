import faApi from '../services/fa-api'

class ProjectStore {
  constructor() {
    this._projects = {}
    this._activeProjectsCallbacks = []
  }

  loadActiveProjects () {
    faApi.getActiveProjects().then(projects => {
      console.log('projects:', projects)
      this.storeActiveProjects(projects)
    })
  }

  loadProject(projectUrl) {
    if (this._projects[projectUrl]) this.storeProject(this._projects[projectUrl])

    faApi.resolveProject(projectUrl).then(project => {
      console.log('resolveProject -> response:', project)
      this.storeProject(project)
    })
  }

  getProject(projectUrl) {
    const projectVector = this._projects[projectUrl]
    if(!projectVector) return null
    return projectVector.project
  }

  getOrCreateProjectVector(projectUrl) {
    let projectVector = this._projects[projectUrl]
    if (!projectVector) {
      projectVector = this._projects[projectUrl] = {
        projectUrl: projectUrl,
        callbacks: [],
        project: null
      }
    }
    return projectVector
  }

  registerCallback(projectUrl, callback) {
    if (projectUrl === 'activeProjects' || projectUrl === '/fatt/freeagent/projects?view=active') {
      this._activeProjectsCallbacks.push(callback)
      return
    }

    const projectVector = this.getOrCreateProjectVector(projectUrl)
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
    const projectVector = this.getOrCreateProjectVector(project.url)
    projectVector.project = project
    projectVector.callbacks.forEach(cb => cb(projectVector.project))
  }
}

module.exports = ProjectStore
export default ProjectStore