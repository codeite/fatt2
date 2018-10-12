import React from 'react'
import stores from '../stores'

import ObserveString from './ObserveString'

const isoMonthOnly = 'YYYY-MM'
const isoDateOnly = 'YYYY-MM-DD'

const TaskManagerTask = React.createClass({
  getInitialState() {
    return {
      newName: '',
      editing: false
    }
  },
  startEditing() {
    console.log(
      'stores.taskDisplayNameStore.getTaskDisplayName(this.props.task.url)',
      stores.taskDisplayNameStore.getTaskDisplayName(this.props.task.url)
    )
    this.setState({
      editing: true,
      newName: stores.taskDisplayNameStore.getTaskDisplayName(
        this.props.task.url
      )
    })
  },
  save() {
    stores.taskDisplayNameStore.setDisplayName(
      this.props.task.url,
      this.state.newName
    )
    this.setState({ newName: '', editing: false })
  },
  cancel() {
    this.setState({ newName: '', editing: false })
  },
  onDelete(task) {
    stores.taskStore.completeTask(this.props.task.url)
  },
  render() {
    const observableProject = (
      <ObserveString
        ob={stores.projectStore.getProjectOb(this.props.task.project)}
        t={x => x && x.name}
      />
    )
    const observableDisplayName = (
      <ObserveString
        ob={stores.taskDisplayNameStore.getTaskDisplayNameOb(
          this.props.task.url
        )}
      />
    )

    return (
      <tbody>
        <tr>
          <td>
            <div
              className="timeslip-delete glyphicon glyphicon-remove-sign"
              onClick={this.onDelete}
            />
          </td>
          <td>{observableProject}</td>
          <td>{this.props.task.name}</td>
          {!this.state.editing ? (
            <td onClick={this.startEditing}>{observableDisplayName}</td>
          ) : (
            <td>
              <input
                value={this.state.newName}
                placeholder={this.props.task.name}
                onChange={e => this.setState({ newName: e.target.value })}
              />
              <input type="button" value="Save" onClick={this.save} />
              <input type="button" value="Cancel" onClick={this.cancel} />
            </td>
          )}
        </tr>
      </tbody>
    )
  }
})

module.exports = TaskManagerTask
export default TaskManagerTask
