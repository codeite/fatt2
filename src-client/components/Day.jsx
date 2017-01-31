import React from 'react'
import stores from '../stores'
const moment = require('moment')

import ObserveString from './ObserveString'
import Timeslip from './Timeslip'

const isoDateOnly = "YYYY-MM-DD"
const isoMonthOnly = "YYYY-MM"

export class DayContainer extends React.Component {
  constructor (props) {
    super(props)
    const day = stores.timeslipStore.getDay(props.date)

    this.state = {loaded: false}
  }

  componentWillMount() {
    const selectedOb = stores.selectedStore.getDayOb(this.props.date)
    selectedOb.addListener(selected => {
      this.setState({selected: selected})
    })
    this.setState({selected: selectedOb.getValue()})

    // const dayOb = stores.timeslipStore.getDayOb(this.props.date)
    // dayOb.addListener(selected => {
    //   this.setState({selected: selected})
    // })
    // this.setState({selected: dayOb.getValue()})

    stores.timeslipStore.registerCallback(this.props.date, day => {
      this.setState(Object.assign({
        loaded: true
      }, day))
    })

    const day = stores.timeslipStore.getDay(this.props.date)
    if (day) {
      this.setState(Object.assign({
        loaded: true
      }, day))
    }
  }

  onSelectDay (e) {
    console.log('Selected', this)
    //this.setState({selected: !this.state.selected})
    if (e.shiftKey) {
      stores.selectedStore.setToDay(this.props.date, !this.state.selected)
    } else {
      const selectedOb = stores.selectedStore.getDayOb(this.props.date)
      selectedOb.setValue(!this.state.selected)
      document.getSelection().removeAllRanges();
    }
  }

  onDeleteTimeslip(timeslip) {
    stores.timeslipStore.deleteTimeslip(timeslip)
  }

  render() {
    return <Day
      loaded={this.state.loaded}
      selected={this.state.selected}
      timeslips={this.state.timeslips}
      total={this.state.total}
      date={this.props.date}
      month={this.props.month}
      onSelectDay={this.onSelectDay.bind(this)}
      onDeleteTimeslip={this.onDeleteTimeslip.bind(this)} />
  }
}

const Day = props => {
  const date = moment(props.date)
  const inMonth = date.isSame(props.month, 'month')
  const isWeekday = date.isoWeekday() < 6

  let timeslips = []
  let total = 0
  let timeslipsHtml = ''
  let className = 'day'

  if (props.loaded) {
    timeslips = props.timeslips
    total = props.total
    timeslipsHtml = timeslips.map(timeslip => {
      const taskNameOb = stores.taskDisplayNameStore.getTaskDisplayNameOb(timeslip.task)
      return <Timeslip
        key={timeslip.url}
        hours={timeslip.hours}
        isLocked={!!timeslip.billed_on_invoice}
        taskNameOb={taskNameOb}
        onDelete={e => {e.stopPropagation(); props.onDeleteTimeslip(timeslip)}} />
    })
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

  return <div className={className} onClick={props.onSelectDay} >
    <div className='day-header'>
      <span>{date.format('Do')}</span>
      <span>
        <input type='checkbox' checked={props.selected} />
      </span>
    </div>
    <div className='day-total'>Total: <span className='day-total-hours'>{parseInt(total || 0, 10)}h</span></div>
    <div className='day-timeslips'>{timeslipsHtml}</div>
  </div>
}

