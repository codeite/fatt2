export default {
  getItem (key) {
    const data = window.localStorage.getItem(key)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return undefined
      }
    }
  },

  setItem (key, val) {
    window.localStorage.setItem(key, JSON.stringify(val))
  }
}
