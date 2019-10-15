<!-- # vue-dotmd-loader

用于把 `markdown` 文件转成 `Vue` 组件的 `webpack` `laoder` 工具。 -->

<!-- [demo:vue](../README.md?{"hideCode":true}) -->

**特性**：

+ [x] 支持导入 Vue 文件组件渲染成 Vue 组件实例
+ [x] 代码块支持高亮指定行
+ [x] md里支持编写 Vue 代码和定义 `script` 渲染到当前组件
+ [x] 支持定义当前组件 style 样式
+ [x] md 添加 totolist 支持
+ [x] 支持代码块渲染组件（需要 Vue 的 `esm` 版本）

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
        'vue-loader', // vue-dotmd-loader => vue-loader 必须的
        {
          loader: 'vue-dotmd-loader',
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
  wrapperName: 'DemoBlock', // 定义 demo 包裹组件（请全局注册好组件），如果空则仅渲染 demo
  fileDemoNamePerfix: 'FileDemo', // 文件 demo 组件名前缀
  blockDemoNamePerfix: 'BlockCodeDemo',// 代码块 demo 组件名前缀
  fileDemoTag: 'demo:vue',
  blockDemoTag: 'demo:vue',
  dest: false, // 输出结果文件 bool 或者 function
  dest (code, contextPath, resourcePath) {}, // 自定义写文件
  markdown: { // markdown-it options see: https://github.com/markdown-it/markdown-it#init-with-presets-and-options
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

如果你需要与本页面一样的样式，请按照如下引用 css。

```js
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/color-brewer.css'
import 'vue-dotmd-loader/src/docs.css'
```

## Vue CLI

```js
{
  // ...
  configureWebpack: {
    resolve: {
      extensions: ['.md'],
    }
  },
  chainWebpack (config) {
    // see: https://github.com/neutrinojs/webpack-chain
    config.module
      .rule('dotmd')
      .test(/\.md$/)
      .use('vue-loader')
      .loader('vue-loader')
      .options({
        ...(config.module.rules.get('vue').uses.get('vue-loader').get('options') || null) // 与 vue-loader 配置保持一致
      })
      .end()
      .use('vue-dotmd-loader')
      .loader('vue-dotmd-loader')
      .options({
        dest: true,
        markdown: {
          options: {
            html: true
          }
        }
      })
      .end()
  }
}
```

### 导入 `.vue` 文件


```md
[demo:vue](<componentPath> [msg]) // 格式是固定的，demo:vue 不区分大小写

[Demo:vue](../examples/demos/button-demo.vue "Button 简单例子")

[demo:vue](../examples/demos/button-demo.vue?lines=1,3,6,10-13 "查询字符串参数")

[demo:vue](../examples/demos/button-demo.vue?{"text":"Hi","number":1001,"bool":true,"arr":[1,true,"text"],"lines":"1,3,5,7-20","hideCode":true} "传json参数")
```

支持通过 `?xxx` 传递参数到 `demo-block` 组件；
如查询字符串 `?key=value&key2=value2`；或者传递json `?{"key":"val"}`；
最终会解析成对象到组件的 `params` props。

其中 `lines` 参数会传递到code里控制代码行高亮。

渲染结果如下:

[Demo:vue](../examples/demos/button-demo.vue "Button 简单例子")

[demo:vue](../examples/demos/button-demo.vue?lines=1,3,6,10-13 "查询字符串参数")

[demo:vue](../examples/demos/button-demo.vue?{"text":"Hi","number":1001,"bool":true,"arr":[1,true,"text"],"lines":"1,3,5,7-20","hideCode":true} "传json参数")

> 如果需要定义例子渲染效果，请参考 **DemoBlock 组件定义**

### DemoBlock 组件定义

`DemoBlock` 组件需要注册到全局组件里，默认名称 `DemoBlock` ，可以在配置里更改。

```html
<template>
  <div class="m-demo-block">
    <div class="demo"><slot></slot></div>
    <div class="code" v-if="!params.hideCode"><slot name="code"></slot></div>
  </div>
</template>

<script>
export default {
  props: {
    data: Object,
    params: {
      type: Object,
      default () {
        return {}
      }
    }
  }
}
</script>
```

### 代码高亮指定行

````md
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
````

结果：

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

### 代码块demo

可以支持在 `md` 文件里编写Vue例子并渲染成实例，不过需要使用vue的 `esm` 版本。

**webpack 配置**：

```js {3}
{
  alias: {
    'vue$': 'vue/dist/vue.esm.js' // esm 版本支持template模板编译
  }
}
```

````html demo:vue
<template>
  <m-button :title="`Hi`">Button</m-button>
</template>
````

````html demo:vue
<template>
  <m-button class="blue" @click="click">Button</m-button>
</template>
<script>
export default {
  methods: {
    click () {
      console.log(this)
    }
  }
}
</script>
<style>
  .blue {
    color: blue;
  }
</style>
````

### 直接使用Vue代码

如果需要 markdown 中编写 vue 组件或者 html 需要配置 html 支持

```js
{
  options: {
    markdown: {
      options: {
        html: true // 支持html渲染
      }
    }
  }
}
```

> + 值得注意的是事件暂时不支持 `@event` 绑定，请使用 `v-on:event`
> + 其中用到的变量和事件需要添加一个 **&lt;script data-demo="vue"&gt;** 的脚本

**例子**：

```html
<m-button v-on:click="say" type="info" round style="width: 120px;">Click</m-button>
<button v-on:click="say">Click</button>
<input v-model="msg" placeholder="输入..." class="input" />

> {{msg}}
```

**结果**:

<demo-block :params="{hideCode: true}">
  <m-button v-on:click="say" type="info" round style="width: 120px;">Click</m-button>
  <button v-on:click="say">Click</button>
  <input v-model="msg" placeholder="输入..." class="input" />
  <p></p>

> {{msg}}

</demo-block>

#### 定义当前脚本

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

#### 定义当前样式

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

-------------
