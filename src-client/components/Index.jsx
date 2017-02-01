import React from 'react'
import stores from '../stores'
const moment = require('moment')

import ObserveString from './ObserveString'
import Timeslip from './Timeslip'
import {Day, DayContainer} from './Day'

const isoDateOnly = "YYYY-MM-DD"
const isoMonthOnly = "YYYY-MM"



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

    return <div className="week">{days.map(d => <DayContainer month={this.props.month} date={d} key={d} />)}</div>
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
  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  },
  componentWillReceiveProps (newProps) {
    const from = newProps.firstDay.format(isoDateOnly)
    const to = newProps.lastDay.format(isoDateOnly)
    stores.timeslipStore.loadRange(from, to)
  },
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

// const TaskManagerProject = React.createClass({
//   getInitialState() {
//     const project = stores.projectStore.getProject(this.props.projectUrl)
//     return {
//       project: project ? project : {name: 'unloaded'}
//     }
//   },

//   componentWillMount() {
//     stores.projectStore.registerCallback(this.props.projectUrl, project => {
//       this.setState({project: project ? project : {}})
//     })
//     stores.projectStore.loadProject(this.props.projectUrl)
//   },
//   render() {
//     return <span>{this.state.project.name}</span>
//   }
// })

const TaskManagerTask = React.createClass({
  getInitialState() {
    return {
      newName: '',
      editing: false
    }
  },
  startEditing() {
    console.log('stores.taskDisplayNameStore.getTaskDisplayName(this.props.task.url)', stores.taskDisplayNameStore.getTaskDisplayName(this.props.task.url) )
    this.setState({
      editing: true,
      newName: stores.taskDisplayNameStore.getTaskDisplayName(this.props.task.url)
    })
  },
  save() {
    stores.taskDisplayNameStore.setDisplayName(this.props.task.url, this.state.newName)
    this.setState({newName: '', editing: false})
  },
  cancel() {
    this.setState({newName: '', editing: false})
  },
  onDelete (task) {
    stores.taskStore.completeTask(this.props.task.url)
  },
  render() {
    const observableProject = <ObserveString ob={stores.projectStore.getProjectOb(this.props.task.project)} t={x=>x && x.name}/>
    const observableDisplayName = <ObserveString ob={stores.taskDisplayNameStore.getTaskDisplayNameOb(this.props.task.url) } />


    return <tbody>
      <tr>
        <td><div className='timeslip-delete glyphicon glyphicon-remove-sign' onClick={this.onDelete} /></td>
        <td>{observableProject}</td>
        <td>{this.props.task.name}</td>
        {!this.state.editing ?
        <td onClick={this.startEditing}>{observableDisplayName}</td>
        :
        <td>

          <input value={this.state.newName} placeholder={this.props.task.name} onChange={e => this.setState({newName: e.target.value})} />
          <input type='button' value='Save' onClick={this.save} />
          <input type='button' value='Cancel' onClick={this.cancel} />
        </td>
        }
      </tr>
    </tbody>
  }
})

const TaskManager = React.createClass({
  getInitialState() {
    return {
      activeTasks: [],
      visible: false
    }
  },
  componentWillMount() {
    stores.taskStore.registerCallback('activeTasks', activeTasks => {
      this.setState({activeTasks})
    })
    this.setState({activeTasks: stores.taskStore.getActiveTasks()})
  },
  refresh() {
    stores.taskStore.loadActiveTasks(true)
    stores.projectStore.loadActiveProjects(true)
  },
  render() {

    return <div className='taskManager'>
      <h2 onClick={() => this.setState({visible: !this.state.visible})}>Task Manager</h2>
      <table className={this.state.visible ? 'show' : 'hide'}>
        <thead>
          <tr><th/><th>Project Name</th><th>Task Name</th><th>Display As</th><th></th></tr>
          <tr><th colSpan="4"><a onClick={this.refresh}>Refresh</a></th></tr>
        </thead>
        {this.state.activeTasks.map(task => <TaskManagerTask key={task.url} task={task} />)}
      </table>
    </div>
  }
})

