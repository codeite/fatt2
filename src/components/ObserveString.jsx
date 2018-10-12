import React from 'react'

const ObserveString = React.createClass({
  getDefaultProps() {
    return { t: x => '' + x }
  },
  getInitialState() {
    return { value: '' }
  },
  componentWillMount() {
    this.removeListener = this.props.ob.addListener(newValue =>
      this.setState({ value: newValue })
    )
    this.setState({ value: this.props.ob.getValue() || 'loading' })
  },
  componentWillUnmount() {
    if (typeof this.removeListener === 'function') {
      this.removeListener()
    }
  },
  render() {
    return <span>{this.props.t(this.state.value)}</span>
  }
})

export default ObserveString
