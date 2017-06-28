import React from 'react'
import stores from '../stores'
const moment = require('moment')

import Timeslip from './Timeslip'

export default function Day (props) {
  const date = moment(props.date)
  const inMonth = date.isSame(props.month, 'month')
  const isWeekday = date.isoWeekday() < 6

  let timeslips = []
  let total = 0
  let timeslipsHtml = ''
  let className = 'day'
  let billableHours = 0

  if (props.loaded) {
    timeslips = props.timeslips
    total = props.total
    billableHours = props.billableHours
    timeslipsHtml = timeslips.map(timeslip => {
      const taskNameOb = stores.taskDisplayNameStore.getTaskDisplayNameOb(timeslip.task)
      return <Timeslip
        key={timeslip.url}
        hours={timeslip.hours}
        isLocked={!!timeslip.billed_on_invoice}
        comment={timeslip.comment}
        taskNameOb={taskNameOb}
        onSetCommnet={text => props.onSetCommnet(timeslip, text)}
        onDelete={e => { e.stopPropagation(); props.onDeleteTimeslip(timeslip) }} />
    })
  }

  if (date.isSame(moment(), 'day')) {
    className += ' today'
  }

  if (date.isSameOrBefore(moment())) {
    if (total < 8) {
      className += ' short'
    } else if (billableHours < 8) {
      const percent = Math.round(Math.round(100 * billableHours / 2) / 4)
      className += ' unbillable' + percent
    } else {
      className += ' complete'
    }
  }

  if (!inMonth) className += ' text-muted'

  className += isWeekday ? ' weekday' : ' weekend'

  return <div className={className} onClick={props.onSelectDay} >
    <div className='day-header'>
      <span>{date.format('Do')}</span>
      <span>
        <input type='checkbox' checked={props.selected} />
      </span>
    </div>
    <div className='day-total'>Total: <span className='day-total-hours'>{parseInt(total || 0, 10)}h</span></div>
    <div className='day-timeslips'>{timeslipsHtml}</div>
  </div>
}

