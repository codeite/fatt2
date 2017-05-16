
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
      <Route path='/'>
        <Redirect to={`/${moment().format('YYYY-MM')}`} />
      </Route>
      <Route path='/:month?' component={Fatt} />
    </div>
  </HashRouter>
)

export default App
