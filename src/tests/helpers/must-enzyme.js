// import ReactElementToJSXString from 'react-element-to-jsx-string'

export default Must => {
  Must.prototype.haveClass = function(expectedClass) {
    const opts = { actualAsString: this.actual.html(), expected: expectedClass }
    this.assert(this.actual.hasClass(expectedClass), 'have class', opts)
    return this
  }

  const oldAssert = Must.prototype.assert
  Must.prototype.assert = function assert(ok, message, opts) {
    if ('actualAsString' in opts) this.actual = opts.actualAsString
    return oldAssert.bind(this)(ok, message, opts)
  }

  console.log('must-enzyme mounted')
}
