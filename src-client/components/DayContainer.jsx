import React from 'react'
import stores from '../stores'

import Day from './Day'

export default class DayContainer extends React.Component {
  constructor (props) {
    super(props)
    this.state = {loaded: false}
  }

  componentWillMount () {
    const selectedOb = stores.selectedStore.getDayOb(this.props.date)
    selectedOb.addListener(selected => {
      this.setState({selected: selected})
    })
    this.setState({selected: selectedOb.getValue()})

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

  render () {
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
