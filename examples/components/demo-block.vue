<template>
  <div class="demo-block">
    <div class="demo"><slot></slot></div>
    <div class="code"><slot name="code"></slot></div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object
  }
}
</script>
<style>
  .demo-block {
    border: solid 1px #d7e2ea;
    border-radius: 3px;
    margin-bottom: 15px;
  }
  .demo-block .demo {
    padding: 15px;
    border-bottom: solid 1px #d7e2ea;
  }
  .demo-block .code pre {
    margin-bottom: 0;
  }
</style>
