<template>
  <div>
    <!-- <test /> -->
    <docs />
    <test />
  </div>
</template>
<script>
import Docs from './docs.md'
import Test from '!vue-loader?vue-loader-options!./docs.md'

console.log(Docs, Test)

export default {
  components: { Docs, Test },
  data () {
    return {}
  }
}
</script>

