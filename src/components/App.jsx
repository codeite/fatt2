
import React from 'react'
import {
  HashRouter,
  Route,
  Redirect
} from 'react-router-dom'
import moment from 'moment'
import Fatt from './Index'
import { SummaryContainer } from './summary/SummaryContainer'
import { Timesheet } from './Timesheet'

const App = () => (
  <HashRouter>
    <div>
      <Route exact path='/month' render={() => {
        return <Redirect to={`/month/${moment().format('YYYY-MM')}`} />
      }} />
      <Route exact path='/month/:month' render={props => <Fatt month={props.match.params.month} />} />
      <Route exact path='/year' render={() => {
        return <Redirect to={`/year/${moment().format('YYYY')}`} />
      }} />
      <Route exact path='/year/:year' render={props => <SummaryContainer year={props.match.params.year} />} />
      <Route exact path='/' render={() => {
        return <Redirect to={`/month/${moment().format('YYYY-MM')}`} />
      }} />
      <Route exact path='/timesheet/:month' component={Timesheet} />
      <footer>
        <a href="#/month">Month</a>
        {' | '}
        <a href="#/year">Year</a>
      </footer>
    </div>
  </HashRouter>
)

export default App
