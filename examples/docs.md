# vue-dotmd-loader

> 将 Markdown 转成 Vue 组件的 webpack loader。

```ls
npm install -D vue-dotmd-loader
```
## Usage

> todo...

## 导入Vue例子

[Demo:vue](../examples/demos/button-demo.vue "Button 简单例子")

<!-- [demo:vue](../examples/demos/button-demo.vue?type=info "查询字符串参数") -->

<!-- [demo:vue](../examples/demos/button-demo.vue?{"text":"Hi","number":1001,"bool":true,"arr":[1,true,"text"],"lines":"1,3,5,7-20"} "传json参数") -->


```html {1,3,5-8}
<script>
  import MButton from '../components/button'

export default {
  components: {
    MButton
  }
}
</script>
```

## 文档里编写vue

<input v-model="msg" placeholder="输入..." class="input" />

> {{msg}}

<script data-demo="vue">
export default {
  data () {
    return {
      msg: 'Hi'
    }
  },
  created () {
    console.log(this)
  }
}
</script>

<style data-demo="vue">
  .input {
    border-radius: 3px;
    border: solid 1px #d5dee6;
    padding: 5px 10px;
  }
</style>
