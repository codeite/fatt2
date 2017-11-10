
import React from 'react'
import {
  HashRouter,
  Route,
  Redirect
} from 'react-router-dom'
import moment from 'moment'
import Fatt from './Index'
import { Summary } from './summary/Summary'
import {Timesheet} from './Timesheet'

const App = () => (
  <HashRouter>
    <div>
      <Route exact path='/month/:month' render={props => <Fatt month={props.match.params.month} />} />
      <Route exact path='/year' render={() => {
        return <Redirect to={`/year/${moment().format('YYYY')}`} />
      }} />
      <Route exact path='/year/:year' render={props => <Summary year={props.match.params.year} />} />
      <Route exact path='/' render={() => {
        return <Redirect to={`/month/${moment().format('YYYY-MM')}`} />
      }} />
      <Route exact path='/timesheet/:month' component={Timesheet} />
    </div>
  </HashRouter>
)

export default App
