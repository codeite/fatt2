import faApi from '../services/fa-api'

export default class TimeslipStore {
  constructor () {
    this._days = {}
  }

  createTimeslips (taskUrl, hours, dates, comment) {
    return faApi.createTimeslips(taskUrl, hours, dates, comment)
      .then(() => {
        const sorted = dates.map(x => x.format('YYYY-MM-DD')).sort()

        const from = sorted[0]
        const to = sorted[sorted.length - 1]
        return this.loadRange(from, to)
      })
  }

  loadRange (from, to) {
    // console.log('load range', from, to)
    faApi.readTimeslips(from, to).then(ts => {
      this.storeTimeslips(ts.timeslips)
    })
  }

  getDay (date) {
    var day = this._days[date]
    if (!day) return null
    return this.dayToDay(day)
  }

  dayToDay (day) {
    return {
      timeslips: [...day.timeslips.values()],
      total: day.total || 0
    }
  }

  getOrCreateDay (date) {
    if (date.format) date = date.format('YYYY-MM-DD')
    let day = this._days[date]
    if (!day) day = this._days[date] = this.createDay(date)
    return day
  }

  registerCallback (date, callback) {
    let day = this.getOrCreateDay(date)
    day.callbacks.push(callback)
    return () => {
      this.unregisterCallback(date, callback)
    }
  }

  unregisterCallback (date, callback) {
    let day = this._days[date]
    if (!day) return

    day.callbacks = day.callbacks.filter(c => c !== callback)
  }

  createDay (date) {
    return {
      date: date,
      callbacks: [],
      timeslips: new Map()
    }
  }

  deleteTimeslips (dates) {
    const timeslips = []
    dates.forEach(date => {
      const day = this.getOrCreateDay(date)
      // console.log(date, [...day.timeslips.values()])
      Array.prototype.push.apply(timeslips, [...day.timeslips.values()])
    })
    return Promise.all(timeslips.map(this.deleteTimeslip.bind(this)))
  }

  deleteTimeslip (timeslip) {
    return faApi.deleteTimeslip(timeslip.url)
      .then(() => {
        const day = this.getOrCreateDay(timeslip.dated_on)
        if (day.timeslips.delete(timeslip.url)) {
          day.total = [...day.timeslips.values()].reduce((p, c) => p + parseInt(c.hours, 10), 0)
          day.callbacks.forEach(cb => cb(this.dayToDay(day)))
        }
      })
  }

  setTimeslipComment (timeslip, newText) {
    const clone = Object.assign({}, timeslip)
    clone.comment = newText
    faApi.updateTimeslip(clone).then(() => {
      this.storeTimeslips([clone])
    })
  }

  storeTimeslip (timeslip) {
    this.storeTimeslips([timeslip])
  }

  storeTimeslips (timeslips) {
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
