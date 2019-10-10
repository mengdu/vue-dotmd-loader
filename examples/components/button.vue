<template>
  <button class="button"><slot></slot></button>
</template>

<script>
export default {
  name: 'MButton'
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
</style>
