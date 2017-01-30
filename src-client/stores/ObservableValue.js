
class ObservableValue {
  constructor(initalValue) {

    this.listeners = new Set()
    this.value = initalValue
  }

  getValue() {
    return this.value;
  }

  setValue(newValue) {
    this.value = newValue
    this.listeners.forEach(f => f(newValue))
  }

  addListener(callback) {
    if (typeof(callback) === 'function') {
      this.listeners.add(callback)
    }
  }

  removeListener(callback) {
     this.listeners.delete(callback)
  }
}

module.exports = ObservableValue
export default ObservableValue