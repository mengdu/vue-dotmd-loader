import Vue from 'vue'
import App from './App'

const app = new Vue({
  el: '#app',
  render (h) {
    return h(App)
  }
})

window.app = app

export default app
