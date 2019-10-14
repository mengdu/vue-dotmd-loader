// copy form https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/markdown/lib/highlightLines.js
// Modified from https://github.com/egoist/markdown-it-highlight-lines

const RE = /{([\d,-]+)}/
const wrapperRE = /^<pre .*?><code>/

export default (md) => {
  const fence = md.renderer.rules.fence
  md.renderer.rules.fence = (...args) => {
    const [tokens, idx, options] = args
    const token = tokens[idx]

    if (!token.lineNumbers) {
      const rawInfo = token.info
      if (!rawInfo || !RE.test(rawInfo)) {
        return fence(...args)
      }

      const langName = rawInfo.replace(RE, '').trim()
      // ensure the next plugin get the correct lang.
      token.info = langName

      token.lineNumbers = RE.exec(rawInfo)[1]
        .split(',')
        .map(v => v.split('-').map(v => parseInt(v, 10)))
    }

    const code = options.highlight
      ? options.highlight(token.content, token.info)
      : token.content

    const rawCode = code.replace(wrapperRE, '')
    // <code></code> 内容已经转义，故 \\n 为换行符
    const highlightLinesCode = rawCode.split('\\n').map((split, index) => {
      const lineNumber = index + 1
      const inRange = token.lineNumbers.some(([start, end]) => {
        if (start && end) {
          return lineNumber >= start && lineNumber <= end
        }
        return lineNumber === start
      })
      if (inRange) {
        return `<div class="highlighted">&nbsp;</div>`
      }
      return '<br>'
    }).join('')

    const highlightLinesWrapperCode = `<div class="highlight-lines">${highlightLinesCode}</div>`

    return `<div class="code-block">${highlightLinesWrapperCode + code}</div>`
  }
}
