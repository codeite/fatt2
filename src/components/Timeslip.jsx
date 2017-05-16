import React from 'react'
import ObserveString from './ObserveString'

const Timeslip = ({taskNameOb, hours, isLocked, comment, onDelete}) => (<div className='timeslip' >
  {isLocked
    ? <div className='timeslip-delete glyphicon glyphicon-lock' />
    : <div className='timeslip-delete glyphicon glyphicon-remove-sign' onClick={onDelete} />
  }
  <div className='timeslip-task' >
    <ObserveString ob={taskNameOb} />

  </div>
  <div className='timeslip-hours' > <Comment text={comment} /> {parseInt(hours || 0, 10) }h</div>
</div>)

const Comment = ({text}) => {
  if (text) {
    return <div className='timeslip-delete glyphicon glyphicon-comment' title={text} />
  }

  return null
}

export default Timeslip
