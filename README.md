# vue-dotmd-loader

用于把 `markdown` 文件转成 `Vue` 组件的 `webpack` `laoder` 工具包。


**特性**：

+ [x] 支持导入 Vue 文件组件渲染成 Vue 组件实例
+ [x] 代码块支持高亮指定行
+ [x] md里支持编写 Vue 代码和定义 `script` 渲染到当前组件
+ [x] 支持定义当前组件 style 样式
+ [x] md 添加 totolist 支持
+ [x] 支持代码块渲染组件（需要 Vue 的 `esm` 版本）


[Docs](https://mengdu.github.io/vue-dotmd-loader/index.html)

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
          options: {
            // options
          }
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
