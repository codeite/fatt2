import React from 'react'
import stores from '../stores'
const moment = require('moment')

const isoDateOnly = "YYYY-MM-DD"
const isoMonthOnly = "YYYY-MM"

const Timeslip = React.createClass({
  getInitialState() {
    const task = stores.taskStore.getTask(this.props.timeslip.task)
    return {
      taskName: task ? task.name : ''
    }
  },

  componentWillMount() {
    stores.taskStore.registerCallback(this.props.timeslip.task, task => {
      console.log('task:', task)
      this.setState({taskName: task ? task.name : ''})
    })
    stores.taskStore.loadTask(this.props.timeslip.task)
  },

  render () {
    const timeslip = this.props.timeslip

    return <div className='timeslip' >
      <div className='timeslip-delete glyphicon glyphicon-remove-sign'></div>
      <div className='timeslip-task' >Task: {this.state.taskName}</div>
      <div className='timeslip-hours' >{parseInt(timeslip.hours || 0, 10) }h</div>
    </div>
  }
})

const Day = React.createClass({
  getInitialState() {
    const day = stores.timeslipStore.getDay(this.props.date)

    return Object.assign({
      loaded: !!day,
      selected: false
    }, day)
  },

  componentWillMount() {
    stores.timeslipStore.registerCallback(this.props.date, day => {

      this.setState(Object.assign({
        loaded: true,
        selected: false
      }, day))
    })
  },

  select () {
    this.setState({selected: !this.state.selected})
  },

  render () {
    const date = moment(this.props.date)
    const inMonth = date.isSame(this.props.month, 'month')
    const isWeekday = date.isoWeekday() < 6

    let timeslips = []
    let total = 0
    let timeslipsHtml = ''
    let className = 'day'

    if (this.state.loaded) {
      timeslips = this.state.timeslips
      total = this.state.total
      timeslipsHtml = timeslips.map(timeslip => <Timeslip key={timeslip.url} timeslip={timeslip} />)
    }

    if (date.isSame(moment(), 'day')) {
        className += ' today'
      } else if (date.isBefore(moment())) {
        if (total < 8) {
          className += ' short'
        } else {
          className += ' complete'
        }
      }


    if(!inMonth) className += ' text-muted'
    if(isWeekday) {
      className += ' '
    } else {
      className += ' weekend'
    }

    if (this.state.selected) {
      className += ' selected'
    }

    return <div className={className} onClick={this.select}>
      <div className='day-header'>{date.format('Do')}</div>
      <div className='day-total'>Total: <span className='day-total-hours'>{parseInt(total || 0, 10)}h</span></div>
      <div className='day-timeslips'>{timeslipsHtml}</div>
    </div>
  }
})

const DayOfWeekLabel = React.createClass({
  render () {
    const date = moment(this.props.date)
    let className = 'day day-of-week-label'
    const isWeekday = date.isoWeekday() < 6
    if(!isWeekday) className += ' weekend'

    return <div className={className}>{date.format('ddd')}</div>
  }
})

const Week = React.createClass({
  render () {
    const start = moment(this.props.start);
    const days = Array.from(Array(7).keys()).map(offset => start.clone().add(offset, 'days').format(isoDateOnly));

    return <div className="week">{days.map(d => <Day month={this.props.month} date={d} key={d} />)}</div>
  }
})
const WeekDays = React.createClass({
  render () {
    const start = moment(this.props.start);
    const days = Array.from(Array(7).keys()).map(offset => start.clone().add(offset, 'days'));

    return <div className="week">{days.map(d => <DayOfWeekLabel date={d} key={d.format('ddd')} />)}</div>
  }
})

const Month = React.createClass({

  render () {
    const month = moment(this.props.month)
    const weekStarting = moment(this.props.firstDay)

    const weeks = [<WeekDays start={weekStarting.clone()} key='lables' />]
    const lastDay = month.clone().add(1, 'month').add(-1, 'day')
    while(weekStarting < lastDay && weeks.length < 10) {
      let weekStartingDate = weekStarting.format(isoDateOnly)
      weeks.push(<Week month={month} start={weekStartingDate} key={weekStartingDate} />)
      weekStarting.add(1, 'week')
    }

    return <div className="month">{weeks}</div>
  }
})

const TaskManagerProject = React.createClass({
  getInitialState() {
    const project = stores.projectStore.getProject(this.props.projectUrl)
    return {
      project: project ? project : {name: 'unloaded'}
    }
  },

  componentWillMount() {
    stores.projectStore.registerCallback(this.props.projectUrl, project => {
      this.setState({project: project ? project : {}})
    })
    stores.projectStore.loadProject(this.props.projectUrl)
  },
  render() {
    return <span>{this.state.project.name}</span>
  }
})

const TaskManagerTask = React.createClass({
  render() {
    return <tbody>
      <tr>
        <td><TaskManagerProject projectUrl={this.props.task.project} /></td>
        <td>{this.props.task.name}</td>
      </tr>
    </tbody>
  }
})

const TaskManager = React.createClass({
  getInitialState() {
    return {
      activeTasks: []
    }
  },
  componentWillMount() {
    stores.taskStore.registerCallback('activeTasks', activeTasks => {
      this.setState({activeTasks})
    })
    stores.taskStore.loadActiveTasks()
  },
  render() {

    return <div>
      <h2>Task Manager</h2>
      <table>
        <thead><tr><th>Project Name</th><th>Task Name</th><th>Display As</th></tr></thead>
        {this.state.activeTasks.map(task => <TaskManagerTask key={task.url} task={task} />)}
      </table>
    </div>
  }
})

const Fatt = React.createClass({
  getInitialState() {
    const month = moment(moment().format(isoMonthOnly))
    const firstDay = month.clone()
    while(firstDay.isoWeekday() != 1) {
      firstDay.add(-1, 'days')
    }

    const lastDay = month.clone().add(1, 'month').add(-1, 'day')
    while(lastDay.isoWeekday() != 7) {
      lastDay.add(1, 'days')
    }

    const from = firstDay.format(isoDateOnly)
    const to = lastDay.format(isoDateOnly)
    stores.timeslipStore.loadRange(from, to)

    return {
      monthName: month.format('MMMM YYYY'),
      month,
      firstDay
    }
  },
  render () {

    return <div>
      <h1>{this.state.monthName}</h1>
      <Month month={this.state.month} firstDay={this.state.firstDay} />
      <TaskManager />
    </div>
  }
})

module.exports = Fatt
export default Fatt