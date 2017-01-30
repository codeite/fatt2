import ObservableValue from './ObservableValue'
const moment = require('moment')

export default class SelectedStore {
  constructor() {
    this._days = new Map()
    this.selectedDates = []
  }

  getSelectedDates() {
    return [...this._days.values()].filter(x => x.getValue()).map(x => x.date)
  }

  registerSelectedDatesCallback(cb) {
    this.selectedDates.push(cb)
  }

  clear() {
    [...this._days.values()].forEach(day => {
      if (day.getValue()) day.setValue(false)
    })
  }

  getDayOb(date) {
    date = moment(date)
    if (!this.epoch) this.epoch = moment(date)

    const dse = date.diff(this.epoch, 'days')
    //console.log('getDayOb', date, dse)
    return this.getDayByDse(dse)
  }

  getDayByDse(dse) {
    if (this._days.has(dse)) {
      //console.log('getDayByDse', dse, 'existing')
      return this._days.get(dse)
    } else {
      //console.log('getDayByDse', dse, 'new')
      const ob = new ObservableValue(false)
      ob.addListener(checked => {
        //console.log('Change', dse, 'to', checked)
        //console.log('Set _lastSetDse:', dse)
        this._lastSetDse = dse
        const selectedDates = this.getSelectedDates()
        this.selectedDates.forEach(cb => cb(selectedDates))
      })
      this._days.set(dse, ob)
      ob.dse = dse
      ob.date = this.epoch.clone().add(dse, 'days')
      return ob
    }
  }

  // setDay(date, checked) {
  //   const day = this.getDayOb(date)
  //   this._lastSet = {date, day}
  //   day.setValue(checked)
  // }

  setToDay(date, checked) {
    console.log('setToDate:', date, checked)
    if (this._lastSetDse === undefined) return this.getDayOb(date).setValue(checked)

    date = moment(date)
    const dse = date.diff(this.epoch, 'days')
    const lastDse = this._lastSetDse

    const inc = dse > this._lastSetDse ? -1 : 1
    console.log('from', dse, 'to', lastDse, 'step', inc)
    for(let i=dse, x=0; i !== lastDse && x < 200; i += inc, x++) {
      const day = this.getDayByDse(i)
      if (day.date.isoWeekday() < 6) {
        day.setValue(checked)
      }
    }
  }
}