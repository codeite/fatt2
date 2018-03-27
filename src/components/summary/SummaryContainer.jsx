import React from 'react'
import createReactClass from 'create-react-class'
import moment from 'moment'

import { readAndCalc, calClassName, commonMonthStats } from './summaryService'
import { YearStats } from './YearStats'

export const SummaryContainer = createReactClass({
  getInitialState () {
    return {
      timeslipsByDate: {},
      monthStats: commonMonthStats(this.props.year),
      yearStats: {}
    }
  },
  componentWillMount () {
    readAndCalc(this.props.year).then(state => this.setState(state))
  },
  componentWillReceiveProps (nextProps) {
    if (nextProps.year !== this.props.year) {
      readAndCalc(nextProps.year).then(state => this.setState(state))
    }
  },

  render () {
    const {year} = this.props
    const {timeslipsByDate, monthStats, yearStats} = this.state
    const months = [...Array(12)].map((_, i) => i)

    return <div>
      {yearStats && <YearStats {...{yearStats}} />}
      <hr />
      <MonthStatus {...{months, year, timeslipsByDate}}  />
      <hr />
      <MonthStats monthStats={this.state.monthStats} months={months} year={this.props.year} />
    </div>
  }
})

const cellStyle = {
  textAlign: 'center',
  width: 'initial'
}

const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const monthOfDays = [...Array(7 * 6)].map((_, i) => daysOfWeek[i % 7])

export const MonthStatus = ({months, year, timeslipsByDate={}}) => {
  const day = moment(year + '-01-01')

  function days (mIndex) {
    const res = []
    let start = 1
    while (start !== day.isoWeekday()) {
      res.push({id: mIndex + '_s_' + start, dayOfMonth: ' '})
      start++
    }

    while (day.month() === mIndex) {
      res.push({
        id: mIndex + '_' + day.date(),
        moment: day.clone(),
        dayOfMonth: day.date()
      })
      day.add(1, 'day')
    }
    return res
  }

  return <table>
    <thead>
      <tr>
        <th />
        {monthOfDays.map((x, i) => <th key={i} style={cellStyle}>{x}</th>)}
      </tr>
    </thead>
    <tbody>
      {months.map(mIndex => {
        return <tr key={mIndex}>
          <th>{day.format('MMM')}</th>
          {days(mIndex).map(dom =>
            <td key={dom.id} style={cellStyle} className={calClassName(dom, timeslipsByDate)}>{dom.dayOfMonth}</td>
          )}
        </tr>
      })}
    </tbody>
  </table>
}

const MonthStats = ({monthStats, year, months}) => {
  return <table>
    <thead>
      <tr>
        <th>Month</th>
      </tr>
    </thead>
    <tbody>
      {months.map(mIndex => {
        return <tr key={mIndex} >
          <th>{moment([year, mIndex]).format('MMM')}</th>
          {monthStats[mIndex] && <td>
            available: {monthStats[mIndex].available }
            {' '}
            worked: {monthStats[mIndex].worked }
            {' '}
            unworked: {monthStats[mIndex].unworked }
          </td>
          }
        </tr>
      })}
    </tbody>
  </table>
}
