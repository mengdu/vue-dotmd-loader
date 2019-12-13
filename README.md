# vue-dotmd-loader

A webpack loader for loader markdown file transform to vue file.


[中文](./README-zh.md)

**Features**：

+ [x] Support to import Vue file components and render them into Vue component instances
+ [x] Code block supports highlighting specified lines
+ [x] Supports writing Vue code and defining `script` to render to the current component
+ [x] Support defining current component style
+ [x] Support todolist
+ [x] Support code block rendering components (requires the `ESM` version of Vue)
+ [x] Support for importing file code (rendering to code highlight)
+ [x] Support to import source code (such as importing HTML fragments, note: it will not be compiled through markdown)


Detailed usage：[Docs](https://mengdu.github.io/vue-dotmd-loader/index.html)

## Usage

**install**

```ls
npm install -D vue-dotmd-loader
```

**webpack.config.js**

```js
{
  rules: [
    {
      test: /\.md$/,
      use: [
        'vue-loader', // must use vue-loader
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
  wrapperName: 'DemoBlock', // Define the demo package component (please register the component globally). If it is empty, only the demo will be rendered.
  fileDemoNamePerfix: 'FileDemo', // Name prefix of the demo component file
  blockDemoNamePerfix: 'BlockCodeDemo',// Name prefix of Code block demo component
  fileDemoTag: 'demo:vue', // File demo tag; format: [demo:vue](filePath)
  blockDemoTag: 'demo:vue', // Block code demo tag; format: ````html demo:vue code ````
  includeCodeTag: 'include:code', // Include code tag; format: [include:code](filePath)
  includeRawTag: 'include:raw', // Include raw source tag; format: [include:raw](filePath)
  dest: false, // ouput file; true/false/function
  dest (code, contextPath, resourcePath) {}, // Custom write file
  markdown: { // markdown-it options see: https://github.com/markdown-it/markdown-it#init-with-presets-and-options
    options: {
      html: false
    },
    notWrapper: false,
    init (md) {
      md.use(otherPlugin) // Add markdown-it plug-in
    }
  }
}
```

**eslint ignore**

```json
{
  "eslintIgnore": [
    "**/*.md"
  ]
}
```

If you need the same style as this page, please refer to CSS as follows.

```js
import 'github-markdown-css/github-markdown.css'
import 'highlight.js/styles/color-brewer.css'
import 'vue-dotmd-loader/src/docs.css'
```

## Vue CLI

If you are using a project initialized by Vue cli, configure it as follows.

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
        ...(config.module.rules.get('vue').uses.get('vue-loader').get('options') || null) // Consistent with Vue loader configuration
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
