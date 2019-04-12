<template>
  <div class="example">
    <p>{{ msg }}</p>
    <input v-model="msg"/>
  </div>
</template>
<script>
export default {
  data () {
    return {
      msg: 'Hello world!'
    }
  }
}
</script>
