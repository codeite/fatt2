import React from 'react'
import {render} from 'react-dom'

import App from './src/components/App'

class EntryPoint extends React.Component {
  render () {
    return <App />
  }
}

render(<EntryPoint />, document.getElementById('app'))
