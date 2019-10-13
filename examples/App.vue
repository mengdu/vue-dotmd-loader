<template>
  <div class="container">
    <header class="header">
      <h1 class="title">vue-dotmd-loader</h1>
      <p class="des">用于 webpack 支持 import Markdown 文件到 Vue 组件的 loader。</p>
      <div class="links">
        <a href="https://github.com/mengdu/vue-dotmd-loader" class="button button-info button-round" style="width: 120px;">Github</a>
        <a href="https://lanyueos.com" class="button button-white button-round" style="width: 120px;">My Home</a>
      </div>
    </header>
    <docs />
    <footer class="footer">
      <div class="line"></div>
      <div >
        <ul class="links">
          <li>&copy;2019 Lanyue.</li>
          <li><a href="https://github.com/mengdu">Github</a></li>
          <li><a href="https://lanyueos.com">Home</a></li>
          <li><a href="https://blog.lanyueos.com">Blog</a></li>
          <li><a href="https://github.com/mengdu">About</a></li>
        </ul>
      </div>
    </footer>
  </div>
</template>
<script>
import Docs from './docs.md'
// import Test from '!vue-loader?vue-loader-options!./docs.md'
import ButtonDemo from './demos/button-demo'

console.log(1, Docs)

export default {
  components: {
    // Docs, Test,
    Docs,
    ButtonDemo
  },
  data () {
    return {
      params: {title: 'Hi'}
    }
  }
}
</script>

