# vue-dotmd-loader

用于把 `markdown` 文件转成 `Vue` 组件的 `webpack` `laoder` 工具包。


**特性**：

+ [x] 支持导入 Vue 文件组件渲染成 Vue 组件实例
+ [x] 代码块支持高亮指定行
+ [x] md里支持编写 Vue 代码和定义 `script` 渲染到当前组件
+ [x] 支持定义当前组件 style 样式
+ [x] md 添加 totolist 支持
+ [x] 支持代码块渲染组件（需要 Vue 的 `esm` 版本）
+ [x] 支持导入文件代码（渲染成代码高亮）
+ [x] 支持导入源码（比如导入html片段，注意：不会经过markdown编译）

详细用法：[Docs](https://mengdu.github.io/vue-dotmd-loader/index.html)

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
  includeCodeTag: 'include:code', // 导入code，渲染成代码
  includeRawTag: 'include:raw', // 导入html片段
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

如果你使用 Vue cli 初始化的项目，请按照如下配置。

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
