import React from 'react'
import ObserveString from './ObserveString'
import stores from '../stores'

const Timeslip = React.createClass({
  render () {
    return <div className='timeslip' >
      {this.props.isLocked ?
        <div className='timeslip-delete glyphicon glyphicon-lock' /> :
        <div className='timeslip-delete glyphicon glyphicon-remove-sign' onClick={this.props.onDelete} />
      }
      <div className='timeslip-task' ><ObserveString ob={this.props.taskNameOb} /></div>
      <div className='timeslip-hours' >{parseInt(this.props.hours || 0, 10) }h</div>
    </div>
  }
})

export default Timeslip
