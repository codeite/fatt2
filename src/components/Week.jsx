import React from 'react'
import moment from 'moment'

import DayContainer from './DayContainer'

const isoDateOnly = 'YYYY-MM-DD'

export default function Week(props) {
  const start = moment(props.start)
  const days = Array.from(Array(7).keys()).map(offset =>
    start
      .clone()
      .add(offset, 'days')
      .format(isoDateOnly)
  )

  return (
    <div className="week">
      {days.map(d => (
        <DayContainer month={props.month} date={d} key={d} />
      ))}
    </div>
  )
}
