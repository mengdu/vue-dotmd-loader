<template>
  <button class="button" :class="[type && 'button-' + type]" @click="$emit('click')"><slot></slot></button>
</template>

<script>
export default {
  name: 'MButton',
  props: {
    type: String
  }
}
</script>

<style>
  .button {
    border: 0;
    background-image: linear-gradient(0deg, #292e34 0, #353c44);
    padding: 10px 15px;
    box-sizing: border-box;
    color: #fff;
    border-radius: 3px;
    cursor: pointer;
  }

  .button:hover {
    background-image: linear-gradient(0deg, #131517 0, #353c44);
  }

  .button.button-info {
    background-image: linear-gradient(0deg, #059de2 0, #00b0ff);
  }
</style>
