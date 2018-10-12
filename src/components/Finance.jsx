import React from 'react'
import stores from '../stores'
import moment from 'moment'
const isoDateOnly = 'YYYY-MM-DD'

export default class Finance extends React.Component {
  constructor(props) {
    super(props)
    this.state = { show: false, total: 0 }
  }

  componentWillMount() {
    const { month } = this.props
    this.calcTotal(month)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ total: 0 })
    const { month } = nextProps
    const { show } = this.state
    this.calcTotal(month, show)
  }

  calcTotal(month, show) {
    if (!show) return

    const to = moment(`${month}-10`)
    const from = moment(to).add(-1, 'days')
    for (let i = 0; i < 32 && from.date() !== 11; i++) {
      from.add(-1, 'days')
    }
    stores.timeslipStore
      .loadRange(from.format(isoDateOnly), to.format(isoDateOnly))
      .then(({ timeslips }) => {
        const taskUrls = new Set(timeslips.map(timeSlip => timeSlip.task))

        return Promise.all([
          Promise.resolve(timeslips),
          ...[...taskUrls].map(taskUrl => stores.taskStore.getTask(taskUrl))
        ])
      })
      .then(([timeslips, ...tasks]) => {
        const tasksMap = tasks.reduce((acc, c) => acc.set(c.url, c), new Map())

        console.log('hours:', timeslips.map(t => t.hours))
        const total = timeslips.reduce((acc, c) => {
          const task = tasksMap.get(c.task)
          if (task.is_billable) {
            acc += (task.billing_rate * parseInt(c.hours)) / 8
          }
          return acc
        }, 0)
        this.setState({
          total,
          from: from.format(isoDateOnly),
          to: to.format(isoDateOnly)
        })
      })
  }

  render() {
    const { month } = this.props
    const { total, show, from, to } = this.state
    if (!show) {
      return (
        <div>
          <a
            onClick={() => {
              this.setState({ show: true })
              this.calcTotal(month, true)
            }}
          >
            Finance
          </a>
        </div>
      )
    }
    return (
      <div>
        <div>
          {from} - {to}: total: £
          {total.toFixed(2).replace(/(\d)(\d\d\d)\./, '$1,$2.')} (
          <a
            onClick={() => {
              this.setState({ show: false })
            }}
          >
            Hide
          </a>
          )
        </div>
      </div>
    )
  }
}
