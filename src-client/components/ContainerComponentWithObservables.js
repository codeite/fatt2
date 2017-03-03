import React from 'react'

export default class ContainerComponentWithObservables extends React.Component {
  constructor (props) {
    super(props)

    this._observableListeners = []
  }

  componentWillMount () {
    if (this.registerObservables)

    this.props.ob.addListener(v => this.listener(v))
    this.setState({value:this.props.ob.getValue() || 'loading'})

    super.componentWillMount()
  }

  componentWillUnmount () {
    super.componentWillUnmount()
    this.props.ob.removeListener(this.listener)

  }

  registerObservables () {
    return {}
  }

}

function ContainerComponentWithObservables () {

}

ContainerComponentWithObservables.prototype
