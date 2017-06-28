import React from 'react'
import stores from '../stores'

import Day from './Day'

export default class DayContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {loaded: false}
    this.unregisterHandlers = []
  }

  componentWillMount () {
    const selectedOb = stores.selectedStore.getDayOb(this.props.date)
    this.unregisterHandlers.push(selectedOb.addListener(selected => {
      this.setState({selected: selected})
    }))
    this.setState({selected: selectedOb.getValue()})

    this.unregisterHandlers.push(stores.timeslipStore.registerCallback(this.props.date, day => {
      this.setState(Object.assign({
        loaded: true
      }, day))
    }))

    const day = stores.timeslipStore.getDay(this.props.date)
    if (day) {
      this.setState(Object.assign({
        loaded: true
      }, day))
    }
  }

  componentWillUnmount () {
    this.unregisterHandlers.forEach(unregister => {
      if (typeof unregister === 'function') {
        unregister()
      }
    })
  }

  onSelectDay (e) {
    if (e.shiftKey) {
      stores.selectedStore.setToDay(this.props.date, !this.state.selected)
    } else {
      const selectedOb = stores.selectedStore.getDayOb(this.props.date)
      selectedOb.setValue(!this.state.selected)
      document.getSelection().removeAllRanges()
    }
  }

  onDeleteTimeslip (timeslip) {
    stores.timeslipStore.deleteTimeslip(timeslip)
  }

  onSetCommnet (timeslip, newText) {
    stores.timeslipStore.setTimeslipComment(timeslip, newText)
  }

  render () {
    return <Day
      loaded={this.state.loaded}
      selected={this.state.selected}
      timeslips={this.state.timeslips}
      total={this.state.total}
      billableHours={this.state.billableHours}
      date={this.props.date}
      month={this.props.month}
      onSetCommnet={this.onSetCommnet.bind(this)}
      onSelectDay={this.onSelectDay.bind(this)}
      onDeleteTimeslip={this.onDeleteTimeslip.bind(this)} />
  }
}
