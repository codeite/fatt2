import React from 'react'
import stores from '../stores'
import moment from 'moment'
import { Link } from 'react-router-dom'

import Month from './Month'
import TaskManagerTaskContainer from './TaskManagerTaskContainer'
import Finance from './Finance'

const isoMonthOnly = 'YYYY-MM'
const isoDateOnly = 'YYYY-MM-DD'

const TaskManager = React.createClass({
  getInitialState() {
    return {
      activeTasks: [],
      visible: false
    }
  },
  componentWillMount() {
    stores.taskStore.registerCallback('activeTasks', activeTasks => {
      this.setState({ activeTasks })
    })
    this.setState({ activeTasks: stores.taskStore.getActiveTasks() })
  },
  refresh() {
    stores.taskStore.loadActiveTasks(true)
    stores.projectStore.loadActiveProjects(true)
  },
  render() {
    return (
      <div className="taskManager">
        <h2 onClick={() => this.setState({ visible: !this.state.visible })}>
          Task Manager
        </h2>
        <table className={this.state.visible ? 'show' : 'hide'}>
          <thead>
            <tr>
              <th />
              <th>Project Name</th>
              <th>Task Name</th>
              <th>Display As</th>
              <th />
            </tr>
            <tr>
              <th colSpan="4">
                <a onClick={this.refresh}>Refresh</a>
              </th>
            </tr>
          </thead>
          {this.state.activeTasks.map(task => (
            <TaskManagerTaskContainer key={task.url} task={task} />
          ))}
        </table>
      </div>
    )
  }
})

const TaskOption = React.createClass({
  getInitialState() {
    return {
      projectName: '',
      displayName: ''
    }
  },

  projectListener(project) {
    this.setState({ projectName: project.name })
  },
  displayNameListener(displayName) {
    this.setState({ displayName })
  },

  componentWillMount() {
    this.u1 = stores.projectStore
      .getProjectOb(this.props.task.project)
      .addListener(this.projectListener)
    this.u2 = stores.taskDisplayNameStore
      .getTaskDisplayNameOb(this.props.task.url)
      .addListener(this.displayNameListener)

    const project = stores.projectStore
      .getProjectOb(this.props.task.project)
      .getValue()
    this.setState({
      projectName: project && project.name,
      displayName: stores.taskDisplayNameStore
        .getTaskDisplayNameOb(this.props.task.url)
        .getValue()
    })
  },

  componentWillUnmount() {
    if (typeof this.u1 === 'function') this.u1()
    if (typeof this.u2 === 'function') this.u2()
  },

  render() {
    return <option value={this.props.task.url}>{this.state.displayName}</option>
  }
})

const AddTaskBar = React.createClass({
  getInitialState() {
    return {
      activeTasks: [],
      selectedDates: [],
      selectedTaskUrl: '',
      selectedHours: '8.0',
      comment: ''
    }
  },
  componentWillMount() {
    stores.taskStore.registerCallback('activeTasks', activeTasks => {
      const newState = { activeTasks }
      if (activeTasks.length && this.state.selectedTaskUrl === '')
        newState.selectedTaskUrl = activeTasks[0].url
      this.setState(newState)
    })
    stores.selectedStore.registerSelectedDatesCallback(selectedDates => {
      this.setState({ selectedDates })
    })

    const activeTasks = stores.taskStore.getActiveTasks()
    const selectedDates = stores.selectedStore.getSelectedDates()
    const newState = { activeTasks, selectedDates }
    if (activeTasks.length && this.state.selectedTaskUrl === '')
      newState.selectedTaskUrl = activeTasks[0].url
    this.setState({ activeTasks, selectedDates })
  },
  selectTask(e) {
    this.setState({ selectedTaskUrl: e.target.value })
  },
  selectHours(e) {
    this.setState({ selectedHours: e.target.value })
  },
  addTimeSlips() {
    stores.timeslipStore
      .createTimeslips(
        this.state.selectedTaskUrl,
        this.state.selectedHours,
        this.state.selectedDates,
        this.state.comment
      )
      .then(() => {
        stores.selectedStore.clear()
        this.setState({ comment: '' })
      })
  },
  delete() {
    stores.timeslipStore
      .deleteTimeslips(this.state.selectedDates)
      .then(() => stores.selectedStore.clear())
  },
  clear() {
    stores.selectedStore.clear()
  },
  render() {
    const buttonsDisabled = this.state.selectedDates.length === 0
    return (
      <div className="addTaskBar">
        <div className="taskDetail">
          <div>
            <span>Task: </span>
            <select
              value={this.state.selectedTaskUrl}
              onChange={this.selectTask}
            >
              {this.state.activeTasks.map(task => (
                <TaskOption key={task.url} task={task} />
              ))}
            </select>
          </div>
          <div>
            <span>Hours: </span>
            <select
              value={this.state.selectedHours}
              onChange={this.selectHours}
            >
              <option>8.0</option>
              <option>6.0</option>
              <option>4.0</option>
              <option>2.0</option>
            </select>
          </div>
          <div>
            <span>Comment: </span>
            <input
              type="text"
              value={this.state.comment}
              onChange={e => this.setState({ comment: e.target.value })}
            />
          </div>
          <div className="buttons">
            <input
              type="button"
              value="Add"
              onClick={this.addTimeSlips}
              disabled={buttonsDisabled}
            />
            <input
              type="button"
              value="Delete"
              onClick={this.delete}
              disabled={buttonsDisabled}
            />
            <input
              type="button"
              value="Clear"
              onClick={this.clear}
              disabled={buttonsDisabled}
            />
          </div>
        </div>
        <div className="dates">
          {this.state.selectedDates.map((date, i) => (
            <div className="datePil" key={i}>
              {date.format('YYYY-MM-DD')}
            </div>
          ))}
        </div>
      </div>
    )
  }
})

