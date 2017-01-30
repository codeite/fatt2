import React from 'react'

const ObserveString = React.createClass({
  getDefaultProps() { return {t: x => '' + x} },
  getInitialState() { return {value: ''} },
  listener(newValue) { this.setState({value: newValue}) },
  componentWillMount() {
    this.props.ob.addListener(this.listener)
    this.setState({value:this.props.ob.getValue()})
  },
  componentWillUnmount() { this.props.ob.removeListener(this.listener) },

  render() {
    return <span>{this.props.t(this.state.value)}</span>
  }
})

export default ObserveString
