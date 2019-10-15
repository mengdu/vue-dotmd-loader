<template>
  <button class="button"
    :class="[
      type && 'button-' + type,
      round && 'button-round'
    ]"
    @click="$emit('click')"><slot></slot></button>
</template>

<script>
export default {
  name: 'MButton',
  props: {
    type: String,
    round: Boolean
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
    display: inline-block;
  }

  a.button {
    text-decoration: none;
  }

  .button:hover {
    background-image: linear-gradient(0deg, #131517 0, #353c44);
  }

  .button.button-info {
    background-image: linear-gradient(0deg, #059de2 0, #00b0ff);
  }
  .button.button-white {
    background-image: linear-gradient(0deg, #d0d6dc 0, #e7ebef);
    color: #2c353c;
  }

  .button.button-round {
    border-radius: 100px;
  }
</style>
