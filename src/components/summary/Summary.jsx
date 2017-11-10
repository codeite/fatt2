import React from 'react'
import moment from 'moment'

import faApi from '../../services/fa-api'

export const Summary = React.createClass({
  getInitialState () {
    return {timeslipsByDate: {}}
  },
  componentWillMount () {
    faApi.readTimeslips(this.props.year + '-01-01', this.props.year + '-12-31')
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
        console.log('rMap:', rMap)

        const timeslipsByDate = timeslips.reduce((p, c) => {
          if (!p[c.dated_on]) p[c.dated_on] = []
          p[c.dated_on].push(c)
          c.project = rMap[c.project]
          c.task = rMap[c.task]
          return p
        }, {})

        this.setState({timeslipsByDate})
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
        textAlign: 'center'
      }
    }

    return <table>
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
  }
})
