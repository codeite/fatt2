import React from 'react'
import ObserveString from './ObserveString'

const Timeslip = ({taskNameOb, hours, isLocked, comment, onDelete, onSetCommnet}) => (<div className='timeslip' >
  {isLocked
    ? <div className='timeslip-delete glyphicon glyphicon-lock' />
    : <div className='timeslip-delete glyphicon glyphicon-remove-sign' onClick={onDelete} />
  }
  <div className='timeslip-task' >
    <ObserveString ob={taskNameOb} />

  </div>
  <div className='timeslip-hours' > <Comment text={comment} onSetCommnet={onSetCommnet} /> {parseInt(hours || 0, 10) }h</div>
</div>)

const Comment = ({text, onSetCommnet}) => {
  const setComment = e => {
    e.stopPropagation()
    onSetCommnet(window.prompt('new text', text))
  }

  return <div className='glyphicon' onClick={setComment}><CommentIcon text={text} /></div>
}

const CommentIcon = ({text}) => {
  const strText = ('' + text).toLowerCase()
  if (strText.startsWith('wfh')) {
    return <div className='timeslip-edit glyphicon glyphicon-home' title={text} />
  } else if (strText.startsWith('holiday')) {
    return <div className='timeslip-edit glyphicon glyphicon-plane' title={text} />
  } else if (strText.startsWith('sick')) {
    return <div className='timeslip-edit svgicon svgicon-sick' title={text} />
  } else if (text) {
    return <div className='timeslip-edit glyphicon glyphicon-comment' title={text} />
  }

  return null
}

export default Timeslip
