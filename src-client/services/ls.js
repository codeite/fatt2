export default {
  getItem(key) {
    const data = localStorage.getItem(key)
    if (data) {
      try {
        return JSON.parse(data)
      } catch (e) {
        return undefined
      }
    }
  },

  setItem(key, val) {
    localStorage.setItem(key, JSON.stringify(val))
  }
}