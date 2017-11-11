import React from 'react'
import moment from 'moment'

import faApi from '../../services/fa-api'

export const Summary = React.createClass({
  getInitialState () {
    return {
      timeslipsByDate: {},
      monthStats: {},
      yearStats: {}
    }
  },
  componentWillMount () {
    this.readAndCalc(this.props.year)
  },
  componentWillReceiveProps (nextProps) {
    if (nextProps.year !== this.props.year) {
      this.readAndCalc(nextProps.year)
    }
  },
  readAndCalc (year) {
    faApi.readTimeslips(year + '-01-01', year + '-12-31')
      .then(data => {
        console.log('data:', data)
        const projectsAndTasks = new Set()

        data.timeslips.forEach(ts => {
          projectsAndTasks.add(ts.project)
          projectsAndTasks.add(ts.task)
        })

        return Promise.all([...projectsAndTasks].map(url => faApi.resolve(url)))
          .then(projectsAndTasksResolved => {
            console.log('projectsAndTasksResolved:', projectsAndTasksResolved)
            return {
              timeslips: data.timeslips,
              projectsAndTasksResolved
            }
          })
      })
      .then(({timeslips, projectsAndTasksResolved}) => {
        const rMap = projectsAndTasksResolved.reduce((p, c) => {
          p[c.url] = c
          return p
        }, {})

        const timeslipsByDate = timeslips.reduce((p, c) => {
          if (!p[c.dated_on]) p[c.dated_on] = []
          p[c.dated_on].push(c)
          c.project = rMap[c.project]
          c.task = rMap[c.task]
          return p
        }, {})

        const monthStats = timeslips.reduce((p, c) => {
          const date = moment(c.dated_on)
          if (!p[date.month()]) p[date.month()] = {worked: 0, unworked: 0}
          const hours = ~~c.hours

          if (c.task.is_billable) {
            p[date.month()].worked += hours
          } else {
            p[date.month()].unworked += hours
          }
          return p
        }, {})

        const yearStats = {
          workedDays: 0,
          holidayDays: 0,
          untrackedDays: 0
        }
        const date = moment(year + '-01-01')
        console.log('monthStats', monthStats)

        while ('' + date.year() === '' + this.props.year) {
          const day = timeslipsByDate[date.format('YYYY-MM-DD')]
          console.log('day:', day)
          if (day) {
            const dayData = day.reduce((p, c) => {
              if (c.task.is_billable) {
                p.w += ~~c.hours
              } else {
                p.u += ~~c.hours
              }
              return p
            }, {w: 0, u: 0})
            console.log('dayData:', dayData)
            if (dayData.w >= 8) {
              yearStats.workedDays++
            } else if (dayData.w >= 4 && dayData.u >= 4) {
              yearStats.workedDays += 0.5
              yearStats.holidayDays += 0.5
            } else if (dayData.u >= 8) {
              yearStats.holidayDays++
            } else {
              yearStats.untrackedDays++
            }
          } else {
            yearStats.untrackedDays++
          }

          date.add(1, 'days')
        }

        this.setState({timeslipsByDate, monthStats, yearStats})
      })
  },

  render () {
    const day = moment(this.props.year + '-01-01')
    const months = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

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

    const dow = () => {
      const res = []
      for (let c = 0; c < 6; c++) {
        ;['M', 'T', 'W', 'T', 'F', 'S', 'S'].forEach(d => {
          res.push(d)
        })
      }
      return res
    }

    const calClassName = (date) => {
      if (!date.moment) return null

      if (date.moment.isoWeekday() > 5) {
        return 'day weekend'
      } else if (date.moment > moment()) {
        return 'day'
      } else {
        let className = 'day weekday'

        const dateStr = date.moment.format('YYYY-MM-DD')
        const data = this.state.timeslipsByDate[dateStr]

        const res = (data || []).reduce((p, c) => {
          if (c.task.is_billable) {
            p.paid += ~~c.hours
          } else {
            p.unpaid += ~~c.hours
          }
          return p
        }, {paid: 0, unpaid: 0})
        const total = res.paid + res.unpaid

        if (total < 8) {
          className += ' short'
        } else if (res.paid >= 8) {
          className += ' complete'
        } else {
          const worked = Math.floor((res.paid / total) * 4) * 25
          className += ' unbillable' + worked
        }

        return className
      }
    }

    function getStyle () {
      return {
        textAlign: 'center',
        width: 'initial'
      }
    }

    const month = mIndex => {
      return moment(this.props.year + '-' + (mIndex + 1) + '-01')
    }

    return <div>
      {this.state.yearStats && <table>
        <tbody>
          <tr>
            <td>Days works:</td>
            <td>{this.state.yearStats.workedDays}</td>
          </tr>
          <tr>
            <td>Days off:</td>
            <td>{this.state.yearStats.holidayDays}</td>
          </tr>
          <tr>
            <td>Days untracked:</td>
            <td>{this.state.yearStats.untrackedDays}</td>
          </tr>
        </tbody>
      </table>}

      <table>
        <thead>
          <tr>
            <th />
            {(dow().map((x, i) => {
              return <th key={i} style={getStyle()}>{x}</th>
            }))}
          </tr>
        </thead>
        <tbody>
          {months.map(mIndex => {
            return <tr key={mIndex}>
              <th>{day.format('MMM')}</th>
              {days(mIndex).map(dom =>
                <td key={dom.id} style={getStyle()} className={calClassName(dom)}>{dom.dayOfMonth}</td>
              )}
            </tr>
          })}
        </tbody>
      </table>
      <hr />
      <table>
        <thead>
          <tr>
            <th>Month</th>
          </tr>
        </thead>
        <tbody>
          {months.map(mIndex => {
            return <tr key={mIndex} >
              <th>{month(mIndex).format('MMM')}</th>
              {this.state.monthStats[mIndex] && <td>
                worked: {this.state.monthStats[mIndex].worked / 8}
                {' '}
                unworked: {this.state.monthStats[mIndex].unworked / 8}
              </td>
              }
            </tr>
          })}
        </tbody>
      </table>
    </div>
  }
})
