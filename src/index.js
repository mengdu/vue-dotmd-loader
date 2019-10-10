// import { getOptions } from 'loader-utils'
import crypto from 'crypto'

function getDependencies (code) {
  const imports = code.match(/<!-- +\[demo\]:.+ +-->/g)
  if (!imports) return []

  return imports.map(e => {
    const data = e.match(/:(.+) +-->/)
    const file = data[1].split('?')

    return {
      raw: e,
      file: file[0],
      params: file[1]
    }
  })
}

function md5 (str) {
  const hash = crypto.createHash('md5')
  hash.update(str)
  return hash.digest('hex')
}

export default function loader (source) {
  // const options = getOptions(this)
  // console.log(1, options, source)
  const dependencies = getDependencies(source)
  const imports = []
  const components = []
  for (let i = 0; i < dependencies.length; i++) {
    const item = dependencies[i]
    const componentName = `VueDemo${md5(item.raw).slice(0, 11)}`

    components.push(componentName)
    imports.push(`import ${componentName} from '${item.file}'`)
    console.log(1, item.raw)
    source = source.replace(item.raw, `<${componentName} />`)
  }

  const template = source

  console.log(template)

  return `<template><div class="v-demo">${template}</div></template>
    <script>
      /* eslint-disable */
      ${imports.join('\n')}
      export default {
        components: { ${components.join(', ')} }
      }
    </script>\n\n`
}
