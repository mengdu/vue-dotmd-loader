/* eslint-disable */
/*!
 * Build version v0.1.0
 * Create by lanyueos@qq.com
 * Created at Fri Apr 12 2019 16:49:10 GMT+0800 (中国标准时间)
 */
'use strict';

var loaderUtils = require('loader-utils');

function loader(source) {
  var options = loaderUtils.getOptions(this);
  source = source.replace(/\[name\]/g, options.name);
  return "export default ".concat(JSON.stringify(source));
}

module.exports = loader;
