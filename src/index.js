import { getOptions } from 'loader-utils'
import crypto from 'crypto'
import path from 'path'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import querystring from 'querystring'
import taskListPlugin from 'markdown-it-task-lists'
// import highlightLinesPlugin from 'markdown-it-highlight-lines'
import highlightLinesPlugin from './highlightLines'
import { writeFileSync } from 'fs'

function md5 (str) {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}

const HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  '\'': '&apos;',
  '`': '&grave;'
  // '{': '&lcub;',
  // '}': '&rcub;'
}

function escapeHtml (str) {
  if (/[&<>"'`]/.test(str)) {
    return str.replace(/[&<>"'`]/g, (ch) => HTML_REPLACEMENTS[ch])
  }
  return str
}

function highlight (code, lang) {
  let html = ''
  if (lang && hljs.getLanguage(lang)) {
    try {
      html = hljs.highlight(lang, code).value
    } catch (err) {}
  }

  return `<pre class="language language-${lang}" data-lang="${lang}"><code v-html="\`${escapeHtml(html)}\`"></code></pre>`
}

function renderMarkdown (text, options, notWrapper) {
  const md = new MarkdownIt({
    highlight,
    ...options
  })

  md.use(highlightLinesPlugin)
  md.use(taskListPlugin)

  // 用于注册插件
  if (typeof options.init === 'function') {
    options.init(md)
  }

  return notWrapper ? md.render(text) : `<div class="markdown-body">${md.render(text)}</div>`
}

function getDependencies (code, options) {
  const imports = code.replace(/<!--.*?-->/g, '') // 去掉注释
    .match(new RegExp(`\\[${options.fileDemoTag}\\]\\(.+?\\)`, 'ig')) // [Demo:file](../demos/xxx.vue "title")

  if (!imports) return []

  return imports.map(e => {
    const data = e.match(/\((.+)\)/) // ../demos/xxx.vue "title"
    const [url, title] = data[1].split(/ +"/) // 空格分隔
    const [filename, query] = url.split('?')
    const filepath = path.resolve(this.context, filename)

    const raw = this.fs
      .readFileSync(filepath, 'utf8')
      .toString()
      .trim()

    let params = null
    if (query) {
      try {
        params = JSON.parse(query)
      } catch (err) {
        params = querystring.parse(query)
      }
    }

    return {
      identity: e,
      raw: raw,
      filename: filename,
      filepath: filepath,
      params: params, // 传递到 demo-block 组件的参数
      query: query,
      title: title.replace(/"/, '')
    }
  })
}

function createDemoHtml (wrapperName, componentName, codeHTML, props) {
  const data = props.data ? escapeHtml(JSON.stringify(props.data)) : '{}'
  const params = props.params ? escapeHtml(JSON.stringify(props.params)) : '{}'

  return `<${wrapperName} :data="${data}" :params="${params}">
    <template v-slot:code>
    ${codeHTML}
    </template>
    <${componentName} />
    </${wrapperName}>`
}

function fileAnalysis (source, options) {
  const dependencies = getDependencies.apply(this, [source, options])
  const imports = []
  const components = []
  const newDependencies = []

  for (let i = 0; i < dependencies.length; i++) {
    const item = dependencies[i]
    const componentName = `${options.fileDemoNamePerfix}${md5(item.identity).slice(0, 11)}`
    item.placeholder = `$${componentName}$`

    // demo占位
    source = source.replace(item.identity, item.placeholder)

    // 避免同组件重复
    if (components.indexOf(componentName) !== -1) {
      continue
    }

    components.push(componentName)
    imports.push(`import ${componentName} from '${item.filename}'`)

    const lines = (item.params && item.params.lines) ? item.params.lines : ''
    const codeHtml = renderMarkdown(`\n\`\`\`html${lines ? ` {${lines}}` : ''}\n${item.raw}\n\`\`\`\n`, { ...options.markdown.options, html: true }, true)

    let componentHtml = ''
    if (options.wrapperName) {
      const props = {
        data: {
          raw: item.raw,
          filename: item.filename,
          title: item.title
        },
        params: item.params || null
      }

      componentHtml = createDemoHtml(options.wrapperName, componentName, codeHtml, props)
    } else {
      componentHtml = `<${componentName} />`
    }

    item.componentName = componentName
    item.demoBlockHtml = componentHtml

    newDependencies.push(item)
  }

  return {
    imports,
    components,
    source,
    dependencies: newDependencies
  }
}

function replaceCodes (source) {
  const codeDict = {}
  source = source.replace(/```[\s\S]+?```/g, (e) => {
    const identity = md5(e)
    const placeholder = `<!--${identity}-->`
    codeDict[placeholder] = e
    return placeholder
  })

  return {
    source,
    codeDict
  }
}

function revertCodes (source, dict) {
  for (const key in dict) {
    source = source.replace(key, dict[key])
  }

  return source
}

function getDemoScript (source) {
  const demoScriptReg = /<script +data-demo="vue".*>([\s\S]+?)<\/script>/
  const matchResult = source.match(demoScriptReg)
  let demoScript = ''
  const demoMixinName = 'DemoScript' + Math.random().toString().substring(2, 10)

  // 如果存在脚本则提取脚本
  if (matchResult && matchResult[1]) {
    source = source.replace(demoScriptReg, '') // 去掉demo脚本
    demoScript = matchResult[1].replace(/export default/, `const ${demoMixinName} =`) // 转成mixin变量
  }

  return {
    demoScript,
    demoMixinName,
    source
  }
}

function getDemoStyle (source) {
  const demoStyleReg = /<style +data-demo="vue".*>([\s\S]+?)<\/style>/
  const matchResult = source.match(demoStyleReg)

  if (matchResult && matchResult[0]) {
    source = source.replace(demoStyleReg, '') // 去掉demo样式
  }

  return {
    demoStyle: matchResult[0] || '',
    source
  }
}

function getBlocCodekDemo (source, options) {
  const blockDict = {}
  const blocks = []
  const reg = new RegExp(`\`\`\`\`(html|vue)\\s+${options.blockDemoTag}.*\\s+([\\s\\S]+?)\`\`\`\``, 'ig')
  source = source.replace(reg, (md, type, code) => {
    const styleResult = code.match(/<style\s*>([\s\S]+?)<\/style>/)
    const scriptResult = code.match(/<script\s*>([\s\S]+?)<\/script>/)
    const templateResult = code.match(/<template\s*>([\s\S]+?)<\/template>/)

    // 原样返回
    if (!templateResult) return md

    const componentName = `${options.blockDemoNamePerfix}${md5(md).slice(0, 11)}`

    if (blockDict[componentName]) {
      return blockDict[componentName]
    }

    let js = ''
    if (scriptResult && scriptResult[1]) {
      // export default {} => return {}
      js = scriptResult[1].replace(/export default/, 'return')
    }

    code = code.trim() // 去掉多余换行

    const placeholder = `$${componentName}$`
    blockDict[componentName] = placeholder
    const codeHTML = renderMarkdown(`\n\`\`\`html\n${code}\n\`\`\`\n`, { ...options.markdown.options }, true)

    const data = {
      placeholder: placeholder,
      componentName: componentName,
      md,
      raw: code,
      cssText: (styleResult && styleResult[1]) ? styleResult[1] : '',
      js: (scriptResult && scriptResult[1]) ? `(() => {\n${js}\n})();` : '(() => ({}))();',
      template: JSON.stringify(`<div>${templateResult[1]}</div>`),
      html: createDemoHtml(options.wrapperName, componentName, codeHTML, { data: { raw: code }, params: {} })
    }

    blocks.push(data)

    return placeholder
  })

  return {
    source,
    blocks
  }
}

export default function loader (source) {
  const callback = this.async() // loader 异步返回
  const options = {
    wrapperName: 'DemoBlock', // 定义 demo 包裹组件（请全局注册好组件），如果空则仅渲染 demo
    fileDemoNamePerfix: 'FileDemo', // demo组件名前缀
    blockDemoNamePerfix: 'BlockCodeDemo',
    fileDemoTag: 'demo:vue',
    blockDemoTag: 'demo:vue',
    markdown: {
      options: {
        html: false
      },
      notWrapper: false
    },
    ...getOptions(this)
  }

  // 获取代码块demo
  const blockDemoResult = getBlocCodekDemo(source, options)

  source = blockDemoResult.source

  // 所有code占位
  const replaceResult = replaceCodes(source)
  source = replaceResult.source

  const fileResult = fileAnalysis.apply(this, [source, options])
  const imports = fileResult.imports
  const components = fileResult.components
  source = fileResult.source

  const demoScriptResult = getDemoScript(source)
  const demoMixinName = demoScriptResult.demoMixinName
  source = demoScriptResult.source

  const demoStyleResult = getDemoStyle(source)
  source = demoStyleResult.source

  // 恢复code
  source = revertCodes(source, replaceResult.codeDict)
  source = renderMarkdown(source, options.markdown.options, options.markdown.notWrapper)

  for (let i = 0; i < fileResult.dependencies.length; i++) {
    const item = fileResult.dependencies[i]

    this.addDependency(item.filepath) // 添加到依赖

    // 替换demo占位为组件代码
    source = source.replace(new RegExp(item.placeholder.replace(/\$/g, '\\$'), 'g'), item.demoBlockHtml)
  }

  const blockCodeDemos = []
  for (let i = 0; i < blockDemoResult.blocks.length; i++) {
    const item = blockDemoResult.blocks[i]
    // 替换demo占位为组件代码
    source = source.replace(new RegExp(item.placeholder.replace(/\$/g, '\\$'), 'g'), item.html)
    blockCodeDemos.push(`const ${item.componentName} = ${item.js}\n${item.componentName}.template = ${item.template};`)
    components.push(item.componentName)
  }

  const mixins = [
    demoScriptResult.demoScript ? demoMixinName : ''
  ].filter(e => !!e)

  const component = `
    <template>\n<div class="v-docs">\n${source}\n</div>\n</template>
    <script>
      /** eslint-disable **/
      ${imports.join('\n')}\n
      ${blockCodeDemos.join('\n')}
      ${demoScriptResult.demoScript}
      export default {
        components: {
          ${components.join(',\n')}
        },
        mixins: [
          ${mixins.join(',\n')}
        ]
      }
    </script>
    ${demoStyleResult.demoStyle}`.trim()

  // console.log(component)
  // writeFileSync('./result.md', component)
  callback(null, component)

  return undefined
}
