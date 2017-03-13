import React from 'react'
import moment from 'moment'

import DayOfWeekLabel from './DayOfWeekLabel'

export default function WeekDays (props) {
  const start = moment(props.start)
  const days = Array.from(Array(7).keys()).map(offset => start.clone().add(offset, 'days'))

  return <div className='week'>{days.map(d => <DayOfWeekLabel date={d} key={d.format('ddd')} />)}</div>
}