const Fatt = React.createClass({
  getInitialState() {
    if (this.props.month) {
      const selectedMonth = moment(this.props.month)
      if (!selectedMonth.isValid) {
        throw new Error('Invalid month: ' + this.props.month)
      }
      return this.calcState(selectedMonth)
    } else {
      return this.calcState(moment())
    }
  },

  componentWillReceiveProps(nextProps) {
    if (nextProps.month) {
      const selectedMonth = moment(nextProps.month)
      if (!selectedMonth.isValid) {
        throw new Error('Invalid month: ' + nextProps.month)
      }
      const newState = this.calcState(selectedMonth)
      this.setState(newState, () => this.loadThisMonth())
    }
  },

  calcState(month) {
    month = moment(moment(month).format(isoMonthOnly))
    const firstDay = month.clone()
    while (firstDay.isoWeekday() !== 1) {
      firstDay.add(-1, 'days')
    }

    const lastDay = month
      .clone()
      .add(1, 'month')
      .add(-1, 'day')
    while (lastDay.isoWeekday() !== 7) {
      lastDay.add(1, 'days')
    }

    return {
      monthName: month.format('MMMM YYYY'),
      month,
      firstDay,
      lastDay
    }
  },

  componentWillMount() {
    stores.taskStore.loadActiveTasks()
    stores.projectStore.loadActiveProjects()
    this.loadThisMonth()
  },

  loadThisMonth() {
    const from = this.state.firstDay.format(isoDateOnly)
    const to = this.state.lastDay.format(isoDateOnly)
    stores.timeslipStore.loadRange(from, to)
  },

  render() {
    const lastMonth =
      '/month/' +
      this.state.month
        .clone()
        .add(-1, 'month')
        .format('YYYY-MM')
    const thisMonth = '/month/' + moment().format('YYYY-MM')
    const nextMonth =
      '/month/' +
      this.state.month
        .clone()
        .add(1, 'month')
        .format('YYYY-MM')

    return (
      <div>
        <div className="headerBar">
          <div className="monthNav">
            <Link to={lastMonth}>Prev</Link>
            <div>
              <div style={{ textAlign: 'center' }}>
                <Link to={thisMonth}>This Month</Link>
              </div>
              <h1>{this.state.monthName}</h1>
            </div>
            <Link to={nextMonth}>Next</Link>
          </div>
          <TaskManager />
          <AddTaskBar />
        </div>
        <Month
          month={this.state.month}
          firstDay={this.state.firstDay}
          lastDay={this.state.lastDay}
        />
        <a href={'#/timesheet/' + this.state.month.format('YYYY-MM')}>
          Timesheet
        </a>
        <Finance month={this.state.month.format('YYYY-MM')} />
      </div>
    )
  }
})

module.exports = Fatt
export default Fatt
