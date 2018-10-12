import React from 'react'
import moment from 'moment'

import WeekDays from './WeekDays'
import Week from './Week'
const isoDateOnly = 'YYYY-MM-DD'

export default function Month(props) {
  const month = moment(props.month)
  const weekStarting = moment(props.firstDay)

  const weeks = []
  const lastDay = month
    .clone()
    .add(1, 'month')
    .add(-1, 'day')

  for (;;) {
    let weekStartingDate = weekStarting.format(isoDateOnly)
    weeks.push(weekStartingDate)
    weekStarting.add(1, 'week')
    if (weekStarting > lastDay) break
  }

  return (
    <div className="month">
      <WeekDays start={weekStarting.clone()} key="lables" />
      {weeks.map(week => (
        <Week month={month} start={week} key={week} />
      ))}
    </div>
  )
}
