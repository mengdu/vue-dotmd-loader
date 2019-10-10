<template>
  <div>
    <!-- <test /> -->
    <!-- <docs />
    <test /> -->
    <button-demo />
    <docs />
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
    return {}
  }
}
</script>

