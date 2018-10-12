export default class ObservableValue {
  constructor(name, initalValue) {
    this.name = name
    this.listeners = new Set()
    this.value = initalValue
  }

  getValue() {
    return this.value
  }

  setValue(newValue) {
    this.value = newValue
    this.listeners.forEach(f => f(newValue))
  }

  addListener(callback) {
    if (typeof callback === 'function') {
      this.listeners.add(callback)
    }
    return () => {
      this.removeListener(callback)
    }
  }

  removeListener(callback) {
    this.listeners.delete(callback)
  }
}
