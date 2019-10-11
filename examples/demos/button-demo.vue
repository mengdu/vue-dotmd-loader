<template>
  <div>
    <m-button class="m-btn" @click="doSwitch" :data-state="state" v-bind="$attrs">Button</m-button>
    <span>{{state}}</span>
  </div>
</template>
<script>
import MButton from '../components/button'

export default {
  components: {
    MButton
  },
  data () {
    return {
      state: false
    }
  },
  methods: {
    doSwitch () {
      this.state = !this.state
    }
  }
}
</script>
<style>
  .m-btn {
    /* color: red; */
  }
</style>
