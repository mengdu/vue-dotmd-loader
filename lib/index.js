/* eslint-disable */
/*!
 * Build version v0.1.0
 * Create by lanyueos@qq.com
 * Created at Tue Oct 15 2019 12:28:38 GMT+0800 (GMT+08:00)
 */
'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var loaderUtils = require('loader-utils');
var crypto = _interopDefault(require('crypto'));
var path = _interopDefault(require('path'));
var MarkdownIt = _interopDefault(require('markdown-it'));
var hljs = _interopDefault(require('highlight.js'));
var querystring = _interopDefault(require('querystring'));
var taskListPlugin = _interopDefault(require('markdown-it-task-lists'));
var fs = require('fs');

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(source, true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(source).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) {
    return;
  }

  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

// copy form https://github.com/vuejs/vuepress/blob/master/packages/%40vuepress/markdown/lib/highlightLines.js
// Modified from https://github.com/egoist/markdown-it-highlight-lines
var RE = /{([\d,-]+)}/;
var wrapperRE = /^<pre .*?><code>/;
var highlightLinesPlugin = (function (md) {
  var fence = md.renderer.rules.fence;

  md.renderer.rules.fence = function () {
    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var tokens = args[0],
        idx = args[1],
        options = args[2];
    var token = tokens[idx];

    if (!token.lineNumbers) {
      var rawInfo = token.info;

      if (!rawInfo || !RE.test(rawInfo)) {
        return fence.apply(void 0, args);
      }

      var langName = rawInfo.replace(RE, '').trim(); // ensure the next plugin get the correct lang.

      token.info = langName;
      token.lineNumbers = RE.exec(rawInfo)[1].split(',').map(function (v) {
        return v.split('-').map(function (v) {
          return parseInt(v, 10);
        });
      });
    }

    var code = options.highlight ? options.highlight(token.content, token.info) : token.content;
    var rawCode = code.replace(wrapperRE, ''); // <code></code> 内容已经转义，故 \\n 为换行符

    var highlightLinesCode = rawCode.split('\\n').map(function (split, index) {
      var lineNumber = index + 1;
      var inRange = token.lineNumbers.some(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            start = _ref2[0],
            end = _ref2[1];

        if (start && end) {
          return lineNumber >= start && lineNumber <= end;
        }

        return lineNumber === start;
      });

      if (inRange) {
        return "<div class=\"highlighted\">&nbsp;</div>";
      }

      return '<br>';
    }).join('');
    var highlightLinesWrapperCode = "<div class=\"highlight-lines\">".concat(highlightLinesCode, "</div>");
    return "<div class=\"code-block\">".concat(highlightLinesWrapperCode + code, "</div>");
  };
});

function md5(str) {
  var hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

var HTML_REPLACEMENTS = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;'
};