const TaskOption = React.createClass({
  getInitialState() {
    return {
      projectName: '',
      displayName: ''
    }
  },

  projectListener(project) {this.setState({projectName: project.name})},
  displayNameListener(displayName) {this.setState({displayName})},

  componentWillMount () {
    stores.projectStore.getProjectOb(this.props.task.project).addListener(this.projectListener)
    stores.taskDisplayNameStore.getTaskDisplayNameOb(this.props.task.url).addListener(this.displayNameListener)

    const project = stores.projectStore.getProjectOb(this.props.task.project).getValue()
    this.setState({
      projectName: project && project.name,
      displayName: stores.taskDisplayNameStore.getTaskDisplayNameOb(this.props.task.url).getValue()
    })
  },

  render() {
    return <option value={this.props.task.url}>{this.props.task.name} - {this.state.projectName} - "{this.state.displayName}"</option>
  }
})

const AddTaskBar = React.createClass({
  getInitialState() {return{activeTasks: [], selectedDates: [], selectedTaskUrl: '', selectedHours: '8.0', comment: ''}},
  componentWillMount() {
    stores.taskStore.registerCallback('activeTasks', activeTasks => {
      const newState = {activeTasks}
      if (activeTasks.length && this.state.selectedTaskUrl === '') newState.selectedTaskUrl = activeTasks[0].url
      this.setState(newState)
    })
    stores.selectedStore.registerSelectedDatesCallback(selectedDates => {
      this.setState({selectedDates})
    })

    const activeTasks = stores.taskStore.getActiveTasks()
    const selectedDates = stores.selectedStore.getSelectedDates()
    const newState = {activeTasks, selectedDates}
    if (activeTasks.length && this.state.selectedTaskUrl === '') newState.selectedTaskUrl = activeTasks[0].url
    this.setState({activeTasks, selectedDates})
  },
  selectTask(e) {
    this.setState({selectedTaskUrl: e.target.value})
  },
  selectHours(e) {
    this.setState({selectedHours: e.target.value})
  },
  addTimeSlips() {
    stores.timeslipStore.createTimeslips(this.state.selectedTaskUrl, this.state.selectedHours, this.state.selectedDates, this.state.comment)
      .then(() => {
        stores.selectedStore.clear()
        this.setState({comment: ''})
      })
  },
  delete() {
    stores.timeslipStore.deleteTimeslips(this.state.selectedDates)
      .then(() => stores.selectedStore.clear())
  },
  clear() {
    stores.selectedStore.clear()
  },
  render() {
    return <div className='addTaskBar'>
      <div className='taskDetail'>
        <div>
          <span>Task: </span>
          <select value={this.state.selectedTaskUrl} onChange={this.selectTask}>{this.state.activeTasks.map(task => <TaskOption key={task.url} task={task} />)}</select>
        </div>
        <div>
          <span>Hours: </span>
          <select value={this.state.selectedHours} onChange={this.selectHours}><option>8.0</option><option>4.0</option></select>
        </div>
        <div>
          <span>Comment: </span>
          <input type='text' value={this.state.comment} onChange={e => this.setState({comment: e.target.value})} />
        </div>
        <div className='buttons'>
          <input type='button' value='Add' onClick={this.addTimeSlips} />
          <input type='button' value='Delete' onClick={this.delete} />
          <input type='button' value='Clear' onClick={this.clear} />
        </div>
      </div>
      <div className='dates'>
        {this.state.selectedDates.map((date, i) => <div className='datePil' key={i}>{date.format('YYYY-MM-DD')}</div>)}
      </div>
    </div>
  }
})

const Fatt = React.createClass({
  getInitialState() {
    return this.calcState(moment())
  },
  calcState(month) {
    month = moment(moment(month).format(isoMonthOnly))
    const firstDay = month.clone()
    while(firstDay.isoWeekday() != 1) {
      firstDay.add(-1, 'days')
    }

    const lastDay = month.clone().add(1, 'month').add(-1, 'day')
    while(lastDay.isoWeekday() != 7) {
      lastDay.add(1, 'days')
    }

    return {
      monthName: month.format('MMMM YYYY'),
      month,
      firstDay,
      lastDay
    }
  },
  move(months) {
    this.setState(this.calcState(this.state.month.clone().add(months, 'month')))
  },
  componentWillMount() {
    stores.taskStore.loadActiveTasks()
    stores.projectStore.loadActiveProjects()
  },
  render () {
    return <div>
      <div className='headerBar'>
        <a onClick={() => this.move(-1)}>Prev</a>
        <h1>{this.state.monthName}</h1>
        <a onClick={() => this.move(1)}>Next</a>
        <TaskManager />
        <AddTaskBar />
      </div>
      <Month month={this.state.month} firstDay={this.state.firstDay} lastDay={this.state.lastDay}/>
    </div>
  }
})

module.exports = Fatt
export default Fatt