# vue-dotmd-loader

> 将 Markdown 转成 Vue 组件的 webpack loader。

**特性**：

+ [x] 支持导入vue文件组件渲染成vue组件实例
+ [x] 代码块支持高亮指定行
+ [x] md里支持编写vue代码和定义script渲染到当前组件
+ [x] 支持定义当前组件style样式
+ [x] md添加totolist支持
+ [ ] 支持代码块例子

## Usage

**安装**

```ls
npm install -D vue-dotmd-loader
```

**webpack配置**

```js
{
  rules: [
    {
      test: /\.md$/,
      use: [
        'vue-loader', // 必须的
        {
          loader: path.resolve(__dirname, 'lib/index.js'),
          options: options
        }
      ]
    }
  ]
}

```
**options**：

```js
{
  demoNamePerfix: 'VueDemo', // demo组件名前缀
  wrapperName: 'DemoBlock', // 定义 demo 包裹组件（请全局注册好组件），如果空则仅渲染 demo
  fileDemoTag: 'demo:vue',
  markdown: { // markdown-it options
    options: {
      html: false
    },
    notWrapper: false,
    init (md) {
      md.use(otherPlugin) // 添加 markdown-it 插件
    }
  }
}
```

## 导入Vue例子


```md
[demo:vue](<componentPath> [msg]) // 格式是固定的，demo:vue 不区分大小写

[Demo:vue](../examples/demos/button-demo.vue "Button 简单例子")

[demo:vue](../examples/demos/button-demo.vue?type=info "查询字符串参数")

[demo:vue](../examples/demos/button-demo.vue?{"text":"Hi","number":1001,"bool":true,"arr":[1,true,"text"],"lines":"1,3,5,7-20"} "传json参数")
```

支持通过 `?xxx` 传递参数到 `demo-block` 组件；
如查询字符串 `?key=value&key2=value2`；或者传递json `?{"key":"val"}`；
最终会解析成对象到组件的 `params` props。

其中 `lines` 参数会传递到code里控制代码行高亮。

渲染结果如下:

[Demo:vue](../examples/demos/button-demo.vue "Button 简单例子")

[demo:vue](../examples/demos/button-demo.vue?type=info "查询字符串参数")

[demo:vue](../examples/demos/button-demo.vue?{"text":"Hi","number":1001,"bool":true,"arr":[1,true,"text"],"lines":"1,3,5,7-20"} "传json参数")

## DemoBlock 组件定义

`DemoBlock` 组件需要注册到全局组件里，默认名称 `DemoBlock` ，可以在配置里更改。

```html
<template>
  <div class="m-demo-block">
    <div class="demo"><slot></slot></div>
    <div class="code"><slot name="code"></slot></div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    params: Object
  }
}
</script>
```

## 代码高亮指定行

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

## 直接使用Vue代码

```html
<m-button v-on:click="say">Click</m-button>
<button v-on:click="say">Click</button>
<input v-model="msg" placeholder="输入..." class="input" />

{{msg}}
```

<m-button v-on:click="say">Click</m-button>
<button v-on:click="say">Click</button>
<input v-model="msg" placeholder="输入..." class="input" />

> {{msg}}

`script` 标签带有 `data-demo="vue"` 属性的脚本会被解析到当前组件。

```html
<script data-demo="vue">
// data-demo="vue" 的脚本会被解析成vue组件
export default {
  data () {
    return {
      msg: 'Hi'
    }
  },
  methods: {
    say () {
      alert(this.msg)
    }
  },
  created () {
    console.log(this)
  }
}
</script>
```

`style` 标签带有 `data-demo="vue"` 属性的样式会被解析到当前组件。

```html
<style data-demo="vue">
  .input {
    border-radius: 3px;
    border: solid 1px #d5dee6;
    padding: 5px 10px;
  }
</style>
```

<script data-demo="vue">
// data-demo="vue" 的脚本会被解析成vue组件
export default {
  data () {
    return {
      msg: 'Hi'
    }
  },
  methods: {
    say () {
      alert(this.msg)
    }
  },
  created () {
    console.log(this)
  }
}
</script>

<style data-demo="vue">
  /* data-demo="vue" 的样式会被解析到当前vue组件 */
  .input {
    border-radius: 3px;
    border: solid 1px #d5dee6;
    padding: 5px 10px;
  }
</style>
