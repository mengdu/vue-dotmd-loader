# vue-dotmd-loader

> 将 Markdown 转成 Vue 组件的 webpack loader。

```ls
npm install -D vue-dotmd-loader
```
## Usage

> todo...

## Demo

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

<button>Button</button>

## End
