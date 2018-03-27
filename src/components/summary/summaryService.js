import moment from 'moment'
import faApi from '../../services/fa-api'

export function commonMonthStats (year) {
  const monthStats = {}

  for (const date = moment(year + '-01-01');
    '' + date.year() === '' + year;
    date.add(1, 'days')) {
    if (!monthStats[date.month()]) monthStats[date.month()] = {available: 0, worked: 0, unworked: 0}

    if (date.isoWeekday() <= 5) {
      monthStats[date.month()].available++
    }
  }

  return monthStats
}

export function readAndCalc (year) {
  return faApi.readTimeslips(year + '-01-01', year + '-12-31')
    .then(data => {
      const projectsAndTasks = new Set()

      data.timeslips.forEach(ts => {
        projectsAndTasks.add(ts.project)
        projectsAndTasks.add(ts.task)
      })

      return Promise.all([...projectsAndTasks].map(url => faApi.resolve(url)))
        .then(projectsAndTasksResolved => {
          const rMap = projectsAndTasksResolved.reduce((p, c) => {
            p[c.url] = c
            return p
          }, {})

          return data.timeslips.reduce((p, c) => {
            if (!p[c.dated_on]) p[c.dated_on] = []
            p[c.dated_on].push(c)
            if (!rMap[c.project]) console.log('Project is missing. Looking for', c.project, 'in', rMap)
            if (!rMap[c.project]) console.log('Task is missing. Looking for', c.task, 'in', rMap)
            c.project = rMap[c.project]
            c.task = rMap[c.task]
            return p
          }, {})
        })
    })
    .then(timeslipsByDate => {
      const timeslips = Object.values(timeslipsByDate).reduce((p, c) => [...p, ...c], [])
      const monthStats = timeslips.reduce((p, c) => {
        const date = moment(c.dated_on)
        if (!p[date.month()]) p[date.month()] = { worked: 0, unworked: 0}
        const days = (~~c.hours) / (~~c.project.hours_per_day)

        if (c.task.is_billable) {
          p[date.month()].worked += days
        } else {
          p[date.month()].unworked += days
        }
        return p
      }, commonMonthStats(year))
      // monthStats.forEach(dom => {
      //   dom.className = calClassName(dom)
      // })

      const yearStats = {
        weekendDays: 0,
        workedDays: 0,
        holidayDays: 0,
        untrackedDays: 0
      }
      const date = moment(year + '-01-01')
      console.log('monthStats', monthStats)
      const dayStats = {}

      while ('' + date.year() === '' + year) {
        const dayTimeslips = timeslipsByDate[date.format('YYYY-MM-DD')]
        const dayStat = (dayStats[date.format('YYYY-MM-DD')] = dayStats[date.format('YYYY-MM-DD')] || {})
        //console.log('day:', day)
        if (date.isoWeekday() > 5) {
          yearStats.weekendDays++
        } else if (dayTimeslips) {
          const dayData = dayTimeslips.reduce((p, c) => {
            if (c.task.is_billable) {
              p.w += ~~c.hours / ~~c.project.hours_per_day
            } else {
              p.u += ~~c.hours / ~~c.project.hours_per_day
            }
            return p
          }, {w: 0, u: 0})
          const total = dayData.w + dayData.u

          if (total < 1) {
            console.log('dayData:', dayData)
            console.log('day:', day)
            yearStats.untrackedDays++
          } else if (total > 1) {
            yearStats.workedDays += dayData.w / total
            yearStats.holidayDays += dayData.u / total
          } else {
            yearStats.workedDays += dayData.w
            yearStats.holidayDays += dayData.u
          }
        } else {
          yearStats.untrackedDays++
        }

        date.add(1, 'days')
      }

      //this.setState({timeslipsByDate, monthStats, yearStats})
      return {timeslipsByDate, monthStats, yearStats}
    })
}

export const calClassName = (date, timeslipsByDate) => {
  if (!date.moment) return null

  if (date.moment.isoWeekday() > 5) {
    return 'day weekend'
  } else if (date.moment > moment()) {
    return 'day'
  } else {
    let className = 'day weekday'

    const dateStr = date.moment.format('YYYY-MM-DD')
    const data = timeslipsByDate[dateStr]

    const res = (data || []).reduce((p, c) => {
      if (c.task.is_billable) {
        p.paid += ~~c.hours / ~~c.project.hours_per_day
      } else {
        p.unpaid += ~~c.hours / ~~c.project.hours_per_day
      }
      return p
    }, {paid: 0, unpaid: 0})
    const total = res.paid + res.unpaid

    if (total < 1) {
      className += ' short'
    } else if (res.paid >= 1) {
      className += ' complete'
    } else {
      const worked = Math.floor(res.paid * 4) * 25
      className += ' unbillable' + worked
    }

    return className
  }
}
