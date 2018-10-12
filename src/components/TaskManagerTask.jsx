import React from 'react'
import stores from '../stores'

import ObserveString from './ObserveString'

export default function TaskManagerTask(props) {
  const observableProject = (
    <ObserveString
      ob={stores.projectStore.getProjectOb(props.task.project)}
      t={x => x && x.name}
    />
  )
  const observableDisplayName = (
    <ObserveString
      ob={stores.taskDisplayNameStore.getTaskDisplayNameOb(props.task.url)}
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
        <td>{props.task.name}</td>
        {!this.state.editing ? (
          <td onClick={this.startEditing}>{observableDisplayName}</td>
        ) : (
          <td>
            <input
              value={props.newName}
              placeholder={props.task.name}
              onChange={props.onNewNameChanged}
              xonChange={e => this.setState({ newName: e.target.value })}
            />
            <input type="button" value="Save" onClick={props.onSave} />
            <input type="button" value="Cancel" onClick={props.onCancel} />
          </td>
        )}
      </tr>
    </tbody>
  )
}