function escapeHtml(str) {
  if (/[&<>"]/.test(str)) {
    return str.replace(/[&<>"]/g, function (ch) {
      return HTML_REPLACEMENTS[ch];
    });
  }

  return str;
}

function htmlEntity2String(html) {
  var ch = {
    '\'': '\\\'',
    '"': '\\"'
  };
  return html.replace(/['"]/g, function (e) {
    return ch[e];
  });
}

function highlight(code, lang) {
  var html = '';

  if (lang && hljs.getLanguage(lang)) {
    try {
      html = hljs.highlight(lang, code).value;
    } catch (err) {}
  } // `` 包裹字符串还是存在一些问题，比如出现 ${}
  // return `<pre class="language language-${lang}" data-lang="${lang}"><code v-html="\`${escapeHtml(html)}\`"></code></pre>`


  html = JSON.stringify(escapeHtml(html)) // 转成html实体后再转换到一行
  .replace(/^"|"$/g, ''); // 去掉json两边双引号

  html = htmlEntity2String(html); // 转成v-html支持的字符串
  // v-html="\'test\'"

  return "<pre class=\"language language-".concat(lang, "\" data-lang=\"").concat(lang, "\"><code v-html=\"'").concat(html, "'\"></code></pre>");
}

function renderMarkdown(text, options, notWrapper) {
  var md = new MarkdownIt(_objectSpread2({
    highlight: highlight
  }, options));
  md.use(highlightLinesPlugin);
  md.use(taskListPlugin); // 用于注册插件

  if (typeof options.init === 'function') {
    options.init(md);
  }

  return notWrapper ? md.render(text) : "<div class=\"markdown-body\">".concat(md.render(text), "</div>");
}

function getDependencies(code, options) {
  var _this = this;

  var imports = code.replace(/<!--.*?-->/g, '') // 去掉注释
  .match(new RegExp("\\[".concat(options.fileDemoTag, "\\]\\(.+?\\)"), 'ig')); // [Demo:file](../demos/xxx.vue "title")

  if (!imports) return [];
  return imports.map(function (e) {
    var data = e.match(/\((.+)\)/); // ../demos/xxx.vue "title"

    var _data$1$split = data[1].split(/ +"/),
        _data$1$split2 = _slicedToArray(_data$1$split, 2),
        url = _data$1$split2[0],
        title = _data$1$split2[1]; // 空格分隔


    var _url$split = url.split('?'),
        _url$split2 = _slicedToArray(_url$split, 2),
        filename = _url$split2[0],
        query = _url$split2[1];

    var filepath = path.resolve(_this.context, filename);

    var raw = _this.fs.readFileSync(filepath, 'utf8').toString().trim();

    var params = null;

    if (query) {
      try {
        params = JSON.parse(query);
      } catch (err) {
        params = querystring.parse(query);
      }
    }

    return {
      identity: e,
      raw: raw,
      filename: filename,
      filepath: filepath,
      params: params,
      // 传递到 demo-block 组件的参数
      query: query,
      title: (title || '').replace(/"/, '')
    };
  });
}

function createDemoHtml(wrapperName, componentName, codeHTML, props) {
  var data = props.data ? escapeHtml(JSON.stringify(props.data)) : '{}';
  var params = props.params ? escapeHtml(JSON.stringify(props.params)) : '{}';
  return "<".concat(wrapperName, " :data=\"").concat(data, "\" :params=\"").concat(params, "\">\n    <template v-slot:code>\n    ").concat(codeHTML, "\n    </template>\n    <").concat(componentName, " />\n    </").concat(wrapperName, ">");
}

function fileAnalysis(source, options) {
  var dependencies = getDependencies.apply(this, [source, options]);
  var imports = [];
  var components = [];
  var newDependencies = [];

  for (var i = 0; i < dependencies.length; i++) {
    var item = dependencies[i];
    var componentName = "".concat(options.fileDemoNamePerfix).concat(md5(item.identity).slice(0, 11));
    item.placeholder = "$".concat(componentName, "$"); // demo占位

    source = source.replace(item.identity, item.placeholder); // 避免同组件重复

    if (components.indexOf(componentName) !== -1) {
      continue;
    }

    components.push(componentName);
    imports.push("import ".concat(componentName, " from '").concat(item.filename, "'"));
    var lines = item.params && item.params.lines ? item.params.lines : '';
    var codeHtml = renderMarkdown("\n```html".concat(lines ? " {".concat(lines, "}") : '', "\n").concat(item.raw, "\n```\n"), _objectSpread2({}, options.markdown.options, {
      html: true
    }), true);
    var componentHtml = '';

    if (options.wrapperName) {
      var props = {
        data: {
          raw: item.raw,
          filename: item.filename,
          title: item.title
        },
        params: item.params || null
      };
      componentHtml = createDemoHtml(options.wrapperName, componentName, codeHtml, props);
    } else {
      componentHtml = "<".concat(componentName, " />");
    }

    item.componentName = componentName;
    item.demoBlockHtml = componentHtml;
    newDependencies.push(item);
  }

  return {
    imports: imports,
    components: components,
    source: source,
    dependencies: newDependencies
  };
}

function replaceCodes(source) {
  var codeDict = {};
  source = source.replace(/```[\s\S]+?```/g, function (e) {
    var identity = md5(e);
    var placeholder = "<!--".concat(identity, "-->");
    codeDict[placeholder] = e;
    return placeholder;
  });
  return {
    source: source,
    codeDict: codeDict
  };
}

function revertCodes(source, dict) {
  var _loop = function _loop(key) {
    // 使用回调函数是为了防止子模式引用，防止dict[key]里存在$\' 这种字符串，会替换错误
    source = source.replace(key, function () {
      return dict[key];
    });
  };

  for (var key in dict) {
    _loop(key);
  }

  return source;
}

function getDemoScript(source) {
  var demoScriptReg = /<script +data-demo="vue".*>([\s\S]+?)<\/script>/;
  var matchResult = source.match(demoScriptReg);
  var demoScript = '';
  var demoMixinName = 'DemoScript' + Math.random().toString().substring(2, 10); // 如果存在脚本则提取脚本

  if (matchResult && matchResult[1]) {
    source = source.replace(demoScriptReg, ''); // 去掉demo脚本

    demoScript = matchResult[1].replace(/export default/, "const ".concat(demoMixinName, " =")); // 转成mixin变量
  }

  return {
    demoScript: demoScript,
    demoMixinName: demoMixinName,
    source: source
  };
}

function getDemoStyle(source) {
  var demoStyleReg = /<style +data-demo="vue"(.*)>([\s\S]+?)<\/style>/;
  var matchResult = source.match(demoStyleReg);
  var cssText = '';
  var attrs = '';

  if (matchResult) {
    source = source.replace(demoStyleReg, ''); // 去掉demo样式

    if (matchResult[1]) {
      attrs = matchResult[1];
    }

    if (matchResult[2]) {
      cssText = matchResult[2];
    }
  }

  return {
    cssText: cssText,
    styleTagAttrs: attrs,
    source: source
  };
}

function getBlocCodekDemo(source, options) {
  var blockDict = {};
  var blocks = [];
  var reg = new RegExp("````(html|vue)\\s+".concat(options.blockDemoTag, ".*\\s+([\\s\\S]+?)````"), 'ig');
  source = source.replace(reg, function (md, type, code) {
    var styleResult = code.match(/<style\s*>([\s\S]+?)<\/style>/);
    var scriptResult = code.match(/<script\s*>([\s\S]+?)<\/script>/);
    var templateResult = code.match(/<template\s*>([\s\S]+?)<\/template>/); // 原样返回

    if (!templateResult) return md;
    var componentName = "".concat(options.blockDemoNamePerfix).concat(md5(md).slice(0, 11));

    if (blockDict[componentName]) {
      return blockDict[componentName];
    }

    var js = '';

    if (scriptResult && scriptResult[1]) {
      // export default {} => return {}
      js = scriptResult[1].replace(/export default/, 'return');
    }

    code = code.trim(); // 去掉多余换行

    var placeholder = "$".concat(componentName, "$");
    blockDict[componentName] = placeholder;
    var codeHTML = renderMarkdown("\n```html\n".concat(code, "\n```\n"), _objectSpread2({}, options.markdown.options), true);
    var data = {
      placeholder: placeholder,
      componentName: componentName,
      md: md,
      raw: code,
      cssText: styleResult && styleResult[1] ? styleResult[1] : '',
      js: scriptResult && scriptResult[1] ? "(() => {\n".concat(js, "\n})();") : '(() => ({}))();',
      template: JSON.stringify("<div>".concat(templateResult[1], "</div>")),
      html: createDemoHtml(options.wrapperName, componentName, codeHTML, {
        data: {
          raw: code
        },
        params: {}
      })
    };
    blocks.push(data);
    return placeholder;
  });
  return {
    source: source,
    blocks: blocks
  };
}

function loader(source) {
  var _this2 = this;

  var callback = this.async(); // loader 异步返回

  var options = _objectSpread2({
    wrapperName: 'DemoBlock',
    // 定义 demo 包裹组件（请全局注册好组件），如果空则仅渲染 demo
    fileDemoNamePerfix: 'FileDemo',
    // demo组件名前缀
    blockDemoNamePerfix: 'BlockCodeDemo',
    fileDemoTag: 'demo:vue',
    blockDemoTag: 'demo:vue',
    dest: false,
    // 输出结果文件 bool 或者 function
    markdown: {
      options: {
        html: false
      },
      notWrapper: false
    }
  }, loaderUtils.getOptions(this)); // 获取代码块demo


  var blockDemoResult = getBlocCodekDemo(source, options);
  source = blockDemoResult.source; // 所有code占位

  var replaceResult = replaceCodes(source);
  source = replaceResult.source;
  var cssTexts = [];
  var fileResult = fileAnalysis.apply(this, [source, options]);
  var imports = fileResult.imports;
  var components = fileResult.components;
  source = fileResult.source;
  var demoScriptResult = getDemoScript(source);
  var demoMixinName = demoScriptResult.demoMixinName;
  source = demoScriptResult.source;
  var demoStyleResult = getDemoStyle(source);
  source = demoStyleResult.source;

  if (demoStyleResult.cssText) {
    cssTexts.push(demoStyleResult.cssText);
  } // 恢复code


  source = revertCodes(source, replaceResult.codeDict);
  source = renderMarkdown(source, options.markdown.options, options.markdown.notWrapper);

  var _loop2 = function _loop2(i) {
    var item = fileResult.dependencies[i];

    _this2.addDependency(item.filepath); // 添加到依赖
    // 替换demo占位为组件代码


    source = source.replace(new RegExp(item.placeholder.replace(/\$/g, '\\$'), 'g'), function () {
      return item.demoBlockHtml;
    });
  };

  for (var i = 0; i < fileResult.dependencies.length; i++) {
    _loop2(i);
  }

  var blockCodeDemos = [];

  var _loop3 = function _loop3(_i) {
    var item = blockDemoResult.blocks[_i]; // 替换demo占位为组件代码

    source = source.replace(new RegExp(item.placeholder.replace(/\$/g, '\\$'), 'g'), function () {
      return item.html;
    });
    blockCodeDemos.push("const ".concat(item.componentName, " = ").concat(item.js, "\n").concat(item.componentName, ".template = ").concat(item.template, ";"));
    components.push(item.componentName);

    if (item.cssText) {
      cssTexts.push(item.cssText);
    }
  };

  for (var _i = 0; _i < blockDemoResult.blocks.length; _i++) {
    _loop3(_i);
  }

  var mixins = [demoScriptResult.demoScript ? demoMixinName : ''].filter(function (e) {
    return !!e;
  });
  var style = cssTexts.length > 0 ? "<style ".concat(demoStyleResult.styleTagAttrs, ">").concat(cssTexts.join('\n'), "</style>\n") : '';
  var component = "\n    <template>\n<!-- eslint-disable -->\n<div class=\"v-docs\">\n".concat(source, "\n</div>\n</template>\n\n    <script>\n      /** eslint-disable **/\n      ").concat(imports.join('\n'), "\n\n      ").concat(blockCodeDemos.join('\n'), "\n      ").concat(demoScriptResult.demoScript, "\n      export default {\n        components: {\n          ").concat(components.join(',\n'), "\n        },\n        mixins: [\n          ").concat(mixins.join(',\n'), "\n        ]\n      }\n    </script>\n\n    ").concat(style).trim() + '\n'; // 写到文件

  if (options.dest) {
    if (typeof options.dest === 'function') {
      options.dest(component, this.context, this.resourcePath);
    } else {
      var filename = path.resolve(this.context, path.basename(this.resourcePath).split('.')[0] + '-md.vue');
      fs.writeFileSync(filename, component, 'utf8');
    }
  }

  callback(null, component);
  return undefined;
}

module.exports = loader;
