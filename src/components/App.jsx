
import React from 'react'
import {
  HashRouter,
  Route,
  Redirect
} from 'react-router-dom'
import moment from 'moment'
import Fatt from './Index'

const App = () => (
  <HashRouter>
    <div>
      <Route path='/:month' component={Fatt} />
      <Route exact path='/' render={() => {
        return <Redirect to={`/${moment().format('YYYY-MM')}`} />
      }} />
    </div>
  </HashRouter>
)

export default App
