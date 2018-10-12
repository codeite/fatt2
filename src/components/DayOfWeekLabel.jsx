import React from 'react'
import moment from 'moment'

export default function DayOfWeekLabel(props) {
  const date = moment(props.date)
  return (
    <div
      className={
        'day day-of-week-label ' +
        (date.isoWeekday() < 6 ? 'weekday' : 'weekend')
      }
    >
      {date.format('ddd')}
    </div>
  )
}
