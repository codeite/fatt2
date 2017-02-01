import React from 'react'

const ObserveString = React.createClass({
  getDefaultProps() { return {t: x => '' + x} },
  getInitialState() { return {value: ''} },
  listener(newValue) {
    this.setState({value: newValue})
  },
  componentWillMount() {
    this.props.ob.addListener(v => this.listener(v))
    this.setState({value:this.props.ob.getValue() || 'loading'})
  },
  componentWillUnmount() { this.props.ob.removeListener(this.listener) },

  render() {
    return <span>{this.props.t(this.state.value)}</span>
  }
})

export default ObserveString
