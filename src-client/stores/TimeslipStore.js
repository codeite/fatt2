import faApi from '../services/fa-api'

class TimeslipStore {
  constructor(from, to) {
    this._days = {}

  }

  loadRange(from, to) {
    faApi.readTimeslips(from, to).then(ts => {
      this.storeTimeslips(ts.timeslips)
    })
  }

  getDay(date) {
    var day = this._days[date];

    if(!day) return null;

    return this.dayToDay(day)
  }

  dayToDay(day) {
    return {
      timeslips: [...day.timeslips.values()],
      total: day.total
    }
  }

  getOrCreateDay(date) {
    let day = this._days[date]
    if (!day) day = this._days[date] = this.createDay(date)
    return day
  }

  registerCallback(date, callback) {
    let day = this.getOrCreateDay(date)
    day.callbacks.push(callback)
  }

  unregisterCallback(date, callback) {
    let day = this._days[date]
    if (!day) return

    day.callbacks = day.callbacks.filter(c => c != callback)
  }

  createDay(date) {
    return {
      date: date,
      callbacks: [],
      timeslips: new Map()
    }
  }

  storeTimeslip(timeslip) {
    this.storeTimeslips([timeslip])
  }

  storeTimeslips(timeslips) {
    const callbacksToFire = new Set()

    timeslips.forEach(timeslip => {
      const date = timeslip.dated_on
      const day = this.getOrCreateDay(date)
      day.timeslips.set(timeslip.url, timeslip)
      callbacksToFire.add(day)
    })

    for (let day of callbacksToFire) {
      day.total = [...day.timeslips.values()].reduce((p, c) => p + parseInt(c.hours, 10), 0)
      day.callbacks.forEach(cb => cb(this.dayToDay(day)))
    }
  }

}

module.exports = TimeslipStore
export default TimeslipStore