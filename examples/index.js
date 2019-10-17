import Vue from 'vue'
import App from './App'
import DemoBlock from './components/demo-block'
import MButton from './components/button'
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/color-brewer.css'
// import 'highlight.js/styles/github.css'
import './main.css'
import '../src/docs.css'

Vue.component('DemoBlock', DemoBlock)
Vue.component('MButton', MButton)

Vue.config.productionTip = false

const app = new Vue({
  el: '#app',
  render (h) {
    return h(App)
  }
})

window.app = app

export default app
