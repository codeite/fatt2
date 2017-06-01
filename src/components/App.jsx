
import React from 'react'
import {
  HashRouter,
  Route,
  Redirect
} from 'react-router-dom'
import moment from 'moment'
import Fatt from './Index'
import {Timesheet} from './Timesheet'

const App = () => (
  <HashRouter>
    <div>
      <Route exact path='/month/:month' component={Fatt} />
      <Route exact path='/' render={() => {
        return <Redirect to={`/month/${moment().format('YYYY-MM')}`} />
      }} />
      <Route exact path='/timesheet/:month' component={Timesheet} />
    </div>
  </HashRouter>
)

export default App
