import React, {Component} from 'react'
import moment from 'moment'

import faApi from '../services/fa-api'

export class Timesheet extends Component {
  constructor (props) {
    super(props)
    const month = moment(props.match.params.month)
    this.state = {
      byDate: null,
      month: month.isValid ? month : moment()
    }
  }

  componentWillMount () {
    this.loadThisMonth()
      .then(({timeslips, projects, tasks}) => {
        console.log('timeslips:', timeslips)
        console.log('projects:', projects)
        console.log('tasks:', tasks)

        const taskMap = tasks.reduce((p, c) => {
          p[c.url] = c
          return p
        }, {})

        const byDate = timeslips
          .map(t => {
            t.taskObject = taskMap[t.task]
            return t
          })
          .reduce((p, c) => {
            if (!p[c.dated_on]) p[c.dated_on] = []
            p[c.dated_on].push(c)
            return p
          }, {})
        console.log('byDate:', byDate)

        this.setState({byDate})
      })
  }

  loadThisMonth () {
    const from = moment(this.state.month).startOf('month').format('YYYY-MM-DD')
    const to = moment(this.state.month).endOf('month').format('YYYY-MM-DD')
    return faApi.readTimeslips(from, to)
      .then(timeslips => timeslips.timeslips)
      .then(timeslips => {
        const projectLinks = new Set()
        const taskLinks = new Set()
        timeslips.forEach(t => {
          projectLinks.add(t.project)
          taskLinks.add(t.task)
        })

        const projectPromises = [...projectLinks].map(url => faApi.resolveProject(url))
        const taskPromises = [...taskLinks].map(url => faApi.resolveTask(url))

        return Promise.all(projectPromises)
          .then(projects => {
            return Promise.all(taskPromises)
              .then(tasks => {
                return {timeslips, projects, tasks}
              })
          })
      })
  }

  render () {
    const days = []
    const start = moment(this.state.month).startOf('month')
    const end = moment(this.state.month).endOf('month')
    const byDate = this.state.byDate
    while (start.isBefore(end)) {
      let date = moment(start)
      let day = {
        date,
        timeslips: []
      }

      if (byDate) {
        day.timeslips = byDate[date.format('YYYY-MM-DD')] || []
      }

      days.push(day)
      start.add(1, 'day')
    }

    return <div className='Timesheet' >
      Timesheet {this.state.month.format()}
      {this.props.match.params.month}
      <table>
        <tbody>
          {days.map((day, i) => <tr key={i}>
            <td>{day.date.format('dddd')}</td>
            <td>{day.date.format('DD MMM YYYY')}</td>
            <td><Worked hours={day.timeslips.reduce((acc, t) => acc + (t.hours * (t.taskObject.is_billable ? 1 : 0)), 0)} /></td>
          </tr>)}
        </tbody>
      </table>
    </div>
  }
}

function Worked ({hours}) {
  return <span>{toDaysDecimal(hours)}</span>
}

const toDaysDecimal = hours => {
  switch (hours) {
    case 0: return '0.00'
    case 2: return '0.25'
    case 4: return '0.50'
    case 6: return '0.75'
    case 8: return '1.00'
    default:
      return (hours / 8).toFixed(2)
  }
}

const toDays = hours => {
  switch (hours) {
    case 0: return 'Not worked'
    case 2: return '1/4 day'
    case 4: return '1/2 day'
    case 6: return '3/4 day'
    case 8: return '1 day'
    default:
      return `${hours} hours`
  }
}
