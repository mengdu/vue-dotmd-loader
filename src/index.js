import { getOptions } from 'loader-utils'

export default function loader (source) {
  const options = getOptions(this)
  console.log(options)
  // source = source.replace(/\[msg\]/g, options.msg)

  return source
}
