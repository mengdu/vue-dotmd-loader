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
  '"': '&quot;'
}

function escapeHtml (str) {
  if (/[&<>"]/.test(str)) {
    return str.replace(/[&<>"]/g, (ch) => HTML_REPLACEMENTS[ch])
  }
  return str
}

function htmlEntity2String (html) {
  const ch = {
    '\'': '\\\'',
    '"': '\\"'
  }

  return html.replace(/['"]/g, e => {
    return ch[e]
  })
}

function highlight (code, lang) {
  let html = ''
  if (lang && hljs.getLanguage(lang)) {
    try {
      html = hljs.highlight(lang, code).value
    } catch (err) {
      html = code
    }
  } else {
    html = code
  }

  // `` 包裹字符串还是存在一些问题，比如出现 ${}
  // return `<pre class="language language-${lang}" data-lang="${lang}"><code v-html="\`${escapeHtml(html)}\`"></code></pre>`

  html = JSON.stringify(escapeHtml(html)) // 转成html实体后再转换到一行
    .replace(/^"|"$/g, '') // 去掉json两边双引号
  html = htmlEntity2String(html) // 转成v-html支持的字符串

  // v-html="\'test\'"
  return `<pre class="language${lang ? ' language-' + lang : ''}" data-lang="${lang}"><code v-html="'${html}'"></code></pre>`
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
    let [filename, query] = url.split('?')
    filename = filename.trim()
      .replace(/^"|"$/g, '')
      .replace(/^'|'$/g, '')
      .trim()

    const filepath = path.resolve(this.context, filename)

    const stats = this.fs.statSync(filepath)

    if (stats.isDirectory()) {
      throw new Error(`Could't read the demo file on "${filepath}".\nTo read the source code, must be use the full filename`)
    }

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
      title: (title || '').replace(/"/, '')
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
    let lang = path.extname(item.filename).replace(/^\./, '')
    lang = lang === 'vue' ? 'html' : (lang || 'html')

    const codeHtml = renderMarkdown(`\n\`\`\`${lang}${lines ? ` {${lines}}` : ''}\n${item.raw}\n\`\`\`\n`, { ...options.markdown.options, html: true }, true)

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
    // 使用回调函数是为了防止子模式引用，防止dict[key]里存在$\' 这种字符串，会替换错误
    source = source.replace(key, () => {
      return dict[key]
    })
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
  const demoStyleReg = /<style +data-demo="vue"(.*)>([\s\S]+?)<\/style>/
  const matchResult = source.match(demoStyleReg)
  let cssText = ''
  let attrs = ''

  if (matchResult) {
    source = source.replace(demoStyleReg, '') // 去掉demo样式

    if (matchResult[1]) {
      attrs = matchResult[1]
    }

    if (matchResult[2]) {
      cssText = matchResult[2]
    }
  }

  return {
    cssText: cssText,
    styleTagAttrs: attrs,
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
    dest: false, // 输出结果文件 bool 或者 function
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

  const cssTexts = []
  const fileResult = fileAnalysis.apply(this, [source, options])
  const imports = fileResult.imports
  const components = fileResult.components
  source = fileResult.source

  const demoScriptResult = getDemoScript(source)
  const demoMixinName = demoScriptResult.demoMixinName
  source = demoScriptResult.source

  const demoStyleResult = getDemoStyle(source)
  source = demoStyleResult.source

  if (demoStyleResult.cssText) {
    cssTexts.push(demoStyleResult.cssText)
  }

  // 恢复code
  source = revertCodes(source, replaceResult.codeDict)
  source = renderMarkdown(source, options.markdown.options, options.markdown.notWrapper)

  for (let i = 0; i < fileResult.dependencies.length; i++) {
    const item = fileResult.dependencies[i]

    this.addDependency(item.filepath) // 添加到依赖

    // 替换demo占位为组件代码
    source = source.replace(new RegExp(item.placeholder.replace(/\$/g, '\\$'), 'g'), () => item.demoBlockHtml)
  }

  const blockCodeDemos = []
  for (let i = 0; i < blockDemoResult.blocks.length; i++) {
    const item = blockDemoResult.blocks[i]
    // 替换demo占位为组件代码
    source = source.replace(new RegExp(item.placeholder.replace(/\$/g, '\\$'), 'g'), () => item.html)
    blockCodeDemos.push(`const ${item.componentName} = ${item.js}\n${item.componentName}.template = ${item.template};`)
    components.push(item.componentName)

    if (item.cssText) {
      cssTexts.push(item.cssText)
    }
  }

  const mixins = [
    demoScriptResult.demoScript ? demoMixinName : ''
  ].filter(e => !!e)
  const style = cssTexts.length > 0 ? `<style ${demoStyleResult.styleTagAttrs}>${cssTexts.join('\n')}</style>\n` : ''

  const component = `
    <template>\n<!-- eslint-disable -->\n<div class="v-docs">\n${source}\n</div>\n</template>\n
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
    </script>\n
    ${style}`.trim() + '\n'

  // 写到文件
  if (options.dest) {
    if (typeof options.dest === 'function') {
      options.dest(component, this.context, this.resourcePath)
    } else {
      const filename = path.resolve(this.context, path.basename(this.resourcePath).split('.')[0] + '-md.vue')
      writeFileSync(filename, component, 'utf8')
    }
  }

  callback(null, component)

  return undefined
}
