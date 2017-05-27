(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
/**
 * Created by pigmanrocker on 5/18/17.
 */
var retext = require('retext');
var sentiment = require('retext-sentiment');

/**
 *
 * @param review string with the review text
 * @param upvotes int number of upvotes
 * @param verified boolean
 * @returns {number} weight of the review
 */
window.calculateWeight = function(review , verified, upvotes){
    var weight = 5;

    if (review.toUpperCase() === review){
        weight -= 2;
    }

    if (review.length < 50){
        weight -= 2;
    } else if (review.length > 50 && review.length < 100){
        weight--;
    } else if (review.length > 150 && review.length < 200){
        weight++;
    } else if (review.length > 200){
        weight += 2;
    }

    if (verified === 'true'){
        weight += 2;
    }

    var biasScore = bias(review);

    if (biasScore >= -1 && biasScore <= 1){
        weight++;
    } else if (biasScore > 3 || biasScore < -3){
        weight--;
    }

    //TODO implement something for the upvotes.

    return weight;
}

/**
 *
 * @param review string with the review
 * @returns {number} bias score from -5 to 5
 */
function bias(review){
    var rawData;

    retext().use(sentiment).use(function () {
        return transformer;
        function transformer(tree) {
            rawData = tree;
        }
    }).processSync(review);

    return rawData.data.polarity;
}

},{"retext":42,"retext-sentiment":40}],4:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module array-iterate
 * @fileoverview `forEach` with the possibility to change the
 *   next position.
 */

'use strict';

/* Dependencies. */
var has = require('has');

/* Expose. */
module.exports = iterate;

/**
 * `Array#forEach()` with the possibility to change
 * the next position.
 *
 * @param {{length: number}} values - Values.
 * @param {arrayIterate~callback} callback - Callback given to `iterate`.
 * @param {*?} [context] - Context object to use when invoking `callback`.
 */
function iterate(values, callback, context) {
  var index = -1;
  var result;

  if (!values) {
    throw new Error('Iterate requires that |this| not be ' + values);
  }

  if (!has(values, 'length')) {
    throw new Error('Iterate requires that |this| has a `length`');
  }

  if (typeof callback !== 'function') {
    throw new Error('`callback` must be a function');
  }

  /* The length might change, so we do not cache it. */
  while (++index < values.length) {
    /* Skip missing values. */
    if (!(index in values)) {
      continue;
    }

    result = callback.call(context, values[index], index, values);

    /*
     * If `callback` returns a `number`, move `index` over to
     * `number`.
     */

    if (typeof result === 'number') {
      /* Make sure that negative numbers do not break the loop. */
      if (result < 0) {
        index = 0;
      }

      index = result - 1;
    }
  }
}

},{"has":9}],5:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module bail
 * @fileoverview Throw a given error.
 */

'use strict';

/* Expose. */
module.exports = bail;

/**
 * Throw a given error.
 *
 * @example
 *   bail();
 *
 * @example
 *   bail(new Error('failure'));
 *   // Error: failure
 *   //     at repl:1:6
 *   //     at REPLServer.defaultEval (repl.js:154:27)
 *   //     ...
 *
 * @param {Error?} [err] - Optional error.
 * @throws {Error} - `err`, when given.
 */
function bail(err) {
  if (err) {
    throw err;
  }
}

},{}],6:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}],7:[function(require,module,exports){
var ERROR_MESSAGE = 'Function.prototype.bind called on incompatible ';
var slice = Array.prototype.slice;
var toStr = Object.prototype.toString;
var funcType = '[object Function]';

module.exports = function bind(that) {
    var target = this;
    if (typeof target !== 'function' || toStr.call(target) !== funcType) {
        throw new TypeError(ERROR_MESSAGE + target);
    }
    var args = slice.call(arguments, 1);

    var bound;
    var binder = function () {
        if (this instanceof bound) {
            var result = target.apply(
                this,
                args.concat(slice.call(arguments))
            );
            if (Object(result) === result) {
                return result;
            }
            return this;
        } else {
            return target.apply(
                that,
                args.concat(slice.call(arguments))
            );
        }
    };

    var boundLength = Math.max(0, target.length - args.length);
    var boundArgs = [];
    for (var i = 0; i < boundLength; i++) {
        boundArgs.push('$' + i);
    }

    bound = Function('binder', 'return function (' + boundArgs.join(',') + '){ return binder.apply(this,arguments); }')(binder);

    if (target.prototype) {
        var Empty = function Empty() {};
        Empty.prototype = target.prototype;
        bound.prototype = new Empty();
        Empty.prototype = null;
    }

    return bound;
};

},{}],8:[function(require,module,exports){
var implementation = require('./implementation');

module.exports = Function.prototype.bind || implementation;

},{"./implementation":7}],9:[function(require,module,exports){
var bind = require('function-bind');

module.exports = bind.call(Function.call, Object.prototype.hasOwnProperty);

},{"function-bind":8}],10:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],11:[function(require,module,exports){
/*!
 * Determine if an object is a Buffer
 *
 * @author   Feross Aboukhadijeh <feross@feross.org> <http://feross.org>
 * @license  MIT
 */

// The _isBuffer check is for Safari 5-7 support, because it's missing
// Object.prototype.constructor. Remove this eventually
module.exports = function (obj) {
  return obj != null && (isBuffer(obj) || isSlowBuffer(obj) || !!obj._isBuffer)
}

function isBuffer (obj) {
  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

// For Node v0.10 support. Remove this eventually.
function isSlowBuffer (obj) {
  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isBuffer(obj.slice(0, 0))
}

},{}],12:[function(require,module,exports){
'use strict';
var toString = Object.prototype.toString;

module.exports = function (x) {
	var prototype;
	return toString.call(x) === '[object Object]' && (prototype = Object.getPrototypeOf(x), prototype === null || prototype === Object.getPrototypeOf({}));
};

},{}],13:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2014 Titus Wormer
 * @license MIT
 * @module nlcst:to-string
 * @fileoverview Stringify NLCST.
 */

'use strict';

/* eslint-env commonjs */

/**
 * Stringify an NLCST node.
 *
 * @param {NLCSTNode|Array.<NLCSTNode>} node - Node to to
 *   stringify.
 * @param {string} separator - Value to separate each item
 *   with.
 * @return {string} - Stringified `node`.
 */
function nlcstToString(node, separator) {
    var sep = separator || '';
    var values;
    var length;
    var children;

    if (!node || (!('length' in node) && !node.type)) {
        throw new Error('Expected node, not `' + node + '`');
    }

    if (typeof node.value === 'string') {
        return node.value;
    }

    children = 'length' in node ? node : node.children;
    length = children.length;

    /*
     * Shortcut: This is pretty common, and a small performance win.
     */

    if (length === 1 && 'value' in children[0]) {
        return children[0].value;
    }

    values = [];

    while (length--) {
        values[length] = nlcstToString(children[length], sep);
    }

    return values.join(sep);
}

/*
 * Expose.
 */

module.exports = nlcstToString;

},{}],14:[function(require,module,exports){
'use strict';
module.exports = require('./lib/index.js');

},{"./lib/index.js":16}],15:[function(require,module,exports){
/* This module is generated by `script/build-expressions.js` */
'use strict';

module.exports = {
  affixSymbol: /^([\)\]\}\u0F3B\u0F3D\u169C\u2046\u207E\u208E\u2309\u230B\u232A\u2769\u276B\u276D\u276F\u2771\u2773\u2775\u27C6\u27E7\u27E9\u27EB\u27ED\u27EF\u2984\u2986\u2988\u298A\u298C\u298E\u2990\u2992\u2994\u2996\u2998\u29D9\u29DB\u29FD\u2E23\u2E25\u2E27\u2E29\u3009\u300B\u300D\u300F\u3011\u3015\u3017\u3019\u301B\u301E\u301F\uFD3E\uFE18\uFE36\uFE38\uFE3A\uFE3C\uFE3E\uFE40\uFE42\uFE44\uFE48\uFE5A\uFE5C\uFE5E\uFF09\uFF3D\uFF5D\uFF60\uFF63]|["'\xBB\u2019\u201D\u203A\u2E03\u2E05\u2E0A\u2E0D\u2E1D\u2E21]|[!\.\?\u2026\u203D])\1*$/,
  newLine: /^[ \t]*((\r?\n|\r)[\t ]*)+$/,
  newLineMulti: /^[ \t]*((\r?\n|\r)[\t ]*){2,}$/,
  terminalMarker: /^((?:[!\.\?\u2026\u203D])+)$/,
  wordSymbolInner: /^((?:[&'\-\.:=\?@\xAD\xB7\u2010\u2011\u2019\u2027])|(?:_)+)$/,
  numerical: /^(?:[0-9\xB2\xB3\xB9\xBC-\xBE\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F\u09E6-\u09EF\u09F4-\u09F9\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0B72-\u0B77\u0BE6-\u0BF2\u0C66-\u0C6F\u0C78-\u0C7E\u0CE6-\u0CEF\u0D66-\u0D75\u0DE6-\u0DEF\u0E50-\u0E59\u0ED0-\u0ED9\u0F20-\u0F33\u1040-\u1049\u1090-\u1099\u1369-\u137C\u16EE-\u16F0\u17E0-\u17E9\u17F0-\u17F9\u1810-\u1819\u1946-\u194F\u19D0-\u19DA\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\u2070\u2074-\u2079\u2080-\u2089\u2150-\u2182\u2185-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2CFD\u3007\u3021-\u3029\u3038-\u303A\u3192-\u3195\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\uA620-\uA629\uA6E6-\uA6EF\uA830-\uA835\uA8D0-\uA8D9\uA900-\uA909\uA9D0-\uA9D9\uA9F0-\uA9F9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19]|\uD800[\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDEE1-\uDEFB\uDF20-\uDF23\uDF41\uDF4A\uDFD1-\uDFD5]|\uD801[\uDCA0-\uDCA9]|\uD802[\uDC58-\uDC5F\uDC79-\uDC7F\uDCA7-\uDCAF\uDCFB-\uDCFF\uDD16-\uDD1B\uDDBC\uDDBD\uDDC0-\uDDCF\uDDD2-\uDDFF\uDE40-\uDE47\uDE7D\uDE7E\uDE9D-\uDE9F\uDEEB-\uDEEF\uDF58-\uDF5F\uDF78-\uDF7F\uDFA9-\uDFAF]|\uD803[\uDCFA-\uDCFF\uDE60-\uDE7E]|\uD804[\uDC52-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9\uDDE1-\uDDF4\uDEF0-\uDEF9]|\uD805[\uDCD0-\uDCD9\uDE50-\uDE59\uDEC0-\uDEC9\uDF30-\uDF3B]|\uD806[\uDCE0-\uDCF2]|\uD809[\uDC00-\uDC6E]|\uD81A[\uDE60-\uDE69\uDF50-\uDF59\uDF5B-\uDF61]|\uD834[\uDF60-\uDF71]|\uD835[\uDFCE-\uDFFF]|\uD83A[\uDCC7-\uDCCF]|\uD83C[\uDD00-\uDD0C])+$/,
  digitStart: /^[0-9]/,
  lowerInitial: /^(?:[a-z\xB5\xDF-\xF6\xF8-\xFF\u0101\u0103\u0105\u0107\u0109\u010B\u010D\u010F\u0111\u0113\u0115\u0117\u0119\u011B\u011D\u011F\u0121\u0123\u0125\u0127\u0129\u012B\u012D\u012F\u0131\u0133\u0135\u0137\u0138\u013A\u013C\u013E\u0140\u0142\u0144\u0146\u0148\u0149\u014B\u014D\u014F\u0151\u0153\u0155\u0157\u0159\u015B\u015D\u015F\u0161\u0163\u0165\u0167\u0169\u016B\u016D\u016F\u0171\u0173\u0175\u0177\u017A\u017C\u017E-\u0180\u0183\u0185\u0188\u018C\u018D\u0192\u0195\u0199-\u019B\u019E\u01A1\u01A3\u01A5\u01A8\u01AA\u01AB\u01AD\u01B0\u01B4\u01B6\u01B9\u01BA\u01BD-\u01BF\u01C6\u01C9\u01CC\u01CE\u01D0\u01D2\u01D4\u01D6\u01D8\u01DA\u01DC\u01DD\u01DF\u01E1\u01E3\u01E5\u01E7\u01E9\u01EB\u01ED\u01EF\u01F0\u01F3\u01F5\u01F9\u01FB\u01FD\u01FF\u0201\u0203\u0205\u0207\u0209\u020B\u020D\u020F\u0211\u0213\u0215\u0217\u0219\u021B\u021D\u021F\u0221\u0223\u0225\u0227\u0229\u022B\u022D\u022F\u0231\u0233-\u0239\u023C\u023F\u0240\u0242\u0247\u0249\u024B\u024D\u024F-\u0293\u0295-\u02AF\u0371\u0373\u0377\u037B-\u037D\u0390\u03AC-\u03CE\u03D0\u03D1\u03D5-\u03D7\u03D9\u03DB\u03DD\u03DF\u03E1\u03E3\u03E5\u03E7\u03E9\u03EB\u03ED\u03EF-\u03F3\u03F5\u03F8\u03FB\u03FC\u0430-\u045F\u0461\u0463\u0465\u0467\u0469\u046B\u046D\u046F\u0471\u0473\u0475\u0477\u0479\u047B\u047D\u047F\u0481\u048B\u048D\u048F\u0491\u0493\u0495\u0497\u0499\u049B\u049D\u049F\u04A1\u04A3\u04A5\u04A7\u04A9\u04AB\u04AD\u04AF\u04B1\u04B3\u04B5\u04B7\u04B9\u04BB\u04BD\u04BF\u04C2\u04C4\u04C6\u04C8\u04CA\u04CC\u04CE\u04CF\u04D1\u04D3\u04D5\u04D7\u04D9\u04DB\u04DD\u04DF\u04E1\u04E3\u04E5\u04E7\u04E9\u04EB\u04ED\u04EF\u04F1\u04F3\u04F5\u04F7\u04F9\u04FB\u04FD\u04FF\u0501\u0503\u0505\u0507\u0509\u050B\u050D\u050F\u0511\u0513\u0515\u0517\u0519\u051B\u051D\u051F\u0521\u0523\u0525\u0527\u0529\u052B\u052D\u052F\u0561-\u0587\u13F8-\u13FD\u1D00-\u1D2B\u1D6B-\u1D77\u1D79-\u1D9A\u1E01\u1E03\u1E05\u1E07\u1E09\u1E0B\u1E0D\u1E0F\u1E11\u1E13\u1E15\u1E17\u1E19\u1E1B\u1E1D\u1E1F\u1E21\u1E23\u1E25\u1E27\u1E29\u1E2B\u1E2D\u1E2F\u1E31\u1E33\u1E35\u1E37\u1E39\u1E3B\u1E3D\u1E3F\u1E41\u1E43\u1E45\u1E47\u1E49\u1E4B\u1E4D\u1E4F\u1E51\u1E53\u1E55\u1E57\u1E59\u1E5B\u1E5D\u1E5F\u1E61\u1E63\u1E65\u1E67\u1E69\u1E6B\u1E6D\u1E6F\u1E71\u1E73\u1E75\u1E77\u1E79\u1E7B\u1E7D\u1E7F\u1E81\u1E83\u1E85\u1E87\u1E89\u1E8B\u1E8D\u1E8F\u1E91\u1E93\u1E95-\u1E9D\u1E9F\u1EA1\u1EA3\u1EA5\u1EA7\u1EA9\u1EAB\u1EAD\u1EAF\u1EB1\u1EB3\u1EB5\u1EB7\u1EB9\u1EBB\u1EBD\u1EBF\u1EC1\u1EC3\u1EC5\u1EC7\u1EC9\u1ECB\u1ECD\u1ECF\u1ED1\u1ED3\u1ED5\u1ED7\u1ED9\u1EDB\u1EDD\u1EDF\u1EE1\u1EE3\u1EE5\u1EE7\u1EE9\u1EEB\u1EED\u1EEF\u1EF1\u1EF3\u1EF5\u1EF7\u1EF9\u1EFB\u1EFD\u1EFF-\u1F07\u1F10-\u1F15\u1F20-\u1F27\u1F30-\u1F37\u1F40-\u1F45\u1F50-\u1F57\u1F60-\u1F67\u1F70-\u1F7D\u1F80-\u1F87\u1F90-\u1F97\u1FA0-\u1FA7\u1FB0-\u1FB4\u1FB6\u1FB7\u1FBE\u1FC2-\u1FC4\u1FC6\u1FC7\u1FD0-\u1FD3\u1FD6\u1FD7\u1FE0-\u1FE7\u1FF2-\u1FF4\u1FF6\u1FF7\u210A\u210E\u210F\u2113\u212F\u2134\u2139\u213C\u213D\u2146-\u2149\u214E\u2184\u2C30-\u2C5E\u2C61\u2C65\u2C66\u2C68\u2C6A\u2C6C\u2C71\u2C73\u2C74\u2C76-\u2C7B\u2C81\u2C83\u2C85\u2C87\u2C89\u2C8B\u2C8D\u2C8F\u2C91\u2C93\u2C95\u2C97\u2C99\u2C9B\u2C9D\u2C9F\u2CA1\u2CA3\u2CA5\u2CA7\u2CA9\u2CAB\u2CAD\u2CAF\u2CB1\u2CB3\u2CB5\u2CB7\u2CB9\u2CBB\u2CBD\u2CBF\u2CC1\u2CC3\u2CC5\u2CC7\u2CC9\u2CCB\u2CCD\u2CCF\u2CD1\u2CD3\u2CD5\u2CD7\u2CD9\u2CDB\u2CDD\u2CDF\u2CE1\u2CE3\u2CE4\u2CEC\u2CEE\u2CF3\u2D00-\u2D25\u2D27\u2D2D\uA641\uA643\uA645\uA647\uA649\uA64B\uA64D\uA64F\uA651\uA653\uA655\uA657\uA659\uA65B\uA65D\uA65F\uA661\uA663\uA665\uA667\uA669\uA66B\uA66D\uA681\uA683\uA685\uA687\uA689\uA68B\uA68D\uA68F\uA691\uA693\uA695\uA697\uA699\uA69B\uA723\uA725\uA727\uA729\uA72B\uA72D\uA72F-\uA731\uA733\uA735\uA737\uA739\uA73B\uA73D\uA73F\uA741\uA743\uA745\uA747\uA749\uA74B\uA74D\uA74F\uA751\uA753\uA755\uA757\uA759\uA75B\uA75D\uA75F\uA761\uA763\uA765\uA767\uA769\uA76B\uA76D\uA76F\uA771-\uA778\uA77A\uA77C\uA77F\uA781\uA783\uA785\uA787\uA78C\uA78E\uA791\uA793-\uA795\uA797\uA799\uA79B\uA79D\uA79F\uA7A1\uA7A3\uA7A5\uA7A7\uA7A9\uA7B5\uA7B7\uA7FA\uAB30-\uAB5A\uAB60-\uAB65\uAB70-\uABBF\uFB00-\uFB06\uFB13-\uFB17\uFF41-\uFF5A]|\uD801[\uDC28-\uDC4F]|\uD803[\uDCC0-\uDCF2]|\uD806[\uDCC0-\uDCDF]|\uD835[\uDC1A-\uDC33\uDC4E-\uDC54\uDC56-\uDC67\uDC82-\uDC9B\uDCB6-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDCCF\uDCEA-\uDD03\uDD1E-\uDD37\uDD52-\uDD6B\uDD86-\uDD9F\uDDBA-\uDDD3\uDDEE-\uDE07\uDE22-\uDE3B\uDE56-\uDE6F\uDE8A-\uDEA5\uDEC2-\uDEDA\uDEDC-\uDEE1\uDEFC-\uDF14\uDF16-\uDF1B\uDF36-\uDF4E\uDF50-\uDF55\uDF70-\uDF88\uDF8A-\uDF8F\uDFAA-\uDFC2\uDFC4-\uDFC9\uDFCB])/,
  surrogates: /[\uD800-\uDFFF]/,
  punctuation: /[!"'-\),-\/:;\?\[-\]_\{\}\xA1\xA7\xAB\xB6\xB7\xBB\xBF\u037E\u0387\u055A-\u055F\u0589\u058A\u05BE\u05C0\u05C3\u05C6\u05F3\u05F4\u0609\u060A\u060C\u060D\u061B\u061E\u061F\u066A-\u066D\u06D4\u0700-\u070D\u07F7-\u07F9\u0830-\u083E\u085E\u0964\u0965\u0970\u0AF0\u0DF4\u0E4F\u0E5A\u0E5B\u0F04-\u0F12\u0F14\u0F3A-\u0F3D\u0F85\u0FD0-\u0FD4\u0FD9\u0FDA\u104A-\u104F\u10FB\u1360-\u1368\u1400\u166D\u166E\u169B\u169C\u16EB-\u16ED\u1735\u1736\u17D4-\u17D6\u17D8-\u17DA\u1800-\u180A\u1944\u1945\u1A1E\u1A1F\u1AA0-\u1AA6\u1AA8-\u1AAD\u1B5A-\u1B60\u1BFC-\u1BFF\u1C3B-\u1C3F\u1C7E\u1C7F\u1CC0-\u1CC7\u1CD3\u2010-\u201F\u2022-\u2027\u2032-\u203A\u203C-\u2043\u2045-\u2051\u2053-\u205E\u207D\u207E\u208D\u208E\u2308-\u230B\u2329\u232A\u2768-\u2775\u27C5\u27C6\u27E6-\u27EF\u2983-\u2998\u29D8-\u29DB\u29FC\u29FD\u2CF9-\u2CFC\u2CFE\u2CFF\u2D70\u2E00-\u2E2E\u2E30-\u2E42\u3001-\u3003\u3008-\u3011\u3014-\u301F\u3030\u303D\u30A0\u30FB\uA4FE\uA4FF\uA60D-\uA60F\uA673\uA67E\uA6F2-\uA6F7\uA874-\uA877\uA8CE\uA8CF\uA8F8-\uA8FA\uA8FC\uA92E\uA92F\uA95F\uA9C1-\uA9CD\uA9DE\uA9DF\uAA5C-\uAA5F\uAADE\uAADF\uAAF0\uAAF1\uABEB\uFD3E\uFD3F\uFE10-\uFE19\uFE30-\uFE52\uFE54-\uFE61\uFE63\uFE68\uFE6A\uFE6B\uFF01-\uFF03\uFF05-\uFF0A\uFF0C-\uFF0F\uFF1A\uFF1B\uFF1F\uFF20\uFF3B-\uFF3D\uFF3F\uFF5B\uFF5D\uFF5F-\uFF65]|\uD800[\uDD00-\uDD02\uDF9F\uDFD0]|\uD801\uDD6F|\uD802[\uDC57\uDD1F\uDD3F\uDE50-\uDE58\uDE7F\uDEF0-\uDEF6\uDF39-\uDF3F\uDF99-\uDF9C]|\uD804[\uDC47-\uDC4D\uDCBB\uDCBC\uDCBE-\uDCC1\uDD40-\uDD43\uDD74\uDD75\uDDC5-\uDDC9\uDDCD\uDDDB\uDDDD-\uDDDF\uDE38-\uDE3D\uDEA9]|\uD805[\uDCC6\uDDC1-\uDDD7\uDE41-\uDE43\uDF3C-\uDF3E]|\uD809[\uDC70-\uDC74]|\uD81A[\uDE6E\uDE6F\uDEF5\uDF37-\uDF3B\uDF44]|\uD82F\uDC9F|\uD836[\uDE87-\uDE8B]/,
  word: /[0-9A-Za-z\xAA\xB2\xB3\xB5\xB9\xBA\xBC-\xBE\xC0-\xD6\xD8-\xF6\xF8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0300-\u0374\u0376\u0377\u037A-\u037D\u037F\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u0483-\u052F\u0531-\u0556\u0559\u0561-\u0587\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7\u05D0-\u05EA\u05F0-\u05F2\u0610-\u061A\u0620-\u0669\u066E-\u06D3\u06D5-\u06DC\u06DF-\u06E8\u06EA-\u06FC\u06FF\u0710-\u074A\u074D-\u07B1\u07C0-\u07F5\u07FA\u0800-\u082D\u0840-\u085B\u08A0-\u08B4\u08E3-\u0963\u0966-\u096F\u0971-\u0983\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BC-\u09C4\u09C7\u09C8\u09CB-\u09CE\u09D7\u09DC\u09DD\u09DF-\u09E3\u09E6-\u09F1\u09F4-\u09F9\u0A01-\u0A03\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A3C\u0A3E-\u0A42\u0A47\u0A48\u0A4B-\u0A4D\u0A51\u0A59-\u0A5C\u0A5E\u0A66-\u0A75\u0A81-\u0A83\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABC-\u0AC5\u0AC7-\u0AC9\u0ACB-\u0ACD\u0AD0\u0AE0-\u0AE3\u0AE6-\u0AEF\u0AF9\u0B01-\u0B03\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3C-\u0B44\u0B47\u0B48\u0B4B-\u0B4D\u0B56\u0B57\u0B5C\u0B5D\u0B5F-\u0B63\u0B66-\u0B6F\u0B71-\u0B77\u0B82\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BBE-\u0BC2\u0BC6-\u0BC8\u0BCA-\u0BCD\u0BD0\u0BD7\u0BE6-\u0BF2\u0C00-\u0C03\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C39\u0C3D-\u0C44\u0C46-\u0C48\u0C4A-\u0C4D\u0C55\u0C56\u0C58-\u0C5A\u0C60-\u0C63\u0C66-\u0C6F\u0C78-\u0C7E\u0C81-\u0C83\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBC-\u0CC4\u0CC6-\u0CC8\u0CCA-\u0CCD\u0CD5\u0CD6\u0CDE\u0CE0-\u0CE3\u0CE6-\u0CEF\u0CF1\u0CF2\u0D01-\u0D03\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D-\u0D44\u0D46-\u0D48\u0D4A-\u0D4E\u0D57\u0D5F-\u0D63\u0D66-\u0D75\u0D7A-\u0D7F\u0D82\u0D83\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0DCA\u0DCF-\u0DD4\u0DD6\u0DD8-\u0DDF\u0DE6-\u0DEF\u0DF2\u0DF3\u0E01-\u0E3A\u0E40-\u0E4E\u0E50-\u0E59\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB9\u0EBB-\u0EBD\u0EC0-\u0EC4\u0EC6\u0EC8-\u0ECD\u0ED0-\u0ED9\u0EDC-\u0EDF\u0F00\u0F18\u0F19\u0F20-\u0F33\u0F35\u0F37\u0F39\u0F3E-\u0F47\u0F49-\u0F6C\u0F71-\u0F84\u0F86-\u0F97\u0F99-\u0FBC\u0FC6\u1000-\u1049\u1050-\u109D\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u135D-\u135F\u1369-\u137C\u1380-\u138F\u13A0-\u13F5\u13F8-\u13FD\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u16EE-\u16F8\u1700-\u170C\u170E-\u1714\u1720-\u1734\u1740-\u1753\u1760-\u176C\u176E-\u1770\u1772\u1773\u1780-\u17D3\u17D7\u17DC\u17DD\u17E0-\u17E9\u17F0-\u17F9\u180B-\u180D\u1810-\u1819\u1820-\u1877\u1880-\u18AA\u18B0-\u18F5\u1900-\u191E\u1920-\u192B\u1930-\u193B\u1946-\u196D\u1970-\u1974\u1980-\u19AB\u19B0-\u19C9\u19D0-\u19DA\u1A00-\u1A1B\u1A20-\u1A5E\u1A60-\u1A7C\u1A7F-\u1A89\u1A90-\u1A99\u1AA7\u1AB0-\u1ABE\u1B00-\u1B4B\u1B50-\u1B59\u1B6B-\u1B73\u1B80-\u1BF3\u1C00-\u1C37\u1C40-\u1C49\u1C4D-\u1C7D\u1CD0-\u1CD2\u1CD4-\u1CF6\u1CF8\u1CF9\u1D00-\u1DF5\u1DFC-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2070\u2071\u2074-\u2079\u207F-\u2089\u2090-\u209C\u20D0-\u20F0\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2150-\u2189\u2460-\u249B\u24EA-\u24FF\u2776-\u2793\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CF3\u2CFD\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D7F-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2DE0-\u2DFF\u2E2F\u3005-\u3007\u3021-\u302F\u3031-\u3035\u3038-\u303C\u3041-\u3096\u3099\u309A\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u3192-\u3195\u31A0-\u31BA\u31F0-\u31FF\u3220-\u3229\u3248-\u324F\u3251-\u325F\u3280-\u3289\u32B1-\u32BF\u3400-\u4DB5\u4E00-\u9FD5\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA62B\uA640-\uA672\uA674-\uA67D\uA67F-\uA6F1\uA717-\uA71F\uA722-\uA788\uA78B-\uA7AD\uA7B0-\uA7B7\uA7F7-\uA827\uA830-\uA835\uA840-\uA873\uA880-\uA8C4\uA8D0-\uA8D9\uA8E0-\uA8F7\uA8FB\uA8FD\uA900-\uA92D\uA930-\uA953\uA960-\uA97C\uA980-\uA9C0\uA9CF-\uA9D9\uA9E0-\uA9FE\uAA00-\uAA36\uAA40-\uAA4D\uAA50-\uAA59\uAA60-\uAA76\uAA7A-\uAAC2\uAADB-\uAADD\uAAE0-\uAAEF\uAAF2-\uAAF6\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uAB30-\uAB5A\uAB5C-\uAB65\uAB70-\uABEA\uABEC\uABED\uABF0-\uABF9\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE00-\uFE0F\uFE20-\uFE2F\uFE70-\uFE74\uFE76-\uFEFC\uFF10-\uFF19\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC]|\uD800[\uDC00-\uDC0B\uDC0D-\uDC26\uDC28-\uDC3A\uDC3C\uDC3D\uDC3F-\uDC4D\uDC50-\uDC5D\uDC80-\uDCFA\uDD07-\uDD33\uDD40-\uDD78\uDD8A\uDD8B\uDDFD\uDE80-\uDE9C\uDEA0-\uDED0\uDEE0-\uDEFB\uDF00-\uDF23\uDF30-\uDF4A\uDF50-\uDF7A\uDF80-\uDF9D\uDFA0-\uDFC3\uDFC8-\uDFCF\uDFD1-\uDFD5]|\uD801[\uDC00-\uDC9D\uDCA0-\uDCA9\uDD00-\uDD27\uDD30-\uDD63\uDE00-\uDF36\uDF40-\uDF55\uDF60-\uDF67]|\uD802[\uDC00-\uDC05\uDC08\uDC0A-\uDC35\uDC37\uDC38\uDC3C\uDC3F-\uDC55\uDC58-\uDC76\uDC79-\uDC9E\uDCA7-\uDCAF\uDCE0-\uDCF2\uDCF4\uDCF5\uDCFB-\uDD1B\uDD20-\uDD39\uDD80-\uDDB7\uDDBC-\uDDCF\uDDD2-\uDE03\uDE05\uDE06\uDE0C-\uDE13\uDE15-\uDE17\uDE19-\uDE33\uDE38-\uDE3A\uDE3F-\uDE47\uDE60-\uDE7E\uDE80-\uDE9F\uDEC0-\uDEC7\uDEC9-\uDEE6\uDEEB-\uDEEF\uDF00-\uDF35\uDF40-\uDF55\uDF58-\uDF72\uDF78-\uDF91\uDFA9-\uDFAF]|\uD803[\uDC00-\uDC48\uDC80-\uDCB2\uDCC0-\uDCF2\uDCFA-\uDCFF\uDE60-\uDE7E]|\uD804[\uDC00-\uDC46\uDC52-\uDC6F\uDC7F-\uDCBA\uDCD0-\uDCE8\uDCF0-\uDCF9\uDD00-\uDD34\uDD36-\uDD3F\uDD50-\uDD73\uDD76\uDD80-\uDDC4\uDDCA-\uDDCC\uDDD0-\uDDDA\uDDDC\uDDE1-\uDDF4\uDE00-\uDE11\uDE13-\uDE37\uDE80-\uDE86\uDE88\uDE8A-\uDE8D\uDE8F-\uDE9D\uDE9F-\uDEA8\uDEB0-\uDEEA\uDEF0-\uDEF9\uDF00-\uDF03\uDF05-\uDF0C\uDF0F\uDF10\uDF13-\uDF28\uDF2A-\uDF30\uDF32\uDF33\uDF35-\uDF39\uDF3C-\uDF44\uDF47\uDF48\uDF4B-\uDF4D\uDF50\uDF57\uDF5D-\uDF63\uDF66-\uDF6C\uDF70-\uDF74]|\uD805[\uDC80-\uDCC5\uDCC7\uDCD0-\uDCD9\uDD80-\uDDB5\uDDB8-\uDDC0\uDDD8-\uDDDD\uDE00-\uDE40\uDE44\uDE50-\uDE59\uDE80-\uDEB7\uDEC0-\uDEC9\uDF00-\uDF19\uDF1D-\uDF2B\uDF30-\uDF3B]|\uD806[\uDCA0-\uDCF2\uDCFF\uDEC0-\uDEF8]|\uD808[\uDC00-\uDF99]|\uD809[\uDC00-\uDC6E\uDC80-\uDD43]|[\uD80C\uD840-\uD868\uD86A-\uD86C\uD86F-\uD872][\uDC00-\uDFFF]|\uD80D[\uDC00-\uDC2E]|\uD811[\uDC00-\uDE46]|\uD81A[\uDC00-\uDE38\uDE40-\uDE5E\uDE60-\uDE69\uDED0-\uDEED\uDEF0-\uDEF4\uDF00-\uDF36\uDF40-\uDF43\uDF50-\uDF59\uDF5B-\uDF61\uDF63-\uDF77\uDF7D-\uDF8F]|\uD81B[\uDF00-\uDF44\uDF50-\uDF7E\uDF8F-\uDF9F]|\uD82C[\uDC00\uDC01]|\uD82F[\uDC00-\uDC6A\uDC70-\uDC7C\uDC80-\uDC88\uDC90-\uDC99\uDC9D\uDC9E]|\uD834[\uDD65-\uDD69\uDD6D-\uDD72\uDD7B-\uDD82\uDD85-\uDD8B\uDDAA-\uDDAD\uDE42-\uDE44\uDF60-\uDF71]|\uD835[\uDC00-\uDC54\uDC56-\uDC9C\uDC9E\uDC9F\uDCA2\uDCA5\uDCA6\uDCA9-\uDCAC\uDCAE-\uDCB9\uDCBB\uDCBD-\uDCC3\uDCC5-\uDD05\uDD07-\uDD0A\uDD0D-\uDD14\uDD16-\uDD1C\uDD1E-\uDD39\uDD3B-\uDD3E\uDD40-\uDD44\uDD46\uDD4A-\uDD50\uDD52-\uDEA5\uDEA8-\uDEC0\uDEC2-\uDEDA\uDEDC-\uDEFA\uDEFC-\uDF14\uDF16-\uDF34\uDF36-\uDF4E\uDF50-\uDF6E\uDF70-\uDF88\uDF8A-\uDFA8\uDFAA-\uDFC2\uDFC4-\uDFCB\uDFCE-\uDFFF]|\uD836[\uDE00-\uDE36\uDE3B-\uDE6C\uDE75\uDE84\uDE9B-\uDE9F\uDEA1-\uDEAF]|\uD83A[\uDC00-\uDCC4\uDCC7-\uDCD6]|\uD83B[\uDE00-\uDE03\uDE05-\uDE1F\uDE21\uDE22\uDE24\uDE27\uDE29-\uDE32\uDE34-\uDE37\uDE39\uDE3B\uDE42\uDE47\uDE49\uDE4B\uDE4D-\uDE4F\uDE51\uDE52\uDE54\uDE57\uDE59\uDE5B\uDE5D\uDE5F\uDE61\uDE62\uDE64\uDE67-\uDE6A\uDE6C-\uDE72\uDE74-\uDE77\uDE79-\uDE7C\uDE7E\uDE80-\uDE89\uDE8B-\uDE9B\uDEA1-\uDEA3\uDEA5-\uDEA9\uDEAB-\uDEBB]|\uD83C[\uDD00-\uDD0C]|\uD869[\uDC00-\uDED6\uDF00-\uDFFF]|\uD86D[\uDC00-\uDF34\uDF40-\uDFFF]|\uD86E[\uDC00-\uDC1D\uDC20-\uDFFF]|\uD873[\uDC00-\uDEA1]|\uD87E[\uDC00-\uDE1D]|\uDB40[\uDD00-\uDDEF]/,
  whiteSpace: /[\t-\r \x85\xA0\u1680\u2000-\u200A\u2028\u2029\u202F\u205F\u3000]/
};

},{}],16:[function(require,module,exports){
'use strict';

/* Dependencies. */
var createParser = require('./parser');
var expressions = require('./expressions');

/* Expose. */
module.exports = ParseLatin;

/* == PARSE LATIN ================================================== */

/* Transform Latin-script natural language into
 * an NLCST-tree. */
function ParseLatin(doc, file) {
  var value = file || doc;

  if (!(this instanceof ParseLatin)) {
    return new ParseLatin(doc, file);
  }

  this.doc = value ? String(value) : null;
}

/* Quick access to the prototype. */
var proto = ParseLatin.prototype;

/* Default position. */
proto.position = true;

/* Create text nodes. */
proto.tokenizeSymbol = createTextFactory('Symbol');
proto.tokenizeWhiteSpace = createTextFactory('WhiteSpace');
proto.tokenizePunctuation = createTextFactory('Punctuation');
proto.tokenizeSource = createTextFactory('Source');
proto.tokenizeText = createTextFactory('Text');

/* Expose `run`. */
proto.run = run;

/* Inject `plugins` to modifiy the result of the method
 * at `key` on the operated on context. */
proto.use = useFactory(function (context, key, plugins) {
  context[key] = context[key].concat(plugins);
});

/* Inject `plugins` to modifiy the result of the method
 * at `key` on the operated on context, before any other. */
proto.useFirst = useFactory(function (context, key, plugins) {
  context[key] = plugins.concat(context[key]);
});

/* Easy access to the document parser. This additionally
 * supports retext-style invocation: where an instance is
 * created for each file, and the file is given on
 * construction. */
proto.parse = function (value) {
  return this.tokenizeRoot(value || this.doc);
};

/* Transform a `value` into a list of `NLCSTNode`s. */
proto.tokenize = function (value) {
  return tokenize(this, value);
};

/* == PARENT NODES =================================================
 *
 * All these nodes are `pluggable`: they come with a
 * `use` method which accepts a plugin
 * (`function(NLCSTNode)`). Every time one of these
 * methods are called, the plugin is invoked with the
 * node, allowing for easy modification.
 *
 * In fact, the internal transformation from `tokenize`
 * (a list of words, white space, punctuation, and
 * symbols) to `tokenizeRoot` (an NLCST tree), is also
 * implemented through this mechanism. */

/* Create a `WordNode` with its children set to a single
 * `TextNode`, its value set to the given `value`. */
pluggable(ParseLatin, 'tokenizeWord', function (value, eat) {
  var add = (eat || noopEat)('');
  var parent = {type: 'WordNode', children: []};

  this.tokenizeText(value, eat, parent);

  return add(parent);
});

/* Create a `SentenceNode` with its children set to
 * `Node`s, their values set to the tokenized given
 * `value`.
 *
 * Unless plugins add new nodes, the sentence is
 * populated by `WordNode`s, `SymbolNode`s,
 * `PunctuationNode`s, and `WhiteSpaceNode`s. */
pluggable(ParseLatin, 'tokenizeSentence', createParser({
  type: 'SentenceNode',
  tokenizer: 'tokenize'
}));

/* Create a `ParagraphNode` with its children set to
 * `Node`s, their values set to the tokenized given
 * `value`.
 *
 * Unless plugins add new nodes, the paragraph is
 * populated by `SentenceNode`s and `WhiteSpaceNode`s. */
pluggable(ParseLatin, 'tokenizeParagraph', createParser({
  type: 'ParagraphNode',
  delimiter: expressions.terminalMarker,
  delimiterType: 'PunctuationNode',
  tokenizer: 'tokenizeSentence'
}));

/* Create a `RootNode` with its children set to `Node`s,
 * their values set to the tokenized given `value`. */
pluggable(ParseLatin, 'tokenizeRoot', createParser({
  type: 'RootNode',
  delimiter: expressions.newLine,
  delimiterType: 'WhiteSpaceNode',
  tokenizer: 'tokenizeParagraph'
}));

/* == PLUGINS ====================================================== */

proto.use('tokenizeSentence', [
  require('./plugin/merge-initial-word-symbol'),
  require('./plugin/merge-final-word-symbol'),
  require('./plugin/merge-inner-word-symbol'),
  require('./plugin/merge-inner-word-slash'),
  require('./plugin/merge-initialisms'),
  require('./plugin/merge-words'),
  require('./plugin/patch-position')
]);

proto.use('tokenizeParagraph', [
  require('./plugin/merge-non-word-sentences'),
  require('./plugin/merge-affix-symbol'),
  require('./plugin/merge-initial-lower-case-letter-sentences'),
  require('./plugin/merge-initial-digit-sentences'),
  require('./plugin/merge-prefix-exceptions'),
  require('./plugin/merge-affix-exceptions'),
  require('./plugin/merge-remaining-full-stops'),
  require('./plugin/make-initial-white-space-siblings'),
  require('./plugin/make-final-white-space-siblings'),
  require('./plugin/break-implicit-sentences'),
  require('./plugin/remove-empty-nodes'),
  require('./plugin/patch-position')
]);

proto.use('tokenizeRoot', [
  require('./plugin/make-initial-white-space-siblings'),
  require('./plugin/make-final-white-space-siblings'),
  require('./plugin/remove-empty-nodes'),
  require('./plugin/patch-position')
]);

/* == TEXT NODES =================================================== */

/* Factory to create a `Text`. */
function createTextFactory(type) {
  type += 'Node';

  return createText;

  /* Construct a `Text` from a bound `type` */
  function createText(value, eat, parent) {
    if (value === null || value === undefined) {
      value = '';
    }

    return (eat || noopEat)(value)({
      type: type,
      value: String(value)
    }, parent);
  }
}

/* Run transform plug-ins for `key` on `nodes`. */
function run(key, nodes) {
  var wareKey = key + 'Plugins';
  var plugins = this[wareKey];
  var index = -1;

  if (plugins) {
    while (plugins[++index]) {
      plugins[index](nodes);
    }
  }

  return nodes;
}

/* Make a method “pluggable”. */
function pluggable(Constructor, key, callback) {
  /* Set a pluggable version of `callback`
   * on `Constructor`. */
  Constructor.prototype[key] = function () {
    return this.run(key, callback.apply(this, arguments));
  };
}

/* Factory to inject `plugins`. Takes `callback` for
 * the actual inserting. */
function useFactory(callback) {
  return use;

  /* Validate if `plugins` can be inserted. Invokes
   * the bound `callback` to do the actual inserting. */
  function use(key, plugins) {
    var self = this;
    var wareKey;

    /* Throw if the method is not pluggable. */
    if (!(key in self)) {
      throw new Error(
        'Illegal Invocation: Unsupported `key` for ' +
        '`use(key, plugins)`. Make sure `key` is a ' +
        'supported function'
      );
    }

    /* Fail silently when no plugins are given. */
    if (!plugins) {
      return;
    }

    wareKey = key + 'Plugins';

    /* Make sure `plugins` is a list. */
    if (typeof plugins === 'function') {
      plugins = [plugins];
    } else {
      plugins = plugins.concat();
    }

    /* Make sure `wareKey` exists. */
    if (!self[wareKey]) {
      self[wareKey] = [];
    }

    /* Invoke callback with the ware key and plugins. */
    callback(self, wareKey, plugins);
  }
}

/* == CLASSIFY ===================================================== */

/* Match a word character. */
var WORD = expressions.word;

/* Match a surrogate character. */
var SURROGATES = expressions.surrogates;

/* Match a punctuation character. */
var PUNCTUATION = expressions.punctuation;

/* Match a white space character. */
var WHITE_SPACE = expressions.whiteSpace;

/* Transform a `value` into a list of `NLCSTNode`s. */
function tokenize(parser, value) {
  var tokens;
  var offset;
  var line;
  var column;
  var index;
  var length;
  var character;
  var queue;
  var prev;
  var left;
  var right;
  var eater;

  if (value === null || value === undefined) {
    value = '';
  } else if (value instanceof String) {
    value = value.toString();
  }

  if (typeof value !== 'string') {
    /* Return the given nodes if this is either an
     * empty array, or an array with a node as a first
     * child. */
    if ('length' in value && (!value[0] || value[0].type)) {
      return value;
    }

    throw new Error(
      'Illegal invocation: \'' + value + '\'' +
      ' is not a valid argument for \'ParseLatin\''
    );
  }

  tokens = [];

  if (!value) {
    return tokens;
  }

  index = 0;
  offset = 0;
  line = 1;
  column = 1;

  /* Eat mechanism to use. */
  eater = parser.position ? eat : noPositionEat;

  length = value.length;
  prev = '';
  queue = '';

  while (index < length) {
    character = value.charAt(index);

    if (WHITE_SPACE.test(character)) {
      right = 'WhiteSpace';
    } else if (PUNCTUATION.test(character)) {
      right = 'Punctuation';
    } else if (WORD.test(character)) {
      right = 'Word';
    } else {
      right = 'Symbol';
    }

    tick();

    prev = character;
    character = '';
    left = right;
    right = null;

    index++;
  }

  tick();

  return tokens;

  /* Check one character. */
  function tick() {
    if (
      left === right &&
      (
        left === 'Word' ||
        left === 'WhiteSpace' ||
        character === prev ||
        SURROGATES.test(character)
      )
    ) {
      queue += character;
    } else {
      /* Flush the previous queue. */
      if (queue) {
        parser['tokenize' + left](queue, eater);
      }

      queue = character;
    }
  }

  /* Remove `subvalue` from `value`.
   * Expects `subvalue` to be at the start from
   * `value`, and applies no validation. */
  function eat(subvalue) {
    var pos = position();

    update(subvalue);

    return apply;

    /* Add the given arguments, add `position` to
     * the returned node, and return the node. */
    function apply() {
      return pos(add.apply(null, arguments));
    }
  }

  /* Remove `subvalue` from `value`. Does not patch
   * positional information. */
  function noPositionEat() {
    return apply;

    /* Add the given arguments and return the node. */
    function apply() {
      return add.apply(null, arguments);
    }
  }

  /* Add mechanism. */
  function add(node, parent) {
    if (parent) {
      parent.children.push(node);
    } else {
      tokens.push(node);
    }

    return node;
  }

  /* Mark position and patch `node.position`. */
  function position() {
    var before = now();

    /* Add the position to a node. */
    function patch(node) {
      node.position = new Position(before);

      return node;
    }

    return patch;
  }

  /* Update line and column based on `value`. */
  function update(subvalue) {
    var subvalueLength = subvalue.length;
    var character = -1;
    var lastIndex = -1;

    offset += subvalueLength;

    while (++character < subvalueLength) {
      if (subvalue.charAt(character) === '\n') {
        lastIndex = character;
        line++;
      }
    }

    if (lastIndex === -1) {
      column += subvalueLength;
    } else {
      column = subvalueLength - lastIndex;
    }
  }

  /* Store position information for a node. */
  function Position(start) {
    this.start = start;
    this.end = now();
  }

  /* Get the current position. */
  function now() {
    return {
      line: line,
      column: column,
      offset: offset
    };
  }
}

/* Add mechanism used when text-tokenisers are called
 * directly outside of the `tokenize` function. */
function noopAdd(node, parent) {
  if (parent) {
    parent.children.push(node);
  }

  return node;
}

/* Eat and add mechanism without adding positional
 * information, used when text-tokenisers are called
 * directly outside of the `tokenize` function. */
function noopEat() {
  return noopAdd;
}

},{"./expressions":15,"./parser":17,"./plugin/break-implicit-sentences":18,"./plugin/make-final-white-space-siblings":19,"./plugin/make-initial-white-space-siblings":20,"./plugin/merge-affix-exceptions":21,"./plugin/merge-affix-symbol":22,"./plugin/merge-final-word-symbol":23,"./plugin/merge-initial-digit-sentences":24,"./plugin/merge-initial-lower-case-letter-sentences":25,"./plugin/merge-initial-word-symbol":26,"./plugin/merge-initialisms":27,"./plugin/merge-inner-word-slash":28,"./plugin/merge-inner-word-symbol":29,"./plugin/merge-non-word-sentences":30,"./plugin/merge-prefix-exceptions":31,"./plugin/merge-remaining-full-stops":32,"./plugin/merge-words":33,"./plugin/patch-position":34,"./plugin/remove-empty-nodes":35}],17:[function(require,module,exports){
'use strict';

/* Dependencies. */
var tokenizer = require('./tokenizer');

/* Expose. */
module.exports = parserFactory;

/* Construct a parser based on `options`. */
function parserFactory(options) {
  var type = options.type;
  var tokenizerProperty = options.tokenizer;
  var delimiter = options.delimiter;
  var tokenize = delimiter && tokenizer(options.delimiterType, delimiter);

  return parser;

  function parser(value) {
    var children = this[tokenizerProperty](value);

    return {
      type: type,
      children: tokenize ? tokenize(children) : children
    };
  }
}

},{"./tokenizer":36}],18:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');
var expressions = require('../expressions');

module.exports = modifyChildren(breakImplicitSentences);

/* Two or more new line characters. */
var MULTI_NEW_LINE = expressions.newLineMulti;

/* Break a sentence if a white space with more
 * than one new-line is found. */
function breakImplicitSentences(child, index, parent) {
  var children;
  var position;
  var length;
  var tail;
  var head;
  var end;
  var insertion;
  var node;

  if (child.type !== 'SentenceNode') {
    return;
  }

  children = child.children;

  /* Ignore first and last child. */
  length = children.length - 1;
  position = 0;

  while (++position < length) {
    node = children[position];

    if (
      node.type !== 'WhiteSpaceNode' ||
      !MULTI_NEW_LINE.test(toString(node))
    ) {
      continue;
    }

    child.children = children.slice(0, position);

    insertion = {
      type: 'SentenceNode',
      children: children.slice(position + 1)
    };

    tail = children[position - 1];
    head = children[position + 1];

    parent.children.splice(index + 1, 0, node, insertion);

    if (child.position && tail.position && head.position) {
      end = child.position.end;

      child.position.end = tail.position.end;

      insertion.position = {
        start: head.position.start,
        end: end
      };
    }

    return index + 1;
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-modify-children":46}],19:[function(require,module,exports){
'use strict';

var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(makeFinalWhiteSpaceSiblings);

/* Move white space ending a paragraph up, so they are
 * the siblings of paragraphs. */
function makeFinalWhiteSpaceSiblings(child, index, parent) {
  var children = child.children;
  var prev;

  if (
    children &&
    children.length !== 0 &&
    children[children.length - 1].type === 'WhiteSpaceNode'
  ) {
    parent.children.splice(index + 1, 0, child.children.pop());
    prev = children[children.length - 1];

    if (prev && prev.position && child.position) {
      child.position.end = prev.position.end;
    }

    /* Next, iterate over the current node again. */
    return index;
  }
}

},{"unist-util-modify-children":46}],20:[function(require,module,exports){
'use strict';

var visitChildren = require('unist-util-visit-children');

module.exports = visitChildren(makeInitialWhiteSpaceSiblings);

/* Move white space starting a sentence up, so they are
 * the siblings of sentences. */
function makeInitialWhiteSpaceSiblings(child, index, parent) {
  var children = child.children;
  var next;

  if (children && children.length !== 0 && children[0].type === 'WhiteSpaceNode') {
    parent.children.splice(index, 0, children.shift());
    next = children[0];

    if (next && next.position && child.position) {
      child.position.start = next.position.start;
    }
  }
}

},{"unist-util-visit-children":48}],21:[function(require,module,exports){
'use strict';

/* Dependencies. */
var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');

/* Expose. */
module.exports = modifyChildren(mergeAffixExceptions);

/* Merge a sentence into its previous sentence, when
 * the sentence starts with a comma. */
function mergeAffixExceptions(child, index, parent) {
  var children = child.children;
  var node;
  var position;
  var value;
  var previousChild;

  if (!children || children.length === 0 || index === 0) {
    return;
  }

  position = -1;

  while (children[++position]) {
    node = children[position];

    if (node.type === 'WordNode') {
      return;
    }

    if (node.type === 'SymbolNode' || node.type === 'PunctuationNode') {
      value = toString(node);

      if (value !== ',' && value !== ';') {
        return;
      }

      previousChild = parent.children[index - 1];

      previousChild.children = previousChild.children.concat(children);

      /* Update position. */
      if (previousChild.position && child.position) {
        previousChild.position.end = child.position.end;
      }

      parent.children.splice(index, 1);

      /* Next, iterate over the node *now* at the current
       * position. */
      return index;
    }
  }
}

},{"nlcst-to-string":13,"unist-util-modify-children":46}],22:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');
var expressions = require('../expressions');

module.exports = modifyChildren(mergeAffixSymbol);

/* Closing or final punctuation, or terminal markers
 * that should still be included in the previous
 * sentence, even though they follow the sentence's
 * terminal marker. */
var AFFIX_SYMBOL = expressions.affixSymbol;

/* Move certain punctuation following a terminal
 * marker (thus in the next sentence) to the
 * previous sentence. */
function mergeAffixSymbol(child, index, parent) {
  var children = child.children;
  var first;
  var second;
  var prev;

  if (children && children.length !== 0 && index !== 0) {
    first = children[0];
    second = children[1];
    prev = parent.children[index - 1];

    if (
      (first.type === 'SymbolNode' || first.type === 'PunctuationNode') &&
      AFFIX_SYMBOL.test(toString(first))
    ) {
      prev.children.push(children.shift());

      /* Update position. */
      if (first.position && prev.position) {
        prev.position.end = first.position.end;
      }

      if (second && second.position && child.position) {
        child.position.start = second.position.start;
      }

      /* Next, iterate over the previous node again. */
      return index - 1;
    }
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-modify-children":46}],23:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(mergeFinalWordSymbol);

/* Merge certain punctuation marks into their
 * preceding words. */
function mergeFinalWordSymbol(child, index, parent) {
  var children;
  var prev;
  var next;

  if (
    index !== 0 &&
    (child.type === 'SymbolNode' || child.type === 'PunctuationNode') &&
    toString(child) === '-'
  ) {
    children = parent.children;

    prev = children[index - 1];
    next = children[index + 1];

    if (
      (!next || next.type !== 'WordNode') &&
      (prev && prev.type === 'WordNode')
    ) {
      /* Remove `child` from parent. */
      children.splice(index, 1);

      /* Add the punctuation mark at the end of the
       * previous node. */
      prev.children.push(child);

      /* Update position. */
      if (prev.position && child.position) {
        prev.position.end = child.position.end;
      }

      /* Next, iterate over the node *now* at the
       * current position (which was the next node). */
      return index;
    }
  }
}

},{"nlcst-to-string":13,"unist-util-modify-children":46}],24:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');
var expressions = require('../expressions');

module.exports = modifyChildren(mergeInitialDigitSentences);

/* Initial lowercase letter. */
var DIGIT = expressions.digitStart;

/* Merge a sentence into its previous sentence, when
 * the sentence starts with a lower case letter. */
function mergeInitialDigitSentences(child, index, parent) {
  var children = child.children;
  var siblings = parent.children;
  var prev = siblings[index - 1];
  var head = children[0];

  if (prev && head && head.type === 'WordNode' && DIGIT.test(toString(head))) {
    prev.children = prev.children.concat(children);
    siblings.splice(index, 1);

    /* Update position. */
    if (prev.position && child.position) {
      prev.position.end = child.position.end;
    }

    /* Next, iterate over the node *now* at
     * the current position. */
    return index;
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-modify-children":46}],25:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');
var expressions = require('../expressions');

module.exports = modifyChildren(mergeInitialLowerCaseLetterSentences);

/* Initial lowercase letter. */
var LOWER_INITIAL = expressions.lowerInitial;

/* Merge a sentence into its previous sentence, when
 * the sentence starts with a lower case letter. */
function mergeInitialLowerCaseLetterSentences(child, index, parent) {
  var children = child.children;
  var position;
  var node;
  var siblings;
  var prev;

  if (children && children.length !== 0 && index !== 0) {
    position = -1;

    while (children[++position]) {
      node = children[position];

      if (node.type === 'WordNode') {
        if (!LOWER_INITIAL.test(toString(node))) {
          return;
        }

        siblings = parent.children;

        prev = siblings[index - 1];

        prev.children = prev.children.concat(children);

        siblings.splice(index, 1);

        /* Update position. */
        if (prev.position && child.position) {
          prev.position.end = child.position.end;
        }

        /* Next, iterate over the node *now* at
         * the current position. */
        return index;
      }

      if (node.type === 'SymbolNode' || node.type === 'PunctuationNode') {
        return;
      }
    }
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-modify-children":46}],26:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(mergeInitialWordSymbol);

/* Merge certain punctuation marks into their
 * following words. */
function mergeInitialWordSymbol(child, index, parent) {
  var children;
  var next;

  if (
    (child.type !== 'SymbolNode' && child.type !== 'PunctuationNode') ||
    toString(child) !== '&'
  ) {
    return;
  }

  children = parent.children;

  next = children[index + 1];

  /* If either a previous word, or no following word,
   * exists, exit early. */
  if (
    (index !== 0 && children[index - 1].type === 'WordNode') ||
    !(next && next.type === 'WordNode')
  ) {
    return;
  }

  /* Remove `child` from parent. */
  children.splice(index, 1);

  /* Add the punctuation mark at the start of the
   * next node. */
  next.children.unshift(child);

  /* Update position. */
  if (next.position && child.position) {
    next.position.start = child.position.start;
  }

  /* Next, iterate over the node at the previous
   * position, as it's now adjacent to a following
   * word. */
  return index - 1;
}

},{"nlcst-to-string":13,"unist-util-modify-children":46}],27:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');
var expressions = require('../expressions');

module.exports = modifyChildren(mergeInitialisms);

var NUMERICAL = expressions.numerical;

/* Merge initialisms. */
function mergeInitialisms(child, index, parent) {
  var siblings;
  var prev;
  var children;
  var length;
  var position;
  var otherChild;
  var isAllDigits;
  var value;

  if (index !== 0 && toString(child) === '.') {
    siblings = parent.children;

    prev = siblings[index - 1];
    children = prev.children;

    length = children && children.length;

    if (
      prev.type === 'WordNode' &&
      length !== 1 &&
      length % 2 !== 0
    ) {
      position = length;

      isAllDigits = true;

      while (children[--position]) {
        otherChild = children[position];

        value = toString(otherChild);

        if (position % 2 === 0) {
          /* Initialisms consist of one
           * character values. */
          if (value.length > 1) {
            return;
          }

          if (!NUMERICAL.test(value)) {
            isAllDigits = false;
          }
        } else if (value !== '.') {
          if (position < length - 2) {
            break;
          } else {
            return;
          }
        }
      }

      if (!isAllDigits) {
        /* Remove `child` from parent. */
        siblings.splice(index, 1);

        /* Add child to the previous children. */
        children.push(child);

        /* Update position. */
        if (prev.position && child.position) {
          prev.position.end = child.position.end;
        }

        /* Next, iterate over the node *now* at the current
         * position. */
        return index;
      }
    }
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-modify-children":46}],28:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(mergeInnerWordSlash);

/* Constants. */
var C_SLASH = '/';

/* Merge words joined by certain punctuation marks. */
function mergeInnerWordSlash(child, index, parent) {
  var siblings = parent.children;
  var prev;
  var next;
  var prevValue;
  var nextValue;
  var queue;
  var tail;
  var count;

  prev = siblings[index - 1];
  next = siblings[index + 1];

  if (
    prev &&
    prev.type === 'WordNode' &&
    (child.type === 'SymbolNode' || child.type === 'PunctuationNode') &&
    toString(child) === C_SLASH
  ) {
    prevValue = toString(prev);
    tail = child;
    queue = [child];
    count = 1;

    if (next && next.type === 'WordNode') {
      nextValue = toString(next);
      tail = next;
      queue = queue.concat(next.children);
      count++;
    }

    if (
      prevValue.length < 3 &&
      (!nextValue || nextValue.length < 3)
    ) {
      /* Add all found tokens to `prev`s children. */
      prev.children = prev.children.concat(queue);

      siblings.splice(index, count);

      /* Update position. */
      if (prev.position && tail.position) {
        prev.position.end = tail.position.end;
      }

      /* Next, iterate over the node *now* at the current
       * position. */
      return index;
    }
  }
}

},{"nlcst-to-string":13,"unist-util-modify-children":46}],29:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');
var expressions = require('../expressions');

module.exports = modifyChildren(mergeInnerWordSymbol);

/* Symbols part of surrounding words. */
var INNER_WORD_SYMBOL = expressions.wordSymbolInner;

/* Merge words joined by certain punctuation marks. */
function mergeInnerWordSymbol(child, index, parent) {
  var siblings;
  var sibling;
  var prev;
  var last;
  var position;
  var tokens;
  var queue;

  if (index !== 0 && (child.type === 'SymbolNode' || child.type === 'PunctuationNode')) {
    siblings = parent.children;
    prev = siblings[index - 1];

    if (prev && prev.type === 'WordNode') {
      position = index - 1;

      tokens = [];
      queue = [];

      /* - If a token which is neither word nor
       *   inner word symbol is found, the loop
       *   is broken.
       * - If an inner word symbol is found,
       *   it's queued.
       * - If a word is found, it's queued (and
       *   the queue stored and emptied). */
      while (siblings[++position]) {
        sibling = siblings[position];

        if (sibling.type === 'WordNode') {
          tokens = tokens.concat(queue, sibling.children);

          queue = [];
        } else if (
          (
            sibling.type === 'SymbolNode' ||
            sibling.type === 'PunctuationNode'
          ) &&
          INNER_WORD_SYMBOL.test(toString(sibling))
        ) {
          queue.push(sibling);
        } else {
          break;
        }
      }

      if (tokens.length !== 0) {
        /* If there is a queue, remove its length
         * from `position`. */
        if (queue.length !== 0) {
          position -= queue.length;
        }

        /* Remove every (one or more) inner-word punctuation
         * marks and children of words. */
        siblings.splice(index, position - index);

        /* Add all found tokens to `prev`s children. */
        prev.children = prev.children.concat(tokens);

        last = tokens[tokens.length - 1];

        /* Update position. */
        if (prev.position && last.position) {
          prev.position.end = last.position.end;
        }

        /* Next, iterate over the node *now* at the current
         * position. */
        return index;
      }
    }
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-modify-children":46}],30:[function(require,module,exports){
'use strict';

var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(mergeNonWordSentences);

/* Merge a sentence into the following sentence, when
 * the sentence does not contain word tokens. */
function mergeNonWordSentences(child, index, parent) {
  var children = child.children;
  var position = -1;
  var prev;
  var next;

  while (children[++position]) {
    if (children[position].type === 'WordNode') {
      return;
    }
  }

  prev = parent.children[index - 1];

  if (prev) {
    prev.children = prev.children.concat(children);

    /* Remove the child. */
    parent.children.splice(index, 1);

    /* Patch position. */
    if (prev.position && child.position) {
      prev.position.end = child.position.end;
    }

    /* Next, iterate over the node *now* at
     * the current position (which was the
     * next node). */
    return index;
  }

  next = parent.children[index + 1];

  if (next) {
    next.children = children.concat(next.children);

    /* Patch position. */
    if (next.position && child.position) {
      next.position.start = child.position.start;
    }

    /* Remove the child. */
    parent.children.splice(index, 1);
  }
}

},{"unist-util-modify-children":46}],31:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(mergePrefixExceptions);

/* Blacklist of full stop characters that should not
 * be treated as terminal sentence markers: A case-insensitive
 * abbreviation. */
var ABBREVIATION_PREFIX = new RegExp(
  '^(' +
    '[0-9]+|' +
    '[a-z]|' +

    /* Common Latin Abbreviations:
     * Based on: http://en.wikipedia.org/wiki/List_of_Latin_abbreviations
     * Where only the abbreviations written without joining full stops,
     * but with a final full stop, were extracted.
     *
     * circa, capitulus, confer, compare, centum weight, eadem, (et) alii,
     * et cetera, floruit, foliis, ibidem, idem, nemine && contradicente,
     * opere && citato, (per) cent, (per) procurationem, (pro) tempore,
     * sic erat scriptum, (et) sequentia, statim, videlicet. */
    'al|ca|cap|cca|cent|cf|cit|con|cp|cwt|ead|etc|ff|' +
    'fl|ibid|id|nem|op|pro|seq|sic|stat|tem|viz' +
  ')$'
);

/* Merge a sentence into its next sentence, when the
 * sentence ends with a certain word. */
function mergePrefixExceptions(child, index, parent) {
  var children = child.children;
  var node;
  var next;

  if (
    children &&
    children.length !== 0 &&
    index !== parent.children.length - 1
  ) {
    node = children[children.length - 1];

    if (node && toString(node) === '.') {
      node = children[children.length - 2];

      if (
        node &&
        node.type === 'WordNode' &&
        ABBREVIATION_PREFIX.test(
          toString(node).toLowerCase()
        )
      ) {
        next = parent.children[index + 1];

        child.children = children.concat(next.children);

        parent.children.splice(index + 1, 1);

        /* Update position. */
        if (next.position && child.position) {
          child.position.end = next.position.end;
        }

        /* Next, iterate over the current node again. */
        return index - 1;
      }
    }
  }
}

},{"nlcst-to-string":13,"unist-util-modify-children":46}],32:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');
var visitChildren = require('unist-util-visit-children');
var expressions = require('../expressions');

module.exports = visitChildren(mergeRemainingFullStops);

/* Blacklist of full stop characters that should not
 * be treated as terminal sentence markers: A
 * case-insensitive abbreviation. */
var TERMINAL_MARKER = expressions.terminalMarker;

/* Merge non-terminal-marker full stops into
 * the previous word (if available), or the next
 * word (if available). */
function mergeRemainingFullStops(child) {
  var children = child.children;
  var position = children.length;
  var hasFoundDelimiter = false;
  var grandchild;
  var prev;
  var next;
  var nextNext;

  while (children[--position]) {
    grandchild = children[position];

    if (grandchild.type !== 'SymbolNode' && grandchild.type !== 'PunctuationNode') {
      /* This is a sentence without terminal marker,
       * so we 'fool' the code to make it think we
       * have found one. */
      if (grandchild.type === 'WordNode') {
        hasFoundDelimiter = true;
      }

      continue;
    }

    /* Exit when this token is not a terminal marker. */
    if (!TERMINAL_MARKER.test(toString(grandchild))) {
      continue;
    }

    /* Ignore the first terminal marker found
     * (starting at the end), as it should not
     * be merged. */
    if (!hasFoundDelimiter) {
      hasFoundDelimiter = true;

      continue;
    }

    /* Only merge a single full stop. */
    if (toString(grandchild) !== '.') {
      continue;
    }

    prev = children[position - 1];
    next = children[position + 1];

    if (prev && prev.type === 'WordNode') {
      nextNext = children[position + 2];

      /* Continue when the full stop is followed by
       * a space and another full stop, such as:
       * `{.} .` */
      if (
        next &&
        nextNext &&
        next.type === 'WhiteSpaceNode' &&
        toString(nextNext) === '.'
      ) {
        continue;
      }

      /* Remove `child` from parent. */
      children.splice(position, 1);

      /* Add the punctuation mark at the end of the
       * previous node. */
      prev.children.push(grandchild);

      /* Update position. */
      if (grandchild.position && prev.position) {
        prev.position.end = grandchild.position.end;
      }

      position--;
    } else if (next && next.type === 'WordNode') {
      /* Remove `child` from parent. */
      children.splice(position, 1);

      /* Add the punctuation mark at the start of
       * the next node. */
      next.children.unshift(grandchild);

      if (grandchild.position && next.position) {
        next.position.start = grandchild.position.start;
      }
    }
  }
}

},{"../expressions":15,"nlcst-to-string":13,"unist-util-visit-children":48}],33:[function(require,module,exports){
'use strict';

var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(mergeFinalWordSymbol);

/* Merge multiple words. This merges the children of
 * adjacent words, something which should not occur
 * naturally by parse-latin, but might happen when
 * custom tokens were passed in. */
function mergeFinalWordSymbol(child, index, parent) {
  var siblings = parent.children;
  var next;

  if (child.type === 'WordNode') {
    next = siblings[index + 1];

    if (next && next.type === 'WordNode') {
      /* Remove `next` from parent. */
      siblings.splice(index + 1, 1);

      /* Add the punctuation mark at the end of the
       * previous node. */
      child.children = child.children.concat(next.children);

      /* Update position. */
      if (next.position && child.position) {
        child.position.end = next.position.end;
      }

      /* Next, re-iterate the current node. */
      return index;
    }
  }
}

},{"unist-util-modify-children":46}],34:[function(require,module,exports){
'use strict';

var visitChildren = require('unist-util-visit-children');

module.exports = visitChildren(patchPosition);

/* Patch the position on a parent node based on its first
 * and last child. */
function patchPosition(child, index, node) {
  var siblings = node.children;

  if (!child.position) {
    return;
  }

  if (index === 0 && (!node.position || /* istanbul ignore next */ !node.position.start)) {
    patch(node);
    node.position.start = child.position.start;
  }

  if (
    index === siblings.length - 1 &&
    (!node.position || !node.position.end)
  ) {
    patch(node);
    node.position.end = child.position.end;
  }
}

/* Add a `position` object when it does not yet exist
 * on `node`. */
function patch(node) {
  if (!node.position) {
    node.position = {};
  }
}

},{"unist-util-visit-children":48}],35:[function(require,module,exports){
'use strict';

var modifyChildren = require('unist-util-modify-children');

module.exports = modifyChildren(removeEmptyNodes);

/* Remove empty children. */
function removeEmptyNodes(child, index, parent) {
  if ('children' in child && child.children.length === 0) {
    parent.children.splice(index, 1);

    /* Next, iterate over the node *now* at
     * the current position (which was the
     * next node). */
    return index;
  }
}

},{"unist-util-modify-children":46}],36:[function(require,module,exports){
'use strict';

/* Dependencies. */
var toString = require('nlcst-to-string');

/* Expose. */
module.exports = tokenizerFactory;

/* Factory to create a tokenizer based on a given
 * `expression`. */
function tokenizerFactory(childType, expression) {
  return tokenizer;

  /* A function that splits. */
  function tokenizer(node) {
    var children = [];
    var tokens = node.children;
    var type = node.type;
    var length = tokens.length;
    var index = -1;
    var lastIndex = length - 1;
    var start = 0;
    var first;
    var last;
    var parent;

    while (++index < length) {
      if (
        index === lastIndex ||
        (
          tokens[index].type === childType &&
          expression.test(toString(tokens[index]))
        )
      ) {
        first = tokens[start];
        last = tokens[index];

        parent = {
          type: type,
          children: tokens.slice(start, index + 1)
        };

        if (first.position && last.position) {
          parent.position = {
            start: first.position.start,
            end: last.position.end
          };
        }

        children.push(parent);

        start = index + 1;
      }
    }

    return children;
  }
}

},{"nlcst-to-string":13}],37:[function(require,module,exports){
'use strict';

var path = require('path');

function replaceExt(npath, ext) {
  if (typeof npath !== 'string') {
    return npath;
  }

  if (npath.length === 0) {
    return npath;
  }

  var nFileName = path.basename(npath, path.extname(npath)) + ext;
  return path.join(path.dirname(npath), nFileName);
}

module.exports = replaceExt;

},{"path":1}],38:[function(require,module,exports){
'use strict';

var unherit = require('unherit');
var Latin = require('parse-latin');

module.exports = parse;
parse.Parser = Latin;

function parse() {
  this.Parser = unherit(Latin);
}

},{"parse-latin":14,"unherit":44}],39:[function(require,module,exports){
module.exports={
  "abandon": -2,
  "abandoned": -2,
  "abandons": -2,
  "abducted": -2,
  "abduction": -2,
  "abductions": -2,
  "abhor": -3,
  "abhorred": -3,
  "abhorrent": -3,
  "abhors": -3,
  "abilities": 2,
  "ability": 2,
  "aboard": 1,
  "aborted": -1,
  "aborts": -1,
  "absentee": -1,
  "absentees": -1,
  "absolve": 2,
  "absolved": 2,
  "absolves": 2,
  "absolving": 2,
  "absorbed": 1,
  "abuse": -3,
  "abused": -3,
  "abuses": -3,
  "abusing": -3,
  "abusive": -3,
  "accept": 1,
  "acceptable": 1,
  "acceptance": 1,
  "accepted": 1,
  "accepting": 1,
  "accepts": 1,
  "accessible": 1,
  "accident": -2,
  "accidental": -2,
  "accidentally": -2,
  "accidents": -2,
  "acclaim": 2,
  "acclaimed": 2,
  "accolade": 2,
  "accomplish": 2,
  "accomplished": 2,
  "accomplishes": 2,
  "accomplishment": 2,
  "accomplishments": 2,
  "accusation": -2,
  "accusations": -2,
  "accuse": -2,
  "accused": -2,
  "accuses": -2,
  "accusing": -2,
  "ache": -2,
  "achievable": 1,
  "aching": -2,
  "acquit": 2,
  "acquits": 2,
  "acquitted": 2,
  "acquitting": 2,
  "acrimonious": -3,
  "active": 1,
  "adequate": 1,
  "admire": 3,
  "admired": 3,
  "admires": 3,
  "admiring": 3,
  "admit": -1,
  "admits": -1,
  "admitted": -1,
  "admonish": -2,
  "admonished": -2,
  "adopt": 1,
  "adopts": 1,
  "adorable": 3,
  "adoration": 3,
  "adore": 3,
  "adored": 3,
  "adores": 3,
  "adoring": 3,
  "adoringly": 3,
  "advanced": 1,
  "advantage": 2,
  "advantageous": 2,
  "advantageously": 2,
  "advantages": 2,
  "adventure": 2,
  "adventures": 2,
  "adventurous": 2,
  "adversary": -1,
  "advisable": 1,
  "affected": -1,
  "affection": 3,
  "affectionate": 3,
  "affectionateness": 3,
  "afflicted": -1,
  "affordable": 2,
  "affronted": -1,
  "aficionados": 2,
  "afraid": -2,
  "aggravate": -2,
  "aggravated": -2,
  "aggravates": -2,
  "aggravating": -2,
  "aggression": -2,
  "aggressions": -2,
  "aggressive": -2,
  "aggressiveness": -2,
  "aghast": -2,
  "agog": 2,
  "agonise": -3,
  "agonised": -3,
  "agonises": -3,
  "agonising": -3,
  "agonize": -3,
  "agonized": -3,
  "agonizes": -3,
  "agonizing": -3,
  "agree": 1,
  "agreeable": 2,
  "agreed": 1,
  "agreement": 1,
  "agrees": 1,
  "alarm": -2,
  "alarmed": -2,
  "alarmist": -2,
  "alarmists": -2,
  "alas": -1,
  "alert": -1,
  "alienation": -2,
  "alive": 1,
  "allegation": -2,
  "allegations": -2,
  "allergic": -2,
  "allow": 1,
  "ally": 2,
  "alone": -2,
  "altruistic": 2,
  "amaze": 2,
  "amazed": 2,
  "amazes": 2,
  "amazing": 4,
  "ambitious": 2,
  "ambivalent": -1,
  "amicable": 2,
  "amuse": 3,
  "amused": 3,
  "amusement": 3,
  "amusements": 3,
  "anger": -3,
  "angered": -3,
  "angers": -3,
  "angry": -3,
  "anguish": -3,
  "anguished": -3,
  "animosity": -2,
  "annoy": -2,
  "annoyance": -2,
  "annoyed": -2,
  "annoying": -2,
  "annoys": -2,
  "antagonistic": -2,
  "anti": -1,
  "anticipation": 1,
  "anxiety": -2,
  "anxious": -2,
  "apathetic": -3,
  "apathy": -3,
  "apeshit": -3,
  "apocalyptic": -2,
  "apologise": -1,
  "apologised": -1,
  "apologises": -1,
  "apologising": -1,
  "apologize": -1,
  "apologized": -1,
  "apologizes": -1,
  "apologizing": -1,
  "apology": -1,
  "appalled": -2,
  "appalling": -2,
  "appealing": 2,
  "appease": 2,
  "appeased": 2,
  "appeases": 2,
  "appeasing": 2,
  "applaud": 2,
  "applauded": 2,
  "applauding": 2,
  "applauds": 2,
  "applause": 2,
  "appreciate": 2,
  "appreciated": 2,
  "appreciates": 2,
  "appreciating": 2,
  "appreciation": 2,
  "apprehensive": -2,
  "appropriate": 2,
  "appropriately": 2,
  "approval": 2,
  "approved": 2,
  "approves": 2,
  "ardent": 1,
  "arrest": -2,
  "arrested": -3,
  "arrests": -2,
  "arrogant": -2,
  "arsehole": -4,
  "ashame": -2,
  "ashamed": -2,
  "ass": -4,
  "assassination": -3,
  "assassinations": -3,
  "assault": -2,
  "assaults": -2,
  "asset": 2,
  "assets": 2,
  "assfucking": -4,
  "asshole": -4,
  "astonished": 2,
  "astound": 3,
  "astounded": 3,
  "astounding": 3,
  "astoundingly": 3,
  "astounds": 3,
  "atrocious": -3,
  "atrocity": -3,
  "attack": -1,
  "attacked": -1,
  "attacking": -1,
  "attacks": -1,
  "attract": 1,
  "attracted": 1,
  "attracting": 2,
  "attraction": 2,
  "attractions": 2,
  "attractive": 2,
  "attractively": 2,
  "attractiveness": 2,
  "attracts": 1,
  "audacious": 3,
  "aura": 1,
  "authority": 1,
  "avenge": -2,
  "avenged": -2,
  "avenger": -2,
  "avengers": -2,
  "avenges": -2,
  "avenging": -2,
  "avert": -1,
  "averted": -1,
  "averts": -1,
  "avid": 2,
  "avoid": -1,
  "avoided": -1,
  "avoids": -1,
  "await": -1,
  "awaited": -1,
  "awaits": -1,
  "award": 3,
  "awarded": 3,
  "awards": 3,
  "awesome": 4,
  "awful": -3,
  "awkward": -2,
  "axe": -1,
  "axed": -1,
  "backed": 1,
  "backing": 2,
  "backs": 1,
  "bad": -3,
  "bad luck": -2,
  "badass": -3,
  "badly": -3,
  "badness": -3,
  "bailout": -2,
  "balanced": 1,
  "bamboozle": -2,
  "bamboozled": -2,
  "bamboozles": -2,
  "ban": -2,
  "banish": -1,
  "bankrupt": -3,
  "bankruptcy": -3,
  "bankster": -3,
  "banned": -2,
  "barbarian": -2,
  "barbaric": -2,
  "barbarous": -2,
  "bargain": 2,
  "barrier": -2,
  "bastard": -5,
  "bastards": -5,
  "battle": -1,
  "battled": -1,
  "battles": -1,
  "battling": -2,
  "beaten": -2,
  "beatific": 3,
  "beating": -1,
  "beauties": 3,
  "beautiful": 3,
  "beautifully": 3,
  "beautify": 3,
  "beauty": 3,
  "befit": 2,
  "befitting": 2,
  "belittle": -2,
  "belittled": -2,
  "beloved": 3,
  "benefactor": 2,
  "benefactors": 2,
  "benefit": 2,
  "benefits": 2,
  "benefitted": 2,
  "benefitting": 2,
  "benevolent": 3,
  "bereave": -2,
  "bereaved": -2,
  "bereaves": -2,
  "bereaving": -2,
  "best": 3,
  "best damn": 4,
  "betray": -3,
  "betrayal": -3,
  "betrayed": -3,
  "betraying": -3,
  "betrays": -3,
  "better": 2,
  "bias": -1,
  "biased": -2,
  "big": 1,
  "bitch": -5,
  "bitches": -5,
  "bitter": -2,
  "bitterest": -2,
  "bitterly": -2,
  "bizarre": -2,
  "blackmail": -3,
  "blackmailed": -3,
  "blackmailing": -3,
  "blackmails": -3,
  "blah": -2,
  "blame": -2,
  "blamed": -2,
  "blames": -2,
  "blaming": -2,
  "bless": 2,
  "blesses": 2,
  "blessing": 3,
  "blessings": 3,
  "blind": -1,
  "bliss": 3,
  "blissful": 3,
  "blithe": 2,
  "bloated": -1,
  "block": -1,
  "blockade": -2,
  "blockbuster": 3,
  "blocked": -1,
  "blocking": -1,
  "blocks": -1,
  "bloody": -3,
  "blurry": -2,
  "boastful": -2,
  "bold": 2,
  "boldly": 2,
  "bomb": -1,
  "boost": 1,
  "boosted": 1,
  "boosting": 1,
  "boosts": 1,
  "bore": -2,
  "bored": -2,
  "boring": -3,
  "bother": -2,
  "bothered": -2,
  "bothers": -2,
  "bothersome": -2,
  "boycott": -2,
  "boycotted": -2,
  "boycotting": -2,
  "boycotts": -2,
  "brainwashing": -3,
  "brave": 2,
  "braveness": 2,
  "bravery": 2,
  "bravura": 3,
  "breach": -2,
  "breached": -2,
  "breaches": -2,
  "breaching": -2,
  "breakthrough": 3,
  "breathtaking": 5,
  "bribe": -3,
  "bribed": -3,
  "bribes": -3,
  "bribing": -3,
  "bright": 1,
  "brightest": 2,
  "brightness": 1,
  "brilliance": 3,
  "brilliances": 3,
  "brilliant": 4,
  "brisk": 2,
  "broke": -1,
  "broken": -1,
  "brooding": -2,
  "brutal": -3,
  "brutally": -3,
  "bullied": -2,
  "bullshit": -4,
  "bully": -2,
  "bullying": -2,
  "bummer": -2,
  "buoyant": 2,
  "burden": -2,
  "burdened": -2,
  "burdening": -2,
  "burdens": -2,
  "burglar": -2,
  "burglary": -2,
  "calm": 2,
  "calmed": 2,
  "calming": 2,
  "calms": 2,
  "can't stand": -3,
  "cancel": -1,
  "cancelled": -1,
  "cancelling": -1,
  "cancels": -1,
  "cancer": -1,
  "capabilities": 1,
  "capability": 1,
  "capable": 1,
  "captivated": 3,
  "care": 2,
  "carefree": 1,
  "careful": 2,
  "carefully": 2,
  "carefulness": 2,
  "careless": -2,
  "cares": 2,
  "caring": 2,
  "cashing in": -2,
  "casualty": -2,
  "catastrophe": -3,
  "catastrophic": -4,
  "cautious": -1,
  "celebrate": 3,
  "celebrated": 3,
  "celebrates": 3,
  "celebrating": 3,
  "celebration": 3,
  "celebrations": 3,
  "censor": -2,
  "censored": -2,
  "censors": -2,
  "certain": 1,
  "chagrin": -2,
  "chagrined": -2,
  "challenge": -1,
  "champion": 2,
  "championed": 2,
  "champions": 2,
  "chance": 2,
  "chances": 2,
  "chaos": -2,
  "chaotic": -2,
  "charged": -3,
  "charges": -2,
  "charisma": 2,
  "charitable": 2,
  "charm": 3,
  "charming": 3,
  "charmingly": 3,
  "charmless": -3,
  "chastise": -3,
  "chastised": -3,
  "chastises": -3,
  "chastising": -3,
  "cheat": -3,
  "cheated": -3,
  "cheater": -3,
  "cheaters": -3,
  "cheating": -3,
  "cheats": -3,
  "cheer": 2,
  "cheered": 2,
  "cheerful": 2,
  "cheerfully": 2,
  "cheering": 2,
  "cheerless": -2,
  "cheers": 2,
  "cheery": 3,
  "cherish": 2,
  "cherished": 2,
  "cherishes": 2,
  "cherishing": 2,
  "chic": 2,
  "chide": -3,
  "chided": -3,
  "chides": -3,
  "chiding": -3,
  "childish": -2,
  "chilling": -1,
  "choke": -2,
  "choked": -2,
  "chokes": -2,
  "choking": -2,
  "clarifies": 2,
  "clarity": 2,
  "clash": -2,
  "classy": 3,
  "clean": 2,
  "cleaner": 2,
  "clear": 1,
  "cleared": 1,
  "clearly": 1,
  "clears": 1,
  "clever": 2,
  "clouded": -1,
  "clueless": -2,
  "cock": -5,
  "cocksucker": -5,
  "cocksuckers": -5,
  "cocky": -2,
  "coerced": -2,
  "coercion": -2,
  "collapse": -2,
  "collapsed": -2,
  "collapses": -2,
  "collapsing": -2,
  "collide": -1,
  "collides": -1,
  "colliding": -1,
  "collision": -2,
  "collisions": -2,
  "colluding": -3,
  "combat": -1,
  "combats": -1,
  "comedy": 1,
  "comfort": 2,
  "comfortable": 2,
  "comfortably": 2,
  "comforting": 2,
  "comforts": 2,
  "comic": 1,
  "commend": 2,
  "commended": 2,
  "commit": 1,
  "commitment": 2,
  "commits": 1,
  "committed": 1,
  "committing": 1,
  "compassion": 2,
  "compassionate": 2,
  "compelled": 1,
  "competencies": 1,
  "competent": 2,
  "competitive": 2,
  "complacent": -2,
  "complain": -2,
  "complained": -2,
  "complaining": -2,
  "complains": -2,
  "complaint": -2,
  "complaints": -2,
  "complicating": -2,
  "compliment": 2,
  "complimented": 2,
  "compliments": 2,
  "comprehensive": 2,
  "concerned": -2,
  "conciliate": 2,
  "conciliated": 2,
  "conciliates": 2,
  "conciliating": 2,
  "condemn": -2,
  "condemnation": -2,
  "condemned": -2,
  "condemns": -2,
  "confidence": 2,
  "confident": 2,
  "confidently": 2,
  "conflict": -2,
  "conflicting": -2,
  "conflictive": -2,
  "conflicts": -2,
  "confuse": -2,
  "confused": -2,
  "confusing": -2,
  "congrats": 2,
  "congratulate": 2,
  "congratulation": 2,
  "congratulations": 2,
  "consent": 2,
  "consents": 2,
  "consolable": 2,
  "conspiracy": -3,
  "constipation": -2,
  "constrained": -2,
  "contagion": -2,
  "contagions": -2,
  "contagious": -1,
  "contaminant": -2,
  "contaminants": -2,
  "contaminate": -2,
  "contaminated": -2,
  "contaminates": -2,
  "contaminating": -2,
  "contamination": -2,
  "contaminations": -2,
  "contempt": -2,
  "contemptible": -2,
  "contemptuous": -2,
  "contemptuously": -2,
  "contend": -1,
  "contender": -1,
  "contending": -1,
  "contentious": -2,
  "contestable": -2,
  "controversial": -2,
  "controversially": -2,
  "controversies": -2,
  "controversy": -2,
  "convicted": -2,
  "convince": 1,
  "convinced": 1,
  "convinces": 1,
  "convivial": 2,
  "cool": 1,
  "cool stuff": 3,
  "cornered": -2,
  "corpse": -1,
  "corrupt": -3,
  "corrupted": -3,
  "corrupting": -3,
  "corruption": -3,
  "corrupts": -3,
  "costly": -2,
  "courage": 2,
  "courageous": 2,
  "courageously": 2,
  "courageousness": 2,
  "courteous": 2,
  "courtesy": 2,
  "cover-up": -3,
  "coward": -2,
  "cowardly": -2,
  "coziness": 2,
  "cramp": -1,
  "crap": -3,
  "crappy": -3,
  "crash": -2,
  "crazier": -2,
  "craziest": -2,
  "crazy": -2,
  "creative": 2,
  "crestfallen": -2,
  "cried": -2,
  "cries": -2,
  "crime": -3,
  "crimes": -3,
  "criminal": -3,
  "criminals": -3,
  "criminate": -3,
  "criminated": -3,
  "criminates": -3,
  "crisis": -3,
  "critic": -2,
  "criticise": -2,
  "criticised": -2,
  "criticises": -2,
  "criticising": -2,
  "criticism": -2,
  "criticize": -2,
  "criticized": -2,
  "criticizes": -2,
  "criticizing": -2,
  "critics": -2,
  "critique": -2,
  "crowding": -1,
  "crude": -1,
  "cruel": -3,
  "cruelty": -3,
  "crush": -1,
  "crushed": -2,
  "crushes": -1,
  "crushing": -1,
  "cry": -1,
  "crying": -2,
  "cunning": 2,
  "cunt": -5,
  "curious": 1,
  "curse": -1,
  "cut": -1,
  "cutback": -2,
  "cutbacks": -2,
  "cute": 2,
  "cuts": -1,
  "cutting": -1,
  "cynic": -2,
  "cynical": -2,
  "cynicism": -2,
  "damage": -3,
  "damaged": -3,
  "damages": -3,
  "damaging": -3,
  "damn": -2,
  "damn cute": 3,
  "damn good": 4,
  "damned": -4,
  "damnit": -4,
  "danger": -2,
  "dangerous": -2,
  "dangerously": -2,
  "daredevil": 2,
  "daring": 2,
  "darkest": -2,
  "darkness": -1,
  "dauntless": 2,
  "dazzling": 3,
  "dead": -3,
  "deadening": -2,
  "deadlock": -2,
  "deadly": -3,
  "deafening": -1,
  "dear": 2,
  "dearly": 3,
  "death": -2,
  "deaths": -2,
  "debonair": 2,
  "debt": -2,
  "deceit": -3,
  "deceitful": -3,
  "deceive": -3,
  "deceived": -3,
  "deceives": -3,
  "deceiving": -3,
  "deception": -3,
  "deceptive": -3,
  "decisive": 1,
  "dedicated": 2,
  "dedication": 2,
  "defeat": -2,
  "defeated": -2,
  "defect": -3,
  "defective": -3,
  "defects": -3,
  "defender": 2,
  "defenders": 2,
  "defenseless": -2,
  "defer": -1,
  "deferring": -1,
  "defiant": -1,
  "deficiencies": -2,
  "deficiency": -2,
  "deficient": -2,
  "deficit": -2,
  "deformed": -2,
  "deformities": -2,
  "deformity": -2,
  "defraud": -3,
  "defrauds": -3,
  "deft": 2,
  "defunct": -2,
  "degrade": -2,
  "degraded": -2,
  "degrades": -2,
  "dehumanize": -2,
  "dehumanized": -2,
  "dehumanizes": -2,
  "dehumanizing": -2,
  "deject": -2,
  "dejected": -2,
  "dejecting": -2,
  "dejects": -2,
  "delay": -1,
  "delayed": -1,
  "delectable": 3,
  "delicious": 3,
  "delight": 3,
  "delighted": 3,
  "delightful": 3,
  "delightfully": 3,
  "delighting": 3,
  "delights": 3,
  "demand": -1,
  "demanded": -1,
  "demanding": -1,
  "demands": -1,
  "demonstration": -1,
  "demoralize": -2,
  "demoralized": -2,
  "demoralizes": -2,
  "demoralizing": -2,
  "denial": -2,
  "denials": -2,
  "denied": -2,
  "denier": -2,
  "deniers": -2,
  "denies": -2,
  "denounce": -2,
  "denounces": -2,
  "dent": -2,
  "deny": -2,
  "denying": -2,
  "deplore": -3,
  "deplored": -3,
  "deplores": -3,
  "deploring": -3,
  "deport": -2,
  "deportation": -2,
  "deportations": -2,
  "deported": -2,
  "deporting": -2,
  "deports": -2,
  "depressed": -2,
  "depressing": -2,
  "deprivation": -3,
  "derail": -2,
  "derailed": -2,
  "derails": -2,
  "derelict": -2,
  "deride": -2,
  "derided": -2,
  "derides": -2,
  "deriding": -2,
  "derision": -2,
  "desirable": 2,
  "desire": 1,
  "desired": 2,
  "desirous": 2,
  "despair": -3,
  "despairing": -3,
  "despairs": -3,
  "desperate": -3,
  "desperately": -3,
  "despondent": -3,
  "destroy": -3,
  "destroyed": -3,
  "destroying": -3,
  "destroys": -3,
  "destruction": -3,
  "destructive": -3,
  "detached": -1,
  "detain": -2,
  "detained": -2,
  "detention": -2,
  "deteriorate": -2,
  "deteriorated": -2,
  "deteriorates": -2,
  "deteriorating": -2,
  "determined": 2,
  "deterrent": -2,
  "detract": -1,
  "detracted": -1,
  "detracts": -1,
  "devastate": -2,
  "devastated": -2,
  "devastating": -2,
  "devastation": -2,
  "devastations": -2,
  "devoted": 3,
  "devotion": 2,
  "devotional": 2,
  "diamond": 1,
  "dick": -4,
  "dickhead": -4,
  "die": -3,
  "died": -3,
  "difficult": -1,
  "diffident": -2,
  "dignity": 2,
  "dilemma": -1,
  "dilligence": 2,
  "dipshit": -3,
  "dire": -3,
  "direful": -3,
  "dirt": -2,
  "dirtier": -2,
  "dirtiest": -2,
  "dirty": -2,
  "disabilities": -2,
  "disability": -2,
  "disabling": -1,
  "disadvantage": -2,
  "disadvantaged": -2,
  "disagree": -2,
  "disagreeable": -2,
  "disagreement": -2,
  "disappear": -1,
  "disappeared": -1,
  "disappears": -1,
  "disappoint": -2,
  "disappointed": -2,
  "disappointing": -2,
  "disappointment": -2,
  "disappointments": -2,
  "disappoints": -2,
  "disapproval": -2,
  "disapprovals": -2,
  "disapprove": -2,
  "disapproved": -2,
  "disapproves": -2,
  "disapproving": -2,
  "disaster": -2,
  "disasters": -2,
  "disastrous": -3,
  "disbelieve": -2,
  "discard": -1,
  "discarded": -1,
  "discarding": -1,
  "discards": -1,
  "discernment": 2,
  "discomfort": -2,
  "disconsolate": -2,
  "disconsolation": -2,
  "discontented": -2,
  "discord": -2,
  "discounted": -1,
  "discouraged": -2,
  "discredited": -2,
  "discriminate": -2,
  "discriminated": -2,
  "discriminates": -2,
  "discriminating": -2,
  "discriminatory": -2,
  "disdain": -2,
  "disease": -1,
  "diseases": -1,
  "disgrace": -2,
  "disgraced": -2,
  "disguise": -1,
  "disguised": -1,
  "disguises": -1,
  "disguising": -1,
  "disgust": -3,
  "disgusted": -3,
  "disgustful": -3,
  "disgusting": -3,
  "disheartened": -2,
  "dishonest": -2,
  "disillusioned": -2,
  "disinclined": -2,
  "disjointed": -2,
  "dislike": -2,
  "disliked": -2,
  "dislikes": -2,
  "dismal": -2,
  "dismayed": -2,
  "dismissed": -2,
  "disorder": -2,
  "disorders": -2,
  "disorganized": -2,
  "disoriented": -2,
  "disparage": -2,
  "disparaged": -2,
  "disparages": -2,
  "disparaging": -2,
  "displeased": -2,
  "displeasure": -2,
  "disproportionate": -2,
  "dispute": -2,
  "disputed": -2,
  "disputes": -2,
  "disputing": -2,
  "disqualified": -2,
  "disquiet": -2,
  "disregard": -2,
  "disregarded": -2,
  "disregarding": -2,
  "disregards": -2,
  "disrespect": -2,
  "disrespected": -2,
  "disrupt": -2,
  "disrupted": -2,
  "disrupting": -2,
  "disruption": -2,
  "disruptions": -2,
  "disruptive": -2,
  "disrupts": -2,
  "dissatisfied": -2,
  "distasteful": -2,
  "distinguished": 2,
  "distort": -2,
  "distorted": -2,
  "distorting": -2,
  "distorts": -2,
  "distract": -2,
  "distracted": -2,
  "distraction": -2,
  "distracts": -2,
  "distress": -2,
  "distressed": -2,
  "distresses": -2,
  "distressing": -2,
  "distrust": -3,
  "distrustful": -3,
  "disturb": -2,
  "disturbed": -2,
  "disturbing": -2,
  "disturbs": -2,
  "dithering": -2,
  "diverting": -1,
  "dizzy": -1,
  "dodging": -2,
  "dodgy": -2,
  "does not work": -3,
  "dolorous": -2,
  "donate": 2,
  "donated": 2,
  "donates": 2,
  "donating": 2,
  "donation": 2,
  "dont like": -2,
  "doom": -2,
  "doomed": -2,
  "doubt": -1,
  "doubted": -1,
  "doubtful": -1,
  "doubting": -1,
  "doubts": -1,
  "douche": -3,
  "douchebag": -3,
  "dour": -2,
  "downcast": -2,
  "downer": -2,
  "downhearted": -2,
  "downside": -2,
  "drag": -1,
  "dragged": -1,
  "drags": -1,
  "drained": -2,
  "dread": -2,
  "dreaded": -2,
  "dreadful": -3,
  "dreading": -2,
  "dream": 1,
  "dreams": 1,
  "dreary": -2,
  "droopy": -2,
  "drop": -1,
  "dropped": -1,
  "drown": -2,
  "drowned": -2,
  "drowns": -2,
  "drudgery": -2,
  "drunk": -2,
  "dubious": -2,
  "dud": -2,
  "dull": -2,
  "dumb": -3,
  "dumbass": -3,
  "dump": -1,
  "dumped": -2,
  "dumps": -1,
  "dupe": -2,
  "duped": -2,
  "dupery": -2,
  "durable": 2,
  "dying": -3,
  "dysfunction": -2,
  "eager": 2,
  "earnest": 2,
  "ease": 2,
  "easy": 1,
  "ecstatic": 4,
  "eerie": -2,
  "eery": -2,
  "effective": 2,
  "effectively": 2,
  "effectiveness": 2,
  "effortlessly": 2,
  "elated": 3,
  "elation": 3,
  "elegant": 2,
  "elegantly": 2,
  "embarrass": -2,
  "embarrassed": -2,
  "embarrasses": -2,
  "embarrassing": -2,
  "embarrassment": -2,
  "embezzlement": -3,
  "embittered": -2,
  "embrace": 1,
  "emergency": -2,
  "empathetic": 2,
  "empower": 2,
  "empowerment": 2,
  "emptiness": -1,
  "empty": -1,
  "enchanted": 2,
  "encourage": 2,
  "encouraged": 2,
  "encouragement": 2,
  "encourages": 2,
  "encouraging": 2,
  "endorse": 2,
  "endorsed": 2,
  "endorsement": 2,
  "endorses": 2,
  "enemies": -2,
  "enemy": -2,
  "energetic": 2,
  "engage": 1,
  "engages": 1,
  "engrossed": 1,
  "engrossing": 3,
  "enjoy": 2,
  "enjoyable": 2,
  "enjoyed": 2,
  "enjoying": 2,
  "enjoys": 2,
  "enlighten": 2,
  "enlightened": 2,
  "enlightening": 2,
  "enlightens": 2,
  "ennui": -2,
  "enrage": -2,
  "enraged": -2,
  "enrages": -2,
  "enraging": -2,
  "enrapture": 3,
  "enslave": -2,
  "enslaved": -2,
  "enslaves": -2,
  "ensure": 1,
  "ensuring": 1,
  "enterprising": 1,
  "entertaining": 2,
  "enthral": 3,
  "enthusiastic": 3,
  "entitled": 1,
  "entrusted": 2,
  "envies": -1,
  "envious": -2,
  "environment-friendly": 2,
  "envy": -1,
  "envying": -1,
  "erroneous": -2,
  "error": -2,
  "errors": -2,
  "escape": -1,
  "escapes": -1,
  "escaping": -1,
  "esteem": 2,
  "esteemed": 2,
  "ethical": 2,
  "euphoria": 3,
  "euphoric": 4,
  "evacuate": -1,
  "evacuated": -1,
  "evacuates": -1,
  "evacuating": -1,
  "evacuation": -1,
  "evergreen": 2,
  "evergreening": -3,
  "evergreens": 2,
  "eviction": -1,
  "evil": -3,
  "exacerbate": -2,
  "exacerbated": -2,
  "exacerbates": -2,
  "exacerbating": -2,
  "exaggerate": -2,
  "exaggerated": -2,
  "exaggerates": -2,
  "exaggerating": -2,
  "exasparate": -2,
  "exasperated": -2,
  "exasperates": -2,
  "exasperating": -2,
  "excellence": 3,
  "excellent": 3,
  "excite": 3,
  "excited": 3,
  "excitement": 3,
  "exciting": 3,
  "exclude": -1,
  "excluded": -2,
  "exclusion": -1,
  "exclusive": 2,
  "excruciatingly": -1,
  "excuse": -1,
  "exempt": -1,
  "exhausted": -2,
  "exhilarated": 3,
  "exhilarates": 3,
  "exhilarating": 3,
  "exonerate": 2,
  "exonerated": 2,
  "exonerates": 2,
  "exonerating": 2,
  "expand": 1,
  "expands": 1,
  "expel": -2,
  "expelled": -2,
  "expelling": -2,
  "expels": -2,
  "expertly": 2,
  "exploit": -2,
  "exploited": -2,
  "exploiting": -2,
  "exploits": -2,
  "exploration": 1,
  "explorations": 1,
  "expose": -1,
  "exposed": -1,
  "exposes": -1,
  "exposing": -1,
  "exquisite": 3,
  "extend": 1,
  "extends": 1,
  "extremist": -2,
  "extremists": -2,
  "exuberant": 4,
  "exultant": 3,
  "exultantly": 3,
  "fabulous": 4,
  "fabulously": 4,
  "fad": -2,
  "fag": -3,
  "faggot": -3,
  "faggots": -3,
  "fail": -2,
  "failed": -2,
  "failing": -2,
  "fails": -2,
  "failure": -2,
  "failures": -2,
  "fainthearted": -2,
  "fair": 2,
  "fairness": 2,
  "faith": 1,
  "faithful": 3,
  "fake": -3,
  "faker": -3,
  "fakes": -3,
  "faking": -3,
  "fallen": -2,
  "falling": -1,
  "false": -1,
  "falsely": -2,
  "falsified": -3,
  "falsify": -3,
  "fame": 1,
  "famine": -2,
  "famous": 2,
  "fan": 3,
  "fantastic": 4,
  "farce": -1,
  "fascinate": 3,
  "fascinated": 3,
  "fascinates": 3,
  "fascinating": 3,
  "fascination": 3,
  "fascist": -2,
  "fascists": -2,
  "fatal": -3,
  "fatalities": -3,
  "fatality": -3,
  "fatigue": -2,
  "fatigued": -2,
  "fatigues": -2,
  "fatiguing": -2,
  "favor": 2,
  "favorable": 2,
  "favorably": 2,
  "favored": 2,
  "favorite": 2,
  "favorited": 2,
  "favorites": 2,
  "favors": 2,
  "favour": 2,
  "favourable": 2,
  "favourably": 2,
  "favoured": 2,
  "favourite": 2,
  "favourited": 2,
  "favourites": 2,
  "favours": 2,
  "fear": -2,
  "fearful": -2,
  "fearfully": -2,
  "fearing": -2,
  "fearless": 2,
  "fearlessness": 2,
  "fearsome": -2,
  "fed up": -3,
  "feeble": -2,
  "feeling": 1,
  "felonies": -3,
  "felony": -3,
  "fertile": 2,
  "fervent": 2,
  "fervid": 2,
  "festive": 2,
  "fever": -2,
  "fiasco": -3,
  "fidgety": -2,
  "fight": -1,
  "fighting": -2,
  "filth": -2,
  "filthy": -2,
  "fine": 2,
  "fines": -2,
  "finest": 3,
  "fire": -2,
  "fired": -2,
  "firing": -2,
  "fit": 1,
  "fitness": 1,
  "flagship": 2,
  "flaw": -2,
  "flawed": -3,
  "flawless": 2,
  "flawlessly": 2,
  "flaws": -2,
  "flees": -1,
  "flop": -2,
  "flops": -2,
  "flu": -2,
  "flustered": -2,
  "focused": 2,
  "fond": 2,
  "fondness": 2,
  "fool": -2,
  "foolish": -2,
  "fools": -2,
  "forbid": -1,
  "forbidden": -2,
  "forbidding": -2,
  "forced": -1,
  "foreclosure": -2,
  "foreclosures": -2,
  "forefront": 1,
  "forget": -1,
  "forgetful": -2,
  "forgettable": -1,
  "forgive": 1,
  "forgiving": 1,
  "forgot": -1,
  "forgotten": -1,
  "fortunate": 2,
  "fortunately": 2,
  "fortune": 2,
  "foul": -3,
  "frantic": -1,
  "fraud": -4,
  "frauds": -4,
  "fraudster": -4,
  "fraudsters": -4,
  "fraudulence": -4,
  "fraudulent": -4,
  "freak": -2,
  "free": 1,
  "freedom": 2,
  "freedoms": 2,
  "frenzy": -3,
  "fresh": 1,
  "friend": 1,
  "friendliness": 2,
  "friendly": 2,
  "friendship": 2,
  "fright": -2,
  "frightened": -2,
  "frightening": -3,
  "frikin": -2,
  "frisky": 2,
  "frowning": -1,
  "fruitless": -2,
  "frustrate": -2,
  "frustrated": -2,
  "frustrates": -2,
  "frustrating": -2,
  "frustration": -2,
  "ftw": 3,
  "fuck": -4,
  "fucked": -4,
  "fucker": -4,
  "fuckers": -4,
  "fuckface": -4,
  "fuckhead": -4,
  "fuckin": -4,
  "fucking": -4,
  "fucking amazing": 4,
  "fucking beautiful": 4,
  "fucking cute": 4,
  "fucking fantastic": 4,
  "fucking good": 4,
  "fucking great": 4,
  "fucking hot": 2,
  "fucking love": 4,
  "fucking loves": 4,
  "fucking perfect": 4,
  "fucktard": -4,
  "fud": -3,
  "fuked": -4,
  "fuking": -4,
  "fulfill": 2,
  "fulfilled": 2,
  "fulfillment": 2,
  "fulfills": 2,
  "fuming": -2,
  "fun": 4,
  "funeral": -1,
  "funerals": -1,
  "funky": 2,
  "funnier": 4,
  "funny": 4,
  "furious": -3,
  "futile": -2,
  "gag": -2,
  "gagged": -2,
  "gain": 2,
  "gained": 2,
  "gaining": 2,
  "gains": 2,
  "gallant": 3,
  "gallantly": 3,
  "gallantry": 3,
  "game-changing": 3,
  "garbage": -1,
  "gem": 3,
  "generous": 2,
  "generously": 2,
  "genial": 3,
  "ghastly": -2,
  "ghost": -1,
  "giddy": -2,
  "gift": 2,
  "glad": 3,
  "glamorous": 3,
  "glamourous": 3,
  "glee": 3,
  "gleeful": 3,
  "gloom": -1,
  "gloomy": -2,
  "glorious": 2,
  "glory": 2,
  "glum": -2,
  "god": 1,
  "goddamn": -3,
  "godsend": 4,
  "gold": 2,
  "good": 3,
  "goodlooking": 3,
  "goodmorning": 1,
  "goodness": 3,
  "goodwill": 3,
  "goofiness": -2,
  "goofy": -2,
  "gr8": 3,
  "grace": 1,
  "graceful": 2,
  "gracious": 3,
  "grand": 3,
  "grant": 1,
  "granted": 1,
  "granting": 1,
  "grants": 1,
  "grateful": 3,
  "gratification": 2,
  "grave": -2,
  "gray": -1,
  "great": 3,
  "greater": 3,
  "greatest": 3,
  "greed": -3,
  "greedy": -2,
  "green wash": -3,
  "green washing": -3,
  "greenwash": -3,
  "greenwasher": -3,
  "greenwashers": -3,
  "greenwashing": -3,
  "greet": 1,
  "greeted": 1,
  "greeting": 1,
  "greetings": 2,
  "greets": 1,
  "grey": -1,
  "grief": -2,
  "grieved": -2,
  "grim": -2,
  "gripping": 2,
  "grisly": -2,
  "groan": -2,
  "groaned": -2,
  "groaning": -2,
  "groans": -2,
  "gross": -2,
  "growing": 1,
  "growth": 2,
  "growths": 2,
  "gruesome": -3,
  "guarantee": 1,
  "guilt": -3,
  "guilty": -3,
  "gullibility": -2,
  "gullible": -2,
  "gun": -1,
  "ha": 2,
  "hacked": -1,
  "haha": 3,
  "hahaha": 3,
  "hahahah": 3,
  "hail": 2,
  "hailed": 2,
  "hallelujah": 3,
  "handpicked": 1,
  "handsome": 3,
  "hapless": -2,
  "haplessness": -2,
  "happiest": 3,
  "happiness": 3,
  "happy": 3,
  "harass": -3,
  "harassed": -3,
  "harasses": -3,
  "harassing": -3,
  "harassment": -3,
  "hard": -1,
  "hardier": 2,
  "hardship": -2,
  "hardy": 2,
  "harm": -2,
  "harmed": -2,
  "harmful": -2,
  "harming": -2,
  "harmonious": 2,
  "harmoniously": 2,
  "harmony": 2,
  "harms": -2,
  "harried": -2,
  "harsh": -2,
  "harsher": -2,
  "harshest": -2,
  "harshly": -2,
  "hate": -3,
  "hated": -3,
  "hater": -3,
  "haters": -3,
  "hates": -3,
  "hating": -3,
  "hatred": -3,
  "haunt": -1,
  "haunted": -2,
  "haunting": 1,
  "haunts": -1,
  "havoc": -2,
  "hazardous": -3,
  "headache": -2,
  "healthy": 2,
  "heartbreaking": -3,
  "heartbroken": -3,
  "heartfelt": 3,
  "heartless": -2,
  "heartwarming": 3,
  "heaven": 2,
  "heavenly": 4,
  "heavyhearted": -2,
  "hehe": 2,
  "hell": -4,
  "hellish": -2,
  "help": 2,
  "helpful": 2,
  "helping": 2,
  "helpless": -2,
  "helps": 2,
  "hero": 2,
  "heroes": 2,
  "heroic": 3,
  "hesitant": -2,
  "hesitate": -2,
  "hid": -1,
  "hide": -1,
  "hideous": -3,
  "hides": -1,
  "hiding": -1,
  "highlight": 2,
  "hilarious": 2,
  "hinder": -2,
  "hindrance": -2,
  "hoax": -2,
  "hollow": -1,
  "homeless": -2,
  "homesick": -2,
  "homicide": -2,
  "homicides": -2,
  "honest": 2,
  "honor": 2,
  "honored": 2,
  "honoring": 2,
  "honour": 2,
  "honoured": 2,
  "honouring": 2,
  "hooligan": -2,
  "hooliganism": -2,
  "hooligans": -2,
  "hope": 2,
  "hopeful": 2,
  "hopefully": 2,
  "hopeless": -2,
  "hopelessness": -2,
  "hopes": 2,
  "hoping": 2,
  "horrendous": -3,
  "horrible": -3,
  "horrid": -3,
  "horrific": -3,
  "horrified": -3,
  "hospitalized": -2,
  "hostile": -2,
  "huckster": -2,
  "hug": 2,
  "huge": 1,
  "hugs": 2,
  "humane": 2,
  "humble": 1,
  "humbug": -2,
  "humerous": 3,
  "humiliated": -3,
  "humiliation": -3,
  "humor": 2,
  "humorous": 2,
  "humour": 2,
  "humourous": 2,
  "hunger": -2,
  "hurrah": 5,
  "hurt": -2,
  "hurting": -2,
  "hurts": -2,
  "hypocritical": -2,
  "hysteria": -3,
  "hysterical": -3,
  "hysterics": -3,
  "icky": -3,
  "idiocy": -3,
  "idiot": -3,
  "idiotic": -3,
  "ignorance": -2,
  "ignorant": -2,
  "ignore": -1,
  "ignored": -2,
  "ignores": -1,
  "ill": -2,
  "ill-fated": -2,
  "illegal": -3,
  "illegally": -3,
  "illegitimate": -3,
  "illiteracy": -2,
  "illness": -2,
  "illnesses": -2,
  "illogical": -2,
  "imaginative": 2,
  "imbecile": -3,
  "immobilized": -1,
  "immortal": 2,
  "immune": 1,
  "impair": -2,
  "impaired": -2,
  "impairing": -2,
  "impairment": -2,
  "impairs": -2,
  "impatient": -2,
  "impeachment": -3,
  "impeachments": -3,
  "impede": -2,
  "impeded": -2,
  "impedes": -2,
  "impeding": -2,
  "impedingly": -2,
  "imperfect": -2,
  "importance": 2,
  "important": 2,
  "impose": -1,
  "imposed": -1,
  "imposes": -1,
  "imposing": -1,
  "imposter": -2,
  "impotent": -2,
  "impress": 3,
  "impressed": 3,
  "impresses": 3,
  "impressive": 3,
  "imprisoned": -2,
  "imprisonment": -2,
  "improper": -2,
  "improperly": -2,
  "improve": 2,
  "improved": 2,
  "improvement": 2,
  "improves": 2,
  "improving": 2,
  "inability": -2,
  "inaction": -2,
  "inadequate": -2,
  "inadvertently": -2,
  "inappropriate": -2,
  "incapable": -2,
  "incapacitated": -2,
  "incapacitates": -2,
  "incapacitating": -2,
  "incense": -2,
  "incensed": -2,
  "incenses": -2,
  "incensing": -2,
  "incoherent": -2,
  "incompetence": -2,
  "incompetent": -2,
  "incomplete": -1,
  "incomprehensible": -2,
  "inconsiderate": -2,
  "inconvenience": -2,
  "inconvenient": -2,
  "increase": 1,
  "increased": 1,
  "indecisive": -2,
  "indestructible": 2,
  "indicted": -2,
  "indifference": -2,
  "indifferent": -2,
  "indignant": -2,
  "indignation": -2,
  "indoctrinate": -2,
  "indoctrinated": -2,
  "indoctrinates": -2,
  "indoctrinating": -2,
  "inediable": -2,
  "ineffective": -2,
  "ineffectively": -2,
  "ineffectual": -2,
  "inefficiency": -2,
  "inefficient": -2,
  "inefficiently": -2,
  "inept": -2,
  "ineptitude": -2,
  "inexcusable": -3,
  "inexorable": -3,
  "infantile": -2,
  "infantilized": -2,
  "infatuated": 2,
  "infatuation": 2,
  "infect": -2,
  "infected": -2,
  "infecting": -2,
  "infection": -2,
  "infections": -2,
  "infectious": -2,
  "infects": -2,
  "inferior": -2,
  "infest": -2,
  "infested": -2,
  "infesting": -2,
  "infests": -2,
  "inflamed": -2,
  "inflict": -2,
  "inflicted": -2,
  "inflicting": -2,
  "inflicts": -2,
  "influential": 2,
  "infract": -2,
  "infracted": -2,
  "infracting": -2,
  "infracts": -2,
  "infringement": -2,
  "infuriate": -2,
  "infuriated": -2,
  "infuriates": -2,
  "infuriating": -2,
  "inhibit": -1,
  "inhuman": -2,
  "injured": -2,
  "injuries": -2,
  "injury": -2,
  "injustice": -2,
  "innovate": 1,
  "innovates": 1,
  "innovation": 1,
  "innovative": 2,
  "inoperative": -2,
  "inquisition": -2,
  "inquisitive": 2,
  "insane": -2,
  "insanity": -2,
  "insecure": -2,
  "insensitive": -2,
  "insensitivity": -2,
  "insignificant": -2,
  "insipid": -2,
  "insolvent": -2,
  "insomnia": -2,
  "inspiration": 2,
  "inspirational": 2,
  "inspire": 2,
  "inspired": 2,
  "inspires": 2,
  "inspiring": 3,
  "insufficiency": -2,
  "insufficient": -2,
  "insufficiently": -2,
  "insult": -2,
  "insulted": -2,
  "insulting": -2,
  "insults": -2,
  "intact": 2,
  "integrity": 2,
  "intelligent": 2,
  "intense": 1,
  "interest": 1,
  "interested": 2,
  "interesting": 2,
  "interests": 1,
  "interrogated": -2,
  "interrupt": -2,
  "interrupted": -2,
  "interrupting": -2,
  "interruption": -2,
  "interrupts": -2,
  "intimacy": 2,
  "intimidate": -2,
  "intimidated": -2,
  "intimidates": -2,
  "intimidating": -2,
  "intimidation": -2,
  "intransigence": -2,
  "intransigency": -2,
  "intricate": 2,
  "intrigues": 1,
  "invasion": -1,
  "invincible": 2,
  "invite": 1,
  "inviting": 1,
  "invulnerable": 2,
  "irate": -3,
  "ironic": -1,
  "irony": -1,
  "irrational": -1,
  "irreparable": -2,
  "irreproducible": -2,
  "irresistible": 2,
  "irresistibly": 2,
  "irresolute": -2,
  "irresponsible": -2,
  "irresponsibly": -2,
  "irreversible": -1,
  "irreversibly": -1,
  "irritate": -3,
  "irritated": -3,
  "irritates": -3,
  "irritating": -3,
  "isolated": -1,
  "itchy": -2,
  "jackass": -4,
  "jackasses": -4,
  "jailed": -2,
  "jaunty": 2,
  "jealous": -2,
  "jealousy": -2,
  "jeopardy": -2,
  "jerk": -3,
  "jesus": 1,
  "jewel": 1,
  "jewels": 1,
  "jocular": 2,
  "join": 1,
  "joke": 2,
  "jokes": 2,
  "jolly": 2,
  "jovial": 2,
  "joy": 3,
  "joyful": 3,
  "joyfully": 3,
  "joyless": -2,
  "joyous": 3,
  "jubilant": 3,
  "jumpy": -1,
  "justice": 2,
  "justifiably": 2,
  "justified": 2,
  "keen": 1,
  "kickback": -3,
  "kickbacks": -3,
  "kidnap": -2,
  "kidnapped": -2,
  "kidnapping": -2,
  "kidnappings": -2,
  "kidnaps": -2,
  "kill": -3,
  "killed": -3,
  "killing": -3,
  "kills": -3,
  "kind": 2,
  "kind of": 0,
  "kinder": 2,
  "kindness": 2,
  "kiss": 2,
  "kudos": 3,
  "lack": -2,
  "lackadaisical": -2,
  "lag": -1,
  "lagged": -2,
  "lagging": -2,
  "lags": -2,
  "lame": -2,
  "landmark": 2,
  "lapse": -1,
  "lapsed": -1,
  "laugh": 1,
  "laughed": 1,
  "laughing": 1,
  "laughs": 1,
  "laughting": 1,
  "launched": 1,
  "lawl": 3,
  "lawsuit": -2,
  "lawsuits": -2,
  "lazy": -1,
  "leadership": 1,
  "leading": 2,
  "leak": -1,
  "leaked": -1,
  "leave": -1,
  "legal": 1,
  "legally": 1,
  "lenient": 1,
  "lethal": -2,
  "lethality": -2,
  "lethargic": -2,
  "lethargy": -2,
  "liar": -3,
  "liars": -3,
  "libelous": -2,
  "lied": -2,
  "lifeless": -1,
  "lifesaver": 4,
  "lighthearted": 1,
  "likable": 2,
  "like": 2,
  "likeable": 2,
  "liked": 2,
  "likers": 2,
  "likes": 2,
  "liking": 2,
  "limitation": -1,
  "limited": -1,
  "limits": -1,
  "litigation": -1,
  "litigious": -2,
  "lively": 2,
  "livid": -2,
  "lmao": 4,
  "lmfao": 4,
  "loathe": -3,
  "loathed": -3,
  "loathes": -3,
  "loathing": -3,
  "loathsome": -3,
  "lobbied": -2,
  "lobby": -2,
  "lobbying": -2,
  "lobbyist": -2,
  "lobbyists": -2,
  "lol": 3,
  "lolol": 4,
  "lololol": 4,
  "lolololol": 4,
  "lonely": -2,
  "lonesome": -2,
  "longing": -1,
  "lool": 3,
  "loom": -1,
  "loomed": -1,
  "looming": -1,
  "looms": -1,
  "loool": 3,
  "looool": 3,
  "loose": -3,
  "looses": -3,
  "loser": -3,
  "losing": -3,
  "loss": -3,
  "losses": -3,
  "lost": -3,
  "lousy": -2,
  "lovable": 3,
  "love": 3,
  "loved": 3,
  "lovelies": 3,
  "lovely": 3,
  "loves": 3,
  "loving": 2,
  "loving-kindness": 3,
  "lowest": -1,
  "loyal": 3,
  "loyalty": 3,
  "luck": 3,
  "luckily": 3,
  "lucky": 3,
  "lucrative": 3,
  "ludicrous": -3,
  "lugubrious": -2,
  "lunatic": -3,
  "lunatics": -3,
  "lurk": -1,
  "lurking": -1,
  "lurks": -1,
  "luxury": 2,
  "macabre": -2,
  "mad": -3,
  "maddening": -3,
  "made-up": -1,
  "madly": -3,
  "madness": -3,
  "magnificent": 3,
  "maladaption": -2,
  "maldevelopment": -2,
  "maltreatment": -2,
  "mandatory": -1,
  "manipulated": -1,
  "manipulating": -1,
  "manipulation": -1,
  "manslaughter": -3,
  "marvel": 3,
  "marvelous": 3,
  "marvels": 3,
  "masterpiece": 4,
  "masterpieces": 4,
  "matter": 1,
  "matters": 1,
  "mature": 2,
  "meaningful": 2,
  "meaningless": -2,
  "medal": 3,
  "mediocrity": -3,
  "meditative": 1,
  "melancholy": -2,
  "memorable": 1,
  "memoriam": -2,
  "menace": -2,
  "menaced": -2,
  "menaces": -2,
  "mercy": 2,
  "merry": 3,
  "mesmerizing": 3,
  "mess": -2,
  "messed": -2,
  "messing up": -2,
  "methodical": 2,
  "methodically": 2,
  "mindless": -2,
  "miracle": 4,
  "mirth": 3,
  "mirthful": 3,
  "mirthfully": 3,
  "misbehave": -2,
  "misbehaved": -2,
  "misbehaves": -2,
  "misbehaving": -2,
  "misbranding": -3,
  "miscast": -2,
  "mischief": -1,
  "mischiefs": -1,
  "misclassified": -2,
  "misclassifies": -2,
  "misclassify": -2,
  "misconduct": -2,
  "misconducted": -2,
  "misconducting": -2,
  "misconducts": -2,
  "miserable": -3,
  "miserably": -3,
  "misery": -2,
  "misfire": -2,
  "misfortune": -2,
  "misgiving": -2,
  "misinformation": -2,
  "misinformed": -2,
  "misinterpreted": -2,
  "mislead": -3,
  "misleaded": -3,
  "misleading": -3,
  "misleads": -3,
  "misplace": -2,
  "misplaced": -2,
  "misplaces": -2,
  "misplacing": -2,
  "mispricing": -3,
  "misread": -1,
  "misreport": -2,
  "misreported": -2,
  "misreporting": -2,
  "misreports": -2,
  "misrepresent": -2,
  "misrepresentation": -2,
  "misrepresentations": -2,
  "misrepresented": -2,
  "misrepresenting": -2,
  "misrepresents": -2,
  "miss": -2,
  "missed": -2,
  "missing": -2,
  "mistake": -2,
  "mistaken": -2,
  "mistakes": -2,
  "mistaking": -2,
  "misunderstand": -2,
  "misunderstanding": -2,
  "misunderstands": -2,
  "misunderstood": -2,
  "misuse": -2,
  "misused": -2,
  "misuses": -2,
  "misusing": -2,
  "moan": -2,
  "moaned": -2,
  "moaning": -2,
  "moans": -2,
  "mock": -2,
  "mocked": -2,
  "mocking": -2,
  "mocks": -2,
  "modernize": 2,
  "modernized": 2,
  "modernizes": 2,
  "modernizing": 2,
  "mongering": -2,
  "monopolize": -2,
  "monopolized": -2,
  "monopolizes": -2,
  "monopolizing": -2,
  "monotone": -1,
  "moody": -1,
  "mope": -1,
  "moping": -1,
  "moron": -3,
  "motherfucker": -5,
  "motherfucking": -5,
  "motivate": 1,
  "motivated": 2,
  "motivating": 2,
  "motivation": 1,
  "mourn": -2,
  "mourned": -2,
  "mournful": -2,
  "mourning": -2,
  "mourns": -2,
  "muddy": -2,
  "mumpish": -2,
  "murder": -2,
  "murderer": -2,
  "murdering": -3,
  "murderous": -3,
  "murders": -2,
  "murky": -2,
  "myth": -1,
  "n00b": -2,
  "naive": -2,
  "narcissism": -2,
  "nasty": -3,
  "natural": 1,
  "naïve": -2,
  "needy": -2,
  "negative": -2,
  "negativity": -2,
  "neglect": -2,
  "neglected": -2,
  "neglecting": -2,
  "neglects": -2,
  "nerves": -1,
  "nervous": -2,
  "nervously": -2,
  "nice": 3,
  "nifty": 2,
  "niggas": -5,
  "nigger": -5,
  "no": -1,
  "no fun": -3,
  "noble": 2,
  "noblest": 2,
  "noisy": -1,
  "non-approved": -2,
  "nonsense": -2,
  "noob": -2,
  "nosey": -2,
  "not good": -2,
  "not working": -3,
  "notable": 2,
  "noticeable": 2,
  "notorious": -2,
  "novel": 2,
  "numb": -1,
  "nurturing": 2,
  "nuts": -3,
  "obliterate": -2,
  "obliterated": -2,
  "obnoxious": -3,
  "obscene": -2,
  "obscenity": -2,
  "obsessed": 2,
  "obsolete": -2,
  "obstacle": -2,
  "obstacles": -2,
  "obstinate": -2,
  "obstruct": -2,
  "obstructed": -2,
  "obstructing": -2,
  "obstruction": -2,
  "obstructs": -2,
  "odd": -2,
  "offence": -2,
  "offences": -2,
  "offend": -2,
  "offended": -2,
  "offender": -2,
  "offending": -2,
  "offends": -2,
  "offense": -2,
  "offenses": -2,
  "offensive": -2,
  "offensively": -2,
  "offline": -1,
  "oks": 2,
  "ominous": 3,
  "once-in-a-lifetime": 3,
  "oops": -2,
  "opportunities": 2,
  "opportunity": 2,
  "oppressed": -2,
  "oppression": -2,
  "oppressions": -2,
  "oppressive": -2,
  "optimism": 2,
  "optimistic": 2,
  "optionless": -2,
  "ostracize": -2,
  "ostracized": -2,
  "ostracizes": -2,
  "ouch": -2,
  "outage": -2,
  "outages": -2,
  "outbreak": -2,
  "outbreaks": -2,
  "outcry": -2,
  "outmaneuvered": -2,
  "outnumbered": -2,
  "outrage": -3,
  "outraged": -3,
  "outrageous": -3,
  "outreach": 2,
  "outstanding": 5,
  "overjoyed": 4,
  "overload": -1,
  "overlooked": -1,
  "overprotective": -2,
  "overran": -2,
  "overreact": -2,
  "overreacted": -2,
  "overreacting": -2,
  "overreaction": -2,
  "overreacts": -2,
  "oversell": -2,
  "overselling": -2,
  "oversells": -2,
  "oversight": -1,
  "oversimplification": -2,
  "oversimplified": -2,
  "oversimplifies": -2,
  "oversimplify": -2,
  "oversold": -2,
  "overstatement": -2,
  "overstatements": -2,
  "overweight": -1,
  "overwrought": -3,
  "oxymoron": -1,
  "pain": -2,
  "pained": -2,
  "painful": -2,
  "panic": -3,
  "panicked": -3,
  "panics": -3,
  "paradise": 3,
  "paradox": -1,
  "pardon": 2,
  "pardoned": 2,
  "pardoning": 2,
  "pardons": 2,
  "parley": -1,
  "passion": 1,
  "passionate": 2,
  "passive": -1,
  "passively": -1,
  "pathetic": -2,
  "pay": -1,
  "peace": 2,
  "peaceful": 2,
  "peacefully": 2,
  "penalize": -2,
  "penalized": -2,
  "penalizes": -2,
  "penalizing": -2,
  "penalty": -2,
  "pensive": -1,
  "perfect": 3,
  "perfected": 2,
  "perfection": 3,
  "perfectly": 3,
  "perfects": 2,
  "peril": -2,
  "perjury": -3,
  "perpetrated": -2,
  "perpetrator": -2,
  "perpetrators": -2,
  "perplexed": -2,
  "persecute": -2,
  "persecuted": -2,
  "persecutes": -2,
  "persecuting": -2,
  "perturbed": -2,
  "pervert": -3,
  "pesky": -2,
  "pessimism": -2,
  "pessimistic": -2,
  "petrified": -2,
  "philanthropy": 2,
  "phobic": -2,
  "picturesque": 2,
  "pileup": -1,
  "pillage": -2,
  "pique": -2,
  "piqued": -2,
  "piss": -4,
  "pissed": -4,
  "pissing": -3,
  "piteous": -2,
  "pitied": -1,
  "pity": -2,
  "plague": -3,
  "plagued": -3,
  "plagues": -3,
  "plaguing": -3,
  "playful": 2,
  "pleasant": 3,
  "please": 1,
  "pleased": 3,
  "pleasurable": 3,
  "pleasure": 3,
  "plodding": -2,
  "poignant": 2,
  "pointless": -2,
  "poised": -2,
  "poison": -2,
  "poisoned": -2,
  "poisons": -2,
  "polished": 2,
  "polite": 2,
  "politeness": 2,
  "pollutant": -2,
  "pollute": -2,
  "polluted": -2,
  "polluter": -2,
  "polluters": -2,
  "pollutes": -2,
  "pollution": -2,
  "poor": -2,
  "poorer": -2,
  "poorest": -2,
  "poorly": -2,
  "popular": 3,
  "popularity": 3,
  "positive": 2,
  "positively": 2,
  "possessive": -2,
  "post-traumatic": -2,
  "postpone": -1,
  "postponed": -1,
  "postpones": -1,
  "postponing": -1,
  "poverty": -1,
  "powerful": 2,
  "powerless": -2,
  "praise": 3,
  "praised": 3,
  "praises": 3,
  "praising": 3,
  "pray": 1,
  "praying": 1,
  "prays": 1,
  "prblm": -2,
  "prblms": -2,
  "predatory": -2,
  "prepared": 1,
  "pressure": -1,
  "pressured": -2,
  "pretend": -1,
  "pretending": -1,
  "pretends": -1,
  "pretty": 1,
  "prevent": -1,
  "prevented": -1,
  "preventing": -1,
  "prevents": -1,
  "prick": -5,
  "prison": -2,
  "prisoner": -2,
  "prisoners": -2,
  "privileged": 2,
  "proactive": 2,
  "problem": -2,
  "problems": -2,
  "profit": 2,
  "profitable": 2,
  "profiteer": -2,
  "profits": 2,
  "progress": 2,
  "prohibit": -1,
  "prohibits": -1,
  "prominent": 2,
  "promise": 1,
  "promised": 1,
  "promises": 1,
  "promote": 1,
  "promoted": 1,
  "promotes": 1,
  "promoting": 1,
  "promptly": 1,
  "propaganda": -2,
  "prosecute": -1,
  "prosecuted": -2,
  "prosecutes": -1,
  "prosecution": -1,
  "prospect": 1,
  "prospects": 1,
  "prosperity": 3,
  "prosperous": 3,
  "protect": 1,
  "protected": 1,
  "protects": 1,
  "protest": -2,
  "protesters": -2,
  "protesting": -2,
  "protests": -2,
  "proud": 2,
  "proudly": 2,
  "provoke": -1,
  "provoked": -1,
  "provokes": -1,
  "provoking": -1,
  "prudence": 2,
  "pseudoscience": -3,
  "psychopathic": -2,
  "punish": -2,
  "punished": -2,
  "punishes": -2,
  "punishing": -2,
  "punitive": -2,
  "pure": 1,
  "purest": 1,
  "purposeful": 2,
  "pushy": -1,
  "puzzled": -2,
  "quaking": -2,
  "qualities": 2,
  "quality": 2,
  "questionable": -2,
  "questioned": -1,
  "questioning": -1,
  "racism": -3,
  "racist": -3,
  "racists": -3,
  "rage": -2,
  "rageful": -2,
  "rainy": -1,
  "rant": -3,
  "ranter": -3,
  "ranters": -3,
  "rants": -3,
  "rape": -4,
  "raped": -4,
  "rapist": -4,
  "rapture": 2,
  "raptured": 2,
  "raptures": 2,
  "rapturous": 4,
  "rash": -2,
  "ratified": 2,
  "reach": 1,
  "reached": 1,
  "reaches": 1,
  "reaching": 1,
  "reassure": 1,
  "reassured": 1,
  "reassures": 1,
  "reassuring": 2,
  "rebel": -2,
  "rebellion": -2,
  "rebels": -2,
  "recession": -2,
  "reckless": -2,
  "recognition": 2,
  "recommend": 2,
  "recommended": 2,
  "recommends": 2,
  "redeemed": 2,
  "refine": 1,
  "refined": 1,
  "refines": 1,
  "refreshingly": 2,
  "refuse": -2,
  "refused": -2,
  "refuses": -2,
  "refusing": -2,
  "regret": -2,
  "regretful": -2,
  "regrets": -2,
  "regretted": -2,
  "regretting": -2,
  "reigning": 1,
  "reject": -1,
  "rejected": -1,
  "rejecting": -1,
  "rejection": -2,
  "rejects": -1,
  "rejoice": 4,
  "rejoiced": 4,
  "rejoices": 4,
  "rejoicing": 4,
  "relaxed": 2,
  "relentless": -1,
  "reliability": 2,
  "reliable": 2,
  "reliably": 2,
  "reliant": 2,
  "relieve": 1,
  "relieved": 2,
  "relieves": 1,
  "relieving": 2,
  "relishing": 2,
  "remarkable": 2,
  "remorse": -2,
  "repellent": -2,
  "repercussion": -2,
  "repercussions": -2,
  "reprimand": -2,
  "reprimanded": -2,
  "reprimanding": -2,
  "reprimands": -2,
  "repulse": -1,
  "repulsed": -2,
  "repulsive": -2,
  "rescue": 2,
  "rescued": 2,
  "rescues": 2,
  "resentful": -2,
  "resign": -1,
  "resigned": -1,
  "resigning": -1,
  "resigns": -1,
  "resolute": 2,
  "resolution": 2,
  "resolve": 2,
  "resolved": 2,
  "resolves": 2,
  "resolving": 2,
  "respect": 2,
  "respected": 2,
  "respects": 2,
  "responsibility": 1,
  "responsible": 2,
  "responsive": 2,
  "restful": 2,
  "restless": -2,
  "restore": 1,
  "restored": 1,
  "restores": 1,
  "restoring": 1,
  "restrict": -2,
  "restricted": -2,
  "restricting": -2,
  "restriction": -2,
  "restrictive": -1,
  "restricts": -2,
  "retained": -1,
  "retard": -2,
  "retarded": -2,
  "retreat": -1,
  "revenge": -2,
  "revengeful": -2,
  "revered": 2,
  "revive": 2,
  "revives": 2,
  "revolting": -2,
  "reward": 2,
  "rewarded": 2,
  "rewarding": 2,
  "rewards": 2,
  "rich": 2,
  "richly": 2,
  "ridiculous": -3,
  "rig": -1,
  "rigged": -1,
  "right direction": 3,
  "righteousness": 2,
  "rightful": 2,
  "rightfully": 2,
  "rigorous": 3,
  "rigorously": 3,
  "riot": -2,
  "riots": -2,
  "rise": 1,
  "rises": 1,
  "risk": -2,
  "risks": -2,
  "risky": -2,
  "riveting": 3,
  "rob": -2,
  "robber": -2,
  "robed": -2,
  "robing": -2,
  "robs": -2,
  "robust": 2,
  "rofl": 4,
  "roflcopter": 4,
  "roflmao": 4,
  "romance": 2,
  "romantical": 2,
  "romantically": 2,
  "rose": 1,
  "rotfl": 4,
  "rotflmfao": 4,
  "rotflol": 4,
  "rotten": -3,
  "rude": -2,
  "ruin": -2,
  "ruined": -2,
  "ruining": -2,
  "ruins": -2,
  "sabotage": -2,
  "sad": -2,
  "sadden": -2,
  "saddened": -2,
  "sadly": -2,
  "safe": 1,
  "safely": 1,
  "safer": 2,
  "safety": 1,
  "salient": 1,
  "salute": 2,
  "saluted": 2,
  "salutes": 2,
  "saluting": 2,
  "salvation": 2,
  "sappy": -1,
  "sarcastic": -2,
  "satisfied": 2,
  "savange": -2,
  "savanges": -2,
  "save": 2,
  "saved": 2,
  "savings": 1,
  "scam": -2,
  "scams": -2,
  "scandal": -3,
  "scandalous": -3,
  "scandals": -3,
  "scapegoat": -2,
  "scapegoats": -2,
  "scar": -2,
  "scare": -2,
  "scared": -2,
  "scars": -2,
  "scary": -2,
  "sceptical": -2,
  "scold": -2,
  "scoop": 3,
  "scorn": -2,
  "scornful": -2,
  "scream": -2,
  "screamed": -2,
  "screaming": -2,
  "screams": -2,
  "screwed": -2,
  "screwed up": -3,
  "scum": -3,
  "scumbag": -4,
  "seamless": 2,
  "seamlessly": 2,
  "secure": 2,
  "secured": 2,
  "secures": 2,
  "sedition": -2,
  "seditious": -2,
  "seduced": -1,
  "self-abuse": -2,
  "self-confident": 2,
  "self-contradictory": -2,
  "self-deluded": -2,
  "selfish": -3,
  "selfishness": -3,
  "sentence": -2,
  "sentenced": -2,
  "sentences": -2,
  "sentencing": -2,
  "serene": 2,
  "settlement": 1,
  "settlements": 1,
  "severe": -2,
  "severely": -2,
  "sexist": -2,
  "sexistic": -2,
  "sexy": 3,
  "shaky": -2,
  "shame": -2,
  "shamed": -2,
  "shameful": -2,
  "share": 1,
  "shared": 1,
  "shares": 1,
  "shattered": -2,
  "shit": -4,
  "shithead": -4,
  "shitty": -3,
  "shock": -2,
  "shocked": -2,
  "shocking": -2,
  "shocks": -2,
  "shoody": -2,
  "shoot": -1,
  "short-sighted": -2,
  "short-sightedness": -2,
  "shortage": -2,
  "shortages": -2,
  "shrew": -4,
  "shy": -1,
  "sick": -2,
  "sickness": -2,
  "side-effect": -2,
  "side-effects": -2,
  "sigh": -2,
  "significance": 1,
  "significant": 1,
  "silencing": -1,
  "silly": -1,
  "simplicity": 1,
  "sin": -2,
  "sincere": 2,
  "sincerely": 2,
  "sincerest": 2,
  "sincerity": 2,
  "sinful": -3,
  "singleminded": -2,
  "sinister": -2,
  "sins": -2,
  "skeptic": -2,
  "skeptical": -2,
  "skepticism": -2,
  "skeptics": -2,
  "slam": -2,
  "slash": -2,
  "slashed": -2,
  "slashes": -2,
  "slashing": -2,
  "slave": -3,
  "slavery": -3,
  "slaves": -3,
  "sleeplessness": -2,
  "slick": 2,
  "slicker": 2,
  "slickest": 2,
  "slip": -1,
  "sloppy": -2,
  "sluggish": -2,
  "slumping": -1,
  "slut": -5,
  "smart": 1,
  "smarter": 2,
  "smartest": 2,
  "smear": -2,
  "smile": 2,
  "smiled": 2,
  "smiles": 2,
  "smiling": 2,
  "smog": -2,
  "smuggle": -2,
  "smuggled": -2,
  "smuggles": -2,
  "smuggling": -2,
  "sneaky": -1,
  "sneeze": -2,
  "sneezed": -2,
  "sneezes": -2,
  "sneezing": -2,
  "snub": -2,
  "snubbed": -2,
  "snubbing": -2,
  "snubs": -2,
  "sobering": 1,
  "solemn": -1,
  "solid": 2,
  "solidarity": 2,
  "solidified": 2,
  "solidifies": 2,
  "solidify": 2,
  "solidifying": 2,
  "solution": 1,
  "solutions": 1,
  "solve": 1,
  "solved": 1,
  "solves": 1,
  "solving": 1,
  "somber": -2,
  "some kind": 0,
  "son-of-a-bitch": -5,
  "soothe": 3,
  "soothed": 3,
  "soothing": 3,
  "sophisticated": 2,
  "sore": -1,
  "sorrow": -2,
  "sorrowful": -2,
  "sorry": -1,
  "spacious": 1,
  "spam": -2,
  "spammer": -3,
  "spammers": -3,
  "spamming": -2,
  "spark": 1,
  "sparkle": 3,
  "sparkles": 3,
  "sparkling": 3,
  "spearhead": 2,
  "speculative": -2,
  "spirit": 1,
  "spirited": 2,
  "spiritless": -2,
  "spiteful": -2,
  "splendid": 3,
  "spoiled": -2,
  "spoilt": -2,
  "spotless": 2,
  "sprightly": 2,
  "squander": -2,
  "squandered": -2,
  "squandering": -2,
  "squanders": -2,
  "squelched": -1,
  "stab": -2,
  "stabbed": -2,
  "stable": 2,
  "stabs": -2,
  "stall": -2,
  "stalled": -2,
  "stalling": -2,
  "stamina": 2,
  "stampede": -2,
  "stank": -2,
  "startled": -2,
  "startling": 3,
  "starve": -2,
  "starved": -2,
  "starves": -2,
  "starving": -2,
  "steadfast": 2,
  "steal": -2,
  "stealing": -2,
  "steals": -2,
  "stereotype": -2,
  "stereotyped": -2,
  "stifled": -1,
  "stimulate": 1,
  "stimulated": 1,
  "stimulates": 1,
  "stimulating": 2,
  "stingy": -2,
  "stink": -2,
  "stinked": -2,
  "stinker": -2,
  "stinking": -2,
  "stinks": -2,
  "stinky": -2,
  "stole": -2,
  "stolen": -2,
  "stop": -1,
  "stopped": -1,
  "stopping": -1,
  "stops": -1,
  "stout": 2,
  "straight": 1,
  "strange": -1,
  "strangely": -1,
  "strangled": -2,
  "strength": 2,
  "strengthen": 2,
  "strengthened": 2,
  "strengthening": 2,
  "strengthens": 2,
  "strengths": 2,
  "stress": -1,
  "stressed": -2,
  "stressor": -2,
  "stressors": -2,
  "stricken": -2,
  "strike": -1,
  "strikers": -2,
  "strikes": -1,
  "strong": 2,
  "stronger": 2,
  "strongest": 2,
  "struck": -1,
  "struggle": -2,
  "struggled": -2,
  "struggles": -2,
  "struggling": -2,
  "stubborn": -2,
  "stuck": -2,
  "stunned": -2,
  "stunning": 4,
  "stupid": -2,
  "stupidity": -3,
  "stupidly": -2,
  "suave": 2,
  "subpoena": -2,
  "substantial": 1,
  "substantially": 1,
  "subversive": -2,
  "succeed": 3,
  "succeeded": 3,
  "succeeding": 3,
  "succeeds": 3,
  "success": 2,
  "successful": 3,
  "successfully": 3,
  "suck": -3,
  "sucks": -3,
  "sue": -2,
  "sued": -2,
  "sueing": -2,
  "sues": -2,
  "suffer": -2,
  "suffered": -2,
  "sufferer": -2,
  "sufferers": -2,
  "suffering": -2,
  "suffers": -2,
  "suicidal": -2,
  "suicide": -2,
  "suicides": -2,
  "suing": -2,
  "suitable": 2,
  "suited": 2,
  "sulking": -2,
  "sulky": -2,
  "sullen": -2,
  "sunshine": 2,
  "super": 3,
  "superb": 5,
  "superior": 2,
  "support": 2,
  "supported": 2,
  "supporter": 1,
  "supporters": 1,
  "supporting": 1,
  "supportive": 2,
  "supports": 2,
  "supreme": 4,
  "survived": 2,
  "surviving": 2,
  "survivor": 2,
  "suspect": -1,
  "suspected": -1,
  "suspecting": -1,
  "suspects": -1,
  "suspend": -1,
  "suspended": -1,
  "suspicious": -2,
  "sustainability": 1,
  "sustainable": 2,
  "sustainably": 2,
  "swear": -2,
  "swearing": -2,
  "swears": -2,
  "sweet": 2,
  "sweeter": 3,
  "sweetest": 3,
  "swift": 2,
  "swiftly": 2,
  "swindle": -3,
  "swindles": -3,
  "swindling": -3,
  "sympathetic": 2,
  "sympathy": 2,
  "taint": -2,
  "tainted": -2,
  "talent": 2,
  "tard": -2,
  "tarnish": -2,
  "tarnished": -2,
  "tarnishes": -2,
  "tears": -2,
  "tender": 2,
  "tenderness": 2,
  "tense": -2,
  "tension": -1,
  "terrible": -3,
  "terribly": -3,
  "terrific": 4,
  "terrifically": 4,
  "terrified": -3,
  "terror": -3,
  "terrorist": -2,
  "terrorists": -2,
  "terrorize": -3,
  "terrorized": -3,
  "terrorizes": -3,
  "thank": 2,
  "thankful": 2,
  "thanks": 2,
  "thorny": -2,
  "thoughtful": 2,
  "thoughtless": -2,
  "threat": -2,
  "threaten": -2,
  "threatened": -2,
  "threatening": -2,
  "threatens": -2,
  "threats": -2,
  "thrilled": 5,
  "thwart": -2,
  "thwarted": -2,
  "thwarting": -2,
  "thwarts": -2,
  "timid": -2,
  "timorous": -2,
  "tired": -2,
  "tits": -2,
  "tolerance": 2,
  "tolerant": 2,
  "toothless": -2,
  "top": 2,
  "tops": 2,
  "torn": -2,
  "torture": -4,
  "tortured": -4,
  "tortures": -4,
  "torturing": -4,
  "totalitarian": -2,
  "totalitarianism": -2,
  "tout": -2,
  "touted": -2,
  "touting": -2,
  "touts": -2,
  "toxic": -3,
  "tragedies": -2,
  "tragedy": -2,
  "tragic": -2,
  "tranquil": 2,
  "transgress": -2,
  "transgressed": -2,
  "transgresses": -2,
  "transgressing": -2,
  "trap": -1,
  "trapped": -2,
  "traps": -1,
  "trauma": -3,
  "traumatic": -3,
  "travesty": -2,
  "treason": -3,
  "treasonous": -3,
  "treasure": 2,
  "treasures": 2,
  "trembling": -2,
  "tremor": -2,
  "tremors": -2,
  "tremulous": -2,
  "tribulation": -2,
  "tribute": 2,
  "tricked": -2,
  "trickery": -2,
  "triumph": 4,
  "triumphant": 4,
  "troll": -2,
  "trouble": -2,
  "troubled": -2,
  "troubles": -2,
  "troubling": -2,
  "true": 2,
  "trust": 1,
  "trusted": 2,
  "trusts": 1,
  "tumor": -2,
  "twat": -5,
  "tyran": -3,
  "tyrannic": -3,
  "tyrannical": -3,
  "tyrannically": -3,
  "tyrans": -3,
  "ubiquitous": 2,
  "ugh": -2,
  "ugliness": -3,
  "ugly": -3,
  "unable": -2,
  "unacceptable": -2,
  "unappeasable": -2,
  "unappreciated": -2,
  "unapproved": -2,
  "unattractive": -2,
  "unavailable": -1,
  "unavailing": -2,
  "unaware": -2,
  "unbearable": -2,
  "unbelievable": -1,
  "unbelieving": -1,
  "unbiased": 2,
  "uncertain": -1,
  "unclear": -1,
  "uncomfortable": -2,
  "unconcerned": -2,
  "unconfirmed": -1,
  "unconvinced": -1,
  "uncredited": -1,
  "undecided": -1,
  "undercooked": -2,
  "underestimate": -1,
  "underestimated": -1,
  "underestimates": -1,
  "underestimating": -1,
  "undermine": -2,
  "undermined": -2,
  "undermines": -2,
  "undermining": -2,
  "underperform": -2,
  "underperformed": -2,
  "underperforming": -2,
  "underperforms": -2,
  "undeserving": -2,
  "undesirable": -2,
  "uneasy": -2,
  "unemployed": -1,
  "unemployment": -2,
  "unequal": -1,
  "unequaled": 2,
  "unethical": -2,
  "uneventful": -2,
  "unfair": -2,
  "unfavorable": -2,
  "unfit": -2,
  "unfitted": -2,
  "unfocused": -2,
  "unforgivable": -3,
  "unforgiving": -2,
  "unfulfilled": -2,
  "unfunny": -2,
  "ungenerous": -2,
  "ungrateful": -3,
  "unhappiness": -2,
  "unhappy": -2,
  "unhealthy": -2,
  "unhygienic": -2,
  "unified": 1,
  "unimaginative": -2,
  "unimpressed": -2,
  "uninspired": -2,
  "unintelligent": -2,
  "unintentional": -2,
  "uninvolving": -2,
  "united": 1,
  "unjust": -2,
  "unlikely": -1,
  "unlovable": -2,
  "unloved": -2,
  "unmatched": 1,
  "unmotivated": -2,
  "unoriginal": -2,
  "unparliamentary": -2,
  "unpleasant": -2,
  "unpleasantness": -2,
  "unprofessional": -2,
  "unravel": 1,
  "unreleting": -2,
  "unresearched": -2,
  "unsafe": -2,
  "unsatisfied": -2,
  "unscientific": -2,
  "unsecured": -2,
  "unselfish": 2,
  "unsettled": -1,
  "unsold": -1,
  "unsophisticated": -2,
  "unsound": -2,
  "unstable": -2,
  "unstoppable": 2,
  "unsuccessful": -2,
  "unsuccessfully": -2,
  "unsupported": -2,
  "unsure": -1,
  "untarnished": 2,
  "untrue": -2,
  "unwanted": -2,
  "unworthy": -2,
  "uplifting": 2,
  "uproar": -3,
  "upset": -2,
  "upsets": -2,
  "upsetting": -2,
  "uptight": -2,
  "urgent": -1,
  "useful": 2,
  "usefulness": 2,
  "useless": -2,
  "uselessness": -2,
  "vague": -2,
  "validate": 1,
  "validated": 1,
  "validates": 1,
  "validating": 1,
  "vapid": -2,
  "verdict": -1,
  "verdicts": -1,
  "vested": 1,
  "vexation": -2,
  "vexing": -2,
  "vibrant": 3,
  "vicious": -2,
  "victim": -3,
  "victimization": -3,
  "victimize": -3,
  "victimized": -3,
  "victimizes": -3,
  "victimizing": -3,
  "victims": -3,
  "victor": 3,
  "victories": 3,
  "victors": 3,
  "victory": 3,
  "vigilant": 3,
  "vigor": 3,
  "vile": -3,
  "vindicate": 2,
  "vindicated": 2,
  "vindicates": 2,
  "vindicating": 2,
  "violate": -2,
  "violated": -2,
  "violates": -2,
  "violating": -2,
  "violation": -2,
  "violations": -2,
  "violence": -3,
  "violence-related": -3,
  "violent": -3,
  "violently": -3,
  "virtuous": 2,
  "virulent": -2,
  "vision": 1,
  "visionary": 3,
  "visioning": 1,
  "visions": 1,
  "vitality": 3,
  "vitamin": 1,
  "vitriolic": -3,
  "vivacious": 3,
  "vividly": 2,
  "vociferous": -1,
  "vomit": -3,
  "vomited": -3,
  "vomiting": -3,
  "vomits": -3,
  "vulnerability": -2,
  "vulnerable": -2,
  "walkout": -2,
  "walkouts": -2,
  "wanker": -3,
  "want": 1,
  "war": -2,
  "warfare": -2,
  "warm": 1,
  "warmhearted": 2,
  "warmness": 2,
  "warmth": 2,
  "warn": -2,
  "warned": -2,
  "warning": -3,
  "warnings": -3,
  "warns": -2,
  "waste": -1,
  "wasted": -2,
  "wasting": -2,
  "wavering": -1,
  "weak": -2,
  "weakened": -2,
  "weakness": -2,
  "weaknesses": -2,
  "wealth": 3,
  "wealthier": 2,
  "wealthy": 2,
  "weary": -2,
  "weep": -2,
  "weeping": -2,
  "weird": -2,
  "welcome": 2,
  "welcomed": 2,
  "welcomes": 2,
  "well-being": 2,
  "well-championed": 3,
  "well-developed": 2,
  "well-established": 2,
  "well-focused": 2,
  "well-groomed": 2,
  "well-proportioned": 2,
  "whimsical": 1,
  "whitewash": -3,
  "whore": -4,
  "wicked": -2,
  "widowed": -1,
  "willingness": 2,
  "win": 4,
  "winner": 4,
  "winning": 4,
  "wins": 4,
  "winwin": 3,
  "wisdom": 1,
  "wish": 1,
  "wishes": 1,
  "wishing": 1,
  "withdrawal": -3,
  "wits": 2,
  "woebegone": -2,
  "woeful": -3,
  "won": 3,
  "wonderful": 4,
  "wonderfully": 4,
  "woo": 3,
  "woohoo": 3,
  "wooo": 4,
  "woow": 4,
  "worn": -1,
  "worried": -3,
  "worries": -3,
  "worry": -3,
  "worrying": -3,
  "worse": -3,
  "worsen": -3,
  "worsened": -3,
  "worsening": -3,
  "worsens": -3,
  "worshiped": 3,
  "worst": -3,
  "worth": 2,
  "worthless": -2,
  "worthy": 2,
  "wow": 4,
  "wowow": 4,
  "wowww": 4,
  "wrathful": -3,
  "wreck": -2,
  "wrenching": -2,
  "wrong": -2,
  "wrongdoing": -2,
  "wrongdoings": -2,
  "wronged": -2,
  "wrongful": -2,
  "wrongfully": -2,
  "wrongly": -2,
  "wtf": -4,
  "wtff": -4,
  "wtfff": -4,
  "xo": 3,
  "xoxo": 3,
  "xoxoxo": 4,
  "xoxoxoxo": 4,
  "yeah": 1,
  "yearning": 1,
  "yeees": 2,
  "yes": 1,
  "youthful": 2,
  "yucky": -2,
  "yummy": 3,
  "zealot": -2,
  "zealots": -2,
  "zealous": 2,
  "😠": -4,
  "😧": -4,
  "😲": 3,
  "😊": 3,
  "😰": -2,
  "😖": -2,
  "😕": -2,
  "😢": -2,
  "😿": -2,
  "😞": -2,
  "😥": -1,
  "😵": -1,
  "😑": 0,
  "😨": -2,
  "😳": -2,
  "😦": -1,
  "😬": -2,
  "😁": -1,
  "😀": 3,
  "😍": 4,
  "😻": 4,
  "😯": -1,
  "👿": -5,
  "😇": 4,
  "😂": 4,
  "😹": 4,
  "😗": 3,
  "😽": 3,
  "😚": 3,
  "😘": 4,
  "😙": 3,
  "😆": 1,
  "😷": -1,
  "😐": 0,
  "😶": 0,
  "😮": -2,
  "😔": -1,
  "😣": -2,
  "😾": -5,
  "😡": -5,
  "☺️": 3,
  "😌": 3,
  "😱": -4,
  "🙀": -4,
  "😴": 0,
  "😪": 0,
  "😄": 3,
  "😸": 3,
  "😃": 3,
  "😺": 3,
  "😈": -4,
  "😏": 3,
  "😼": 3,
  "😭": -4,
  "😛": 1,
  "😝": 0,
  "😜": -1,
  "😎": 1,
  "😓": -1,
  "😅": 3,
  "😫": -2,
  "😤": 5,
  "😒": -2,
  "😩": -2,
  "😉": 4,
  "😟": -4,
  "😋": 4,
  ":angry:": -4,
  ":anguished:": -4,
  ":astonished:": 3,
  ":blush:": 3,
  ":cold_sweat:": -2,
  ":confounded:": -2,
  ":confused:": -2,
  ":cry:": -2,
  ":crying_cat_face:": -2,
  ":disappointed:": -2,
  ":disappointed_relieved:": -1,
  ":dizzy_face:": -1,
  ":expressionless:": 0,
  ":fearful:": -2,
  ":flushed:": -2,
  ":frowning:": -1,
  ":grimacing:": -2,
  ":grin:": -1,
  ":grinning:": 3,
  ":heart_eyes:": 4,
  ":heart_eyes_cat:": 4,
  ":hushed:": -1,
  ":imp:": -5,
  ":innocent:": 4,
  ":joy:": 4,
  ":joy_cat:": 4,
  ":kissing:": 3,
  ":kissing_cat:": 3,
  ":kissing_closed_eyes:": 3,
  ":kissing_heart:": 4,
  ":kissing_smiling_eyes:": 3,
  ":laughing:": 1,
  ":mask:": -1,
  ":neutral_face:": 0,
  ":no_mouth:": 0,
  ":open_mouth:": -2,
  ":pensive:": -1,
  ":persevere:": -2,
  ":pouting_cat:": -5,
  ":rage:": -5,
  ":relaxed:": 3,
  ":relieved:": 3,
  ":scream:": -4,
  ":scream_cat:": -4,
  ":sleeping:": 0,
  ":sleepy:": 0,
  ":smile:": 3,
  ":smile_cat:": 3,
  ":smiley:": 3,
  ":smiley_cat:": 3,
  ":smiling_imp:": -4,
  ":smirk:": 3,
  ":smirk_cat:": 3,
  ":sob:": -4,
  ":stuck_out_tongue:": 1,
  ":stuck_out_tongue_closed_eyes:": 0,
  ":stuck_out_tongue_winking_eye:": -1,
  ":sunglasses:": 1,
  ":sweat:": -1,
  ":sweat_smile:": 3,
  ":tired_face:": -2,
  ":triumph:": 5,
  ":unamused:": -2,
  ":weary:": -2,
  ":wink:": 4,
  ":worried:": -4,
  ":yum:": 4,
  ">:(": -4,
  ">:[": -4,
  ">:-(": -4,
  ">:-[": -4,
  ">=(": -4,
  ">=[": -4,
  ">=-(": -4,
  ">=-[": -4,
  ":\")": 3,
  ":\"]": 3,
  ":\"D": 3,
  ":-\")": 3,
  ":-\"]": 3,
  ":-\"D": 3,
  "=\")": 3,
  "=\"]": 3,
  "=\"D": 3,
  "=-\")": 3,
  "=-\"]": 3,
  "=-\"D": 3,
  ":/": -2,
  ":\\": -2,
  ":-/": -2,
  ":-\\": -2,
  "=/": -2,
  "=\\": -2,
  "=-/": -2,
  "=-\\": -2,
  ":,(": -2,
  ":,[": -2,
  ":,|": -2,
  ":,-(": -2,
  ":,-[": -2,
  ":,-|": -2,
  ":'(": -2,
  ":'[": -2,
  ":'|": -2,
  ":'-(": -2,
  ":'-[": -2,
  ":'-|": -2,
  "=,(": -2,
  "=,[": -2,
  "=,|": -2,
  "=,-(": -2,
  "=,-[": -2,
  "=,-|": -2,
  "='(": -2,
  "='[": -2,
  "='|": -2,
  "='-(": -2,
  "='-[": -2,
  "='-|": -2,
  ":(": -1,
  ":[": -1,
  ":-(": -1,
  ":-[": -1,
  "=(": -1,
  "=[": -1,
  "=-(": -1,
  "=-[": -1,
  "]:(": -5,
  "]:[": -5,
  "]:-(": -5,
  "]:-[": -5,
  "]=(": -5,
  "]=[": -5,
  "]=-(": -5,
  "]=-[": -5,
  "o:)": 4,
  "o:]": 4,
  "o:D": 4,
  "o:-)": 4,
  "o:-]": 4,
  "o:-D": 4,
  "o=)": 4,
  "o=]": 4,
  "o=D": 4,
  "o=-)": 4,
  "o=-]": 4,
  "o=-D": 4,
  "O:)": 4,
  "O:]": 4,
  "O:D": 4,
  "O:-)": 4,
  "O:-]": 4,
  "O:-D": 4,
  "O=)": 4,
  "O=]": 4,
  "O=D": 4,
  "O=-)": 4,
  "O=-]": 4,
  "O=-D": 4,
  "0:)": 4,
  "0:]": 4,
  "0:D": 4,
  "0:-)": 4,
  "0:-]": 4,
  "0:-D": 4,
  "0=)": 4,
  "0=]": 4,
  "0=D": 4,
  "0=-)": 4,
  "0=-]": 4,
  "0=-D": 4,
  ":,)": 4,
  ":,]": 4,
  ":,D": 4,
  ":,-)": 4,
  ":,-]": 4,
  ":,-D": 4,
  ":')": 4,
  ":']": 4,
  ":'D": 4,
  ":'-)": 4,
  ":'-]": 4,
  ":'-D": 4,
  "=,)": 4,
  "=,]": 4,
  "=,D": 4,
  "=,-)": 4,
  "=,-]": 4,
  "=,-D": 4,
  "=')": 4,
  "=']": 4,
  "='D": 4,
  "='-)": 4,
  "='-]": 4,
  "='-D": 4,
  ":*": 3,
  ":-*": 3,
  "=*": 3,
  "=-*": 3,
  "x)": 1,
  "x]": 1,
  "xD": 1,
  "x-)": 1,
  "x-]": 1,
  "x-D": 1,
  "X)": 1,
  "X]": 1,
  "X-)": 1,
  "X-]": 1,
  "X-D": 1,
  ":|": 0,
  ":-|": 0,
  "=|": 0,
  "=-|": 0,
  ":-": 0,
  ":o": -2,
  ":O": -2,
  ":0": -2,
  ":-o": -2,
  ":-O": -2,
  ":-0": -2,
  "=o": -2,
  "=O": -2,
  "=0": -2,
  "=-o": -2,
  "=-O": -2,
  "=-0": -2,
  ":@": -5,
  ":-@": -5,
  "=@": -5,
  "=-@": -5,
  ":D": 3,
  ":-D": 3,
  "=D": 3,
  "=-D": 3,
  ":)": 3,
  ":]": 3,
  ":-)": 3,
  ":-]": 3,
  "=)": 3,
  "=]": 3,
  "=-)": 3,
  "=-]": 3,
  "]:)": -4,
  "]:]": -4,
  "]:D": -4,
  "]:-)": -4,
  "]:-]": -4,
  "]:-D": -4,
  "]=)": -4,
  "]=]": -4,
  "]=D": -4,
  "]=-)": -4,
  "]=-]": -4,
  "]=-D": -4,
  ":,'(": -4,
  ":,'[": -4,
  ":,'-(": -4,
  ":,'-[": -4,
  ":',(": -4,
  ":',[": -4,
  ":',-(": -4,
  ":',-[": -4,
  "=,'(": -4,
  "=,'[": -4,
  "=,'-(": -4,
  "=,'-[": -4,
  "=',(": -4,
  "=',[": -4,
  "=',-(": -4,
  "=',-[": -4,
  ":p": 1,
  ":P": 1,
  ":d": 1,
  ":-p": 1,
  ":-P": 1,
  ":-d": 1,
  "=p": 1,
  "=P": 1,
  "=d": 1,
  "=-p": 1,
  "=-P": 1,
  "=-d": 1,
  "xP": 0,
  "x-p": 0,
  "x-P": 0,
  "x-d": 0,
  "Xp": 0,
  "Xd": 0,
  "X-p": 0,
  "X-P": 0,
  "X-d": 0,
  ";p": -1,
  ";P": -1,
  ";d": -1,
  ";-p": -1,
  ";-P": -1,
  ";-d": -1,
  "8)": 1,
  "8]": 1,
  "8D": 1,
  "8-)": 1,
  "8-]": 1,
  "8-D": 1,
  "B)": 1,
  "B]": 1,
  "B-)": 1,
  "B-]": 1,
  "B-D": 1,
  ",:(": -1,
  ",:[": -1,
  ",:-(": -1,
  ",:-[": -1,
  ",=(": -1,
  ",=[": -1,
  ",=-(": -1,
  ",=-[": -1,
  "':(": -1,
  "':[": -1,
  "':-(": -1,
  "':-[": -1,
  "'=(": -1,
  "'=[": -1,
  "'=-(": -1,
  "'=-[": -1,
  ",:)": 3,
  ",:]": 3,
  ",:D": 3,
  ",:-)": 3,
  ",:-]": 3,
  ",:-D": 3,
  ",=)": 3,
  ",=]": 3,
  ",=D": 3,
  ",=-)": 3,
  ",=-]": 3,
  ",=-D": 3,
  "':)": 3,
  "':]": 3,
  "':D": 3,
  "':-)": 3,
  "':-]": 3,
  "':-D": 3,
  "'=)": 3,
  "'=]": 3,
  "'=D": 3,
  "'=-)": 3,
  "'=-]": 3,
  "'=-D": 3,
  ":$": -2,
  ":s": -2,
  ":z": -2,
  ":S": -2,
  ":Z": -2,
  ":-$": -2,
  ":-s": -2,
  ":-z": -2,
  ":-S": -2,
  ":-Z": -2,
  "=$": -2,
  "=s": -2,
  "=z": -2,
  "=S": -2,
  "=Z": -2,
  "=-$": -2,
  "=-s": -2,
  "=-z": -2,
  "=-S": -2,
  "=-Z": -2,
  ";)": 4,
  ";]": 4,
  ";D": 4,
  ";-)": 4,
  ";-]": 4,
  ";-D": 4
}

},{}],40:[function(require,module,exports){
'use strict';

var has = require('has');
var visit = require('unist-util-visit');
var nlcstToString = require('nlcst-to-string');
var polarities = require('./index.json');

module.exports = sentiment;

var NEUTRAL = 'neutral';
var POSITIVE = 'positive';
var NEGATIVE = 'negative';

/* Patch `polarity` and `valence` properties on nodes
 * with a value and word-nodes. Then, patch the same
 * properties on their parents. */
function sentiment(options) {
  return transformer;

  function transformer(node) {
    var concatenate = concatenateFactory();

    visit(node, any(options));
    visit(node, concatenate);

    concatenate.done();
  }
}

/* Factory to gather parents and patch them based on their
 * childrens directionality. */
function concatenateFactory() {
  var queue = [];

  concatenate.done = done;

  return concatenate;

  /* Gather a parent if not already gathered. */
  function concatenate(node, index, parent) {
    if (
      parent &&
      parent.type !== 'WordNode' &&
      queue.indexOf(parent) === -1
    ) {
      queue.push(parent);
    }
  }

  /* Patch all words in `parent`. */
  function one(node) {
    var children = node.children;
    var length = children.length;
    var polarity = 0;
    var index = -1;
    var child;
    var hasNegation;

    while (++index < length) {
      child = children[index];

      if (child.data && child.data.polarity) {
        polarity += (hasNegation ? -1 : 1) * child.data.polarity;
      }

      /* If the value is a word, remove any present
       * negation. Otherwise, add negation if the
       * node contains it. */
      if (child.type === 'WordNode') {
        if (hasNegation) {
          hasNegation = false;
        } else if (isNegation(child)) {
          hasNegation = true;
        }
      }
    }

    patch(node, polarity);
  }

  /* Patch all parents. */
  function done() {
    var length = queue.length;
    var index = -1;

    queue.reverse();

    while (++index < length) {
      one(queue[index]);
    }
  }
}

/* Factory to patch based on the bound `config`. */
function any(config) {
  return setter;

  /* Patch data-properties on `node`s with a value and words. */
  function setter(node) {
    var value;
    var polarity;

    if ('value' in node || node.type === 'WordNode') {
      value = nlcstToString(node);

      if (config && has(config, value)) {
        polarity = config[value];
      } else if (has(polarities, value)) {
        polarity = polarities[value];
      }

      if (polarity) {
        patch(node, polarity);
      }
    }
  }
}

/* Patch a `polarity` and valence property on `node`s. */
function patch(node, polarity) {
  var data = node.data || {};

  data.polarity = polarity || 0;
  data.valence = classify(polarity);

  node.data = data;
}

/* Detect if a value is used to negate something. */
function isNegation(node) {
  var value;

  value = nlcstToString(node).toLowerCase();

  if (
    value === 'not' ||
    value === 'neither' ||
    value === 'nor' ||
    /n['’]t/.test(value)
  ) {
    return true;
  }

  return false;
}

/* Classify, from a given `polarity` between `-5` and
 * `5`, if the polarity is `NEGATIVE` (negative),
 * `NEUTRAL` (0), or `POSITIVE` (positive). */
function classify(polarity) {
  if (polarity > 0) {
    return POSITIVE;
  }

  return polarity < 0 ? NEGATIVE : NEUTRAL;
}

},{"./index.json":39,"has":9,"nlcst-to-string":13,"unist-util-visit":49}],41:[function(require,module,exports){
'use strict';

var toString = require('nlcst-to-string');

module.exports = stringify;

function stringify() {
  this.Compiler = compiler;
}

function compiler(tree) {
  return toString(tree);
}

},{"nlcst-to-string":13}],42:[function(require,module,exports){
'use strict';

var unified = require('unified');
var latin = require('retext-latin');
var stringify = require('retext-stringify');

module.exports = unified()
  .use(latin)
  .use(stringify)
  .freeze();

},{"retext-latin":38,"retext-stringify":41,"unified":45}],43:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2016 Titus Wormer
 * @license MIT
 * @module trough
 * @fileoverview Middleware.  Inspired by `segmentio/ware`,
 *   but able to change the values from transformer to
 *   transformer.
 */

'use strict';

/* Expose. */
module.exports = trough;

/* Methods. */
var slice = [].slice;

/**
 * Create new middleware.
 *
 * @return {Object} - Middlewre.
 */
function trough() {
  var fns = [];
  var middleware = {};

  middleware.run = run;
  middleware.use = use;

  return middleware;

  /**
   * Run `fns`.  Last argument must be
   * a completion handler.
   *
   * @param {...*} input - Parameters
   */
  function run() {
    var index = -1;
    var input = slice.call(arguments, 0, -1);
    var done = arguments[arguments.length - 1];

    if (typeof done !== 'function') {
      throw new Error('Expected function as last argument, not ' + done);
    }

    next.apply(null, [null].concat(input));

    return;

    /**
     * Run the next `fn`, if any.
     *
     * @param {Error?} err - Failure.
     * @param {...*} values - Other input.
     */
    function next(err) {
      var fn = fns[++index];
      var params = slice.call(arguments, 0);
      var values = params.slice(1);
      var length = input.length;
      var pos = -1;

      if (err) {
        done(err);
        return;
      }

      /* Copy non-nully input into values. */
      while (++pos < length) {
        if (values[pos] === null || values[pos] === undefined) {
          values[pos] = input[pos];
        }
      }

      input = values;

      /* Next or done. */
      if (fn) {
        wrap(fn, next).apply(null, input);
      } else {
        done.apply(null, [null].concat(input));
      }
    }
  }

  /**
   * Add `fn` to the list.
   *
   * @param {Function} fn - Anything `wrap` accepts.
   */
  function use(fn) {
    if (typeof fn !== 'function') {
      throw new Error('Expected `fn` to be a function, not ' + fn);
    }

    fns.push(fn);

    return middleware;
  }
}

/**
 * Wrap `fn`.  Can be sync or async; return a promise,
 * receive a completion handler, return new values and
 * errors.
 *
 * @param {Function} fn - Thing to wrap.
 * @param {Function} next - Completion handler.
 * @return {Function} - Wrapped `fn`.
 */
function wrap(fn, next) {
  var invoked;

  return wrapped;

  function wrapped() {
    var params = slice.call(arguments, 0);
    var callback = fn.length > params.length;
    var result;

    if (callback) {
      params.push(done);
    }

    try {
      result = fn.apply(null, params);
    } catch (err) {
      /* Well, this is quite the pickle.  `fn` received
       * a callback and invoked it (thus continuing the
       * pipeline), but later also threw an error.
       * We’re not about to restart the pipeline again,
       * so the only thing left to do is to throw the
       * thing instea. */
      if (callback && invoked) {
        throw err;
      }

      return done(err);
    }

    if (!callback) {
      if (result && typeof result.then === 'function') {
        result.then(then, done);
      } else if (result instanceof Error) {
        done(result);
      } else {
        then(result);
      }
    }
  }

  /**
   * Invoke `next`, only once.
   *
   * @param {Error?} err - Optional error.
   */
  function done() {
    if (!invoked) {
      invoked = true;

      next.apply(null, arguments);
    }
  }

  /**
   * Invoke `done` with one value.
   * Tracks if an error is passed, too.
   *
   * @param {*} value - Optional value.
   */
  function then(value) {
    done(null, value);
  }
}

},{}],44:[function(require,module,exports){
/**
 * @author Titus Wormer
 * @copyright 2015 Titus Wormer
 * @license MIT
 * @module unherit
 * @fileoverview Create a custom constructor which can be modified
 *   without affecting the original class.
 */

'use strict';

/* Dependencies. */
var xtend = require('xtend');
var inherits = require('inherits');

/* Expose. */
module.exports = unherit;

/**
 * Create a custom constructor which can be modified
 * without affecting the original class.
 *
 * @param {Function} Super - Super-class.
 * @return {Function} - Constructor acting like `Super`,
 *   which can be modified without affecting the original
 *   class.
 */
function unherit(Super) {
  var result;
  var key;
  var value;

  inherits(Of, Super);
  inherits(From, Of);

  /* Clone values. */
  result = Of.prototype;

  for (key in result) {
    value = result[key];

    if (value && typeof value === 'object') {
      result[key] = 'concat' in value ? value.concat() : xtend(value);
    }
  }

  return Of;

  /**
   * Constructor accepting a single argument,
   * which itself is an `arguments` object.
   */
  function From(parameters) {
    return Super.apply(this, parameters);
  }

  /**
   * Constructor accepting variadic arguments.
   */
  function Of() {
    if (!(this instanceof Of)) {
      return new From(arguments);
    }

    return Super.apply(this, arguments);
  }
}

},{"inherits":10,"xtend":53}],45:[function(require,module,exports){
'use strict';

/* Dependencies. */
var has = require('has');
var extend = require('extend');
var bail = require('bail');
var vfile = require('vfile');
var trough = require('trough');
var string = require('x-is-string');
var func = require('x-is-function');
var plain = require('is-plain-obj');

/* Expose a frozen processor. */
module.exports = unified().freeze();

var slice = [].slice;

/* Process pipeline. */
var pipeline = trough().use(pipelineParse).use(pipelineRun).use(pipelineStringify);

function pipelineParse(p, ctx) {
  ctx.tree = p.parse(ctx.file);
}

function pipelineRun(p, ctx, next) {
  p.run(ctx.tree, ctx.file, done);

  function done(err, tree, file) {
    if (err) {
      next(err);
    } else {
      ctx.tree = tree;
      ctx.file = file;
      next();
    }
  }
}

function pipelineStringify(p, ctx) {
  ctx.file.contents = p.stringify(ctx.tree, ctx.file);
}

/* Function to create the first processor. */
function unified() {
  var attachers = [];
  var transformers = trough();
  var namespace = {};
  var frozen = false;
  var freezeIndex = -1;

  /* Data management. */
  processor.data = data;

  /* Lock. */
  processor.freeze = freeze;

  /* Plug-ins. */
  processor.attachers = attachers;
  processor.use = use;

  /* API. */
  processor.parse = parse;
  processor.stringify = stringify;
  processor.run = run;
  processor.runSync = runSync;
  processor.process = process;
  processor.processSync = processSync;

  /* Expose. */
  return processor;

  /* Create a new processor based on the processor
   * in the current scope. */
  function processor() {
    var destination = unified();
    var length = attachers.length;
    var index = -1;

    while (++index < length) {
      destination.use.apply(null, attachers[index]);
    }

    destination.data(extend(true, {}, namespace));

    return destination;
  }

  /* Freeze: used to signal a processor that has finished
   * configuration.
   *
   * For example, take unified itself.  It’s frozen.
   * Plug-ins should not be added to it.  Rather, it should
   * be extended, by invoking it, before modifying it.
   *
   * In essence, always invoke this when exporting a
   * processor. */
  function freeze() {
    var values;
    var plugin;
    var options;
    var transformer;

    if (frozen) {
      return processor;
    }

    while (++freezeIndex < attachers.length) {
      values = attachers[freezeIndex];
      plugin = values[0];
      options = values[1];
      transformer = null;

      if (options === false) {
        continue;
      }

      if (options === true) {
        values[1] = undefined;
      }

      transformer = plugin.apply(processor, values.slice(1));

      if (func(transformer)) {
        transformers.use(transformer);
      }
    }

    frozen = true;
    freezeIndex = Infinity;

    return processor;
  }

  /* Data management.
   * Getter / setter for processor-specific informtion. */
  function data(key, value) {
    if (string(key)) {
      /* Set `key`. */
      if (arguments.length === 2) {
        assertUnfrozen('data', frozen);

        namespace[key] = value;

        return processor;
      }

      /* Get `key`. */
      return (has(namespace, key) && namespace[key]) || null;
    }

    /* Set space. */
    if (key) {
      assertUnfrozen('data', frozen);
      namespace = key;
      return processor;
    }

    /* Get space. */
    return namespace;
  }

  /* Plug-in management.
   *
   * Pass it:
   * *   an attacher and options,
   * *   a preset,
   * *   a list of presets, attachers, and arguments (list
   *     of attachers and options). */
  function use(value) {
    var settings;

    assertUnfrozen('use', frozen);

    if (value === null || value === undefined) {
      /* Empty */
    } else if (func(value)) {
      addPlugin.apply(null, arguments);
    } else if (typeof value === 'object') {
      if ('length' in value) {
        addList(value);
      } else {
        addPreset(value);
      }
    } else {
      throw new Error('Expected usable value, not `' + value + '`');
    }

    if (settings) {
      namespace.settings = extend(namespace.settings || {}, settings);
    }

    return processor;

    function addPreset(result) {
      addList(result.plugins);

      if (result.settings) {
        settings = extend(settings || {}, result.settings);
      }
    }

    function add(value) {
      if (func(value)) {
        addPlugin(value);
      } else if (typeof value === 'object') {
        if ('length' in value) {
          addPlugin.apply(null, value);
        } else {
          addPreset(value);
        }
      } else {
        throw new Error('Expected usable value, not `' + value + '`');
      }
    }

    function addList(plugins) {
      var length;
      var index;

      if (plugins === null || plugins === undefined) {
        /* Empty */
      } else if (typeof plugins === 'object' && 'length' in plugins) {
        length = plugins.length;
        index = -1;

        while (++index < length) {
          add(plugins[index]);
        }
      } else {
        throw new Error('Expected a list of plugins, not `' + plugins + '`');
      }
    }

    function addPlugin(plugin, value) {
      var entry = find(plugin);

      if (entry) {
        if (plain(entry[1]) && plain(value)) {
          value = extend(entry[1], value);
        }

        entry[1] = value;
      } else {
        attachers.push(slice.call(arguments));
      }
    }
  }

  function find(plugin) {
    var length = attachers.length;
    var index = -1;
    var entry;

    while (++index < length) {
      entry = attachers[index];

      if (entry[0] === plugin) {
        return entry;
      }
    }
  }

  /* Parse a file (in string or VFile representation)
   * into a Unist node using the `Parser` on the
   * processor. */
  function parse(doc) {
    var file = vfile(doc);
    var Parser;

    freeze();
    Parser = processor.Parser;
    assertParser('parse', Parser);

    if (newable(Parser)) {
      return new Parser(String(file), file).parse();
    }

    return Parser(String(file), file); // eslint-disable-line new-cap
  }

  /* Run transforms on a Unist node representation of a file
   * (in string or VFile representation), async. */
  function run(node, file, cb) {
    assertNode(node);
    freeze();

    if (!cb && func(file)) {
      cb = file;
      file = null;
    }

    if (!cb) {
      return new Promise(executor);
    }

    executor(null, cb);

    function executor(resolve, reject) {
      transformers.run(node, vfile(file), done);

      function done(err, tree, file) {
        tree = tree || node;
        if (err) {
          reject(err);
        } else if (resolve) {
          resolve(tree);
        } else {
          cb(null, tree, file);
        }
      }
    }
  }

  /* Run transforms on a Unist node representation of a file
   * (in string or VFile representation), sync. */
  function runSync(node, file) {
    var complete = false;
    var result;

    run(node, file, done);

    assertDone('runSync', 'run', complete);

    return result;

    function done(err, tree) {
      complete = true;
      bail(err);
      result = tree;
    }
  }

  /* Stringify a Unist node representation of a file
   * (in string or VFile representation) into a string
   * using the `Compiler` on the processor. */
  function stringify(node, doc) {
    var file = vfile(doc);
    var Compiler;

    freeze();
    Compiler = processor.Compiler;
    assertCompiler('stringify', Compiler);
    assertNode(node);

    if (newable(Compiler)) {
      return new Compiler(node, file).compile();
    }

    return Compiler(node, file); // eslint-disable-line new-cap
  }

  /* Parse a file (in string or VFile representation)
   * into a Unist node using the `Parser` on the processor,
   * then run transforms on that node, and compile the
   * resulting node using the `Compiler` on the processor,
   * and store that result on the VFile. */
  function process(doc, cb) {
    freeze();
    assertParser('process', processor.Parser);
    assertCompiler('process', processor.Compiler);

    if (!cb) {
      return new Promise(executor);
    }

    executor(null, cb);

    function executor(resolve, reject) {
      var file = vfile(doc);

      pipeline.run(processor, {file: file}, done);

      function done(err) {
        if (err) {
          reject(err);
        } else if (resolve) {
          resolve(file);
        } else {
          cb(null, file);
        }
      }
    }
  }

  /* Process the given document (in string or VFile
   * representation), sync. */
  function processSync(doc) {
    var complete = false;
    var file;

    freeze();
    assertParser('processSync', processor.Parser);
    assertCompiler('processSync', processor.Compiler);
    file = vfile(doc);

    process(file, done);

    assertDone('processSync', 'process', complete);

    return file;

    function done(err) {
      complete = true;
      bail(err);
    }
  }
}

/* Check if `func` is a constructor. */
function newable(value) {
  return func(value) && keys(value.prototype);
}

/* Check if `value` is an object with keys. */
function keys(value) {
  var key;
  for (key in value) {
    return true;
  }
  return false;
}

/* Assert a parser is available. */
function assertParser(name, Parser) {
  if (!func(Parser)) {
    throw new Error('Cannot `' + name + '` without `Parser`');
  }
}

/* Assert a compiler is available. */
function assertCompiler(name, Compiler) {
  if (!func(Compiler)) {
    throw new Error('Cannot `' + name + '` without `Compiler`');
  }
}

/* Assert the processor is not frozen. */
function assertUnfrozen(name, frozen) {
  if (frozen) {
    throw new Error(
      'Cannot invoke `' + name + '` on a frozen processor.\n' +
      'Create a new processor first, by invoking it: ' +
      'use `processor()` instead of `processor`.'
    );
  }
}

/* Assert `node` is a Unist node. */
function assertNode(node) {
  if (!node || !string(node.type)) {
    throw new Error('Expected node, got `' + node + '`');
  }
}

/* Assert that `complete` is `true`. */
function assertDone(name, asyncName, complete) {
  if (!complete) {
    throw new Error('`' + name + '` finished async. Use `' + asyncName + '` instead');
  }
}

},{"bail":5,"extend":6,"has":9,"is-plain-obj":12,"trough":43,"vfile":50,"x-is-function":51,"x-is-string":52}],46:[function(require,module,exports){
'use strict';

var iterate = require('array-iterate');

module.exports = modifierFactory;

/* Turn `callback` into a child-modifier accepting a parent.
 * See `array-iterate` for more info. */
function modifierFactory(callback) {
  return iteratorFactory(wrapperFactory(callback));
}

/* Turn `callback` into a `iterator' accepting a parent. */
function iteratorFactory(callback) {
  return iterator;

  function iterator(parent) {
    var children = parent && parent.children;

    if (!children) {
      throw new Error('Missing children in `parent` for `modifier`');
    }

    return iterate(children, callback, parent);
  }
}

/* Pass the context as the third argument to `callback`. */
function wrapperFactory(callback) {
  return wrapper;

  function wrapper(value, index) {
    return callback(value, index, this);
  }
}

},{"array-iterate":4}],47:[function(require,module,exports){
'use strict';

var has = require('has');

module.exports = stringify;

function stringify(value) {
  /* Nothing. */
  if (!value || typeof value !== 'object') {
    return null;
  }

  /* Node. */
  if (has(value, 'position') || has(value, 'type')) {
    return location(value.position);
  }

  /* Location. */
  if (has(value, 'start') || has(value, 'end')) {
    return location(value);
  }

  /* Position. */
  if (has(value, 'line') || has(value, 'column')) {
    return position(value);
  }

  /* ? */
  return null;
}

function position(pos) {
  if (!pos || typeof pos !== 'object') {
    pos = {};
  }

  return index(pos.line) + ':' + index(pos.column);
}

function location(loc) {
  if (!loc || typeof loc !== 'object') {
    loc = {};
  }

  return position(loc.start) + '-' + position(loc.end);
}

function index(value) {
  return value && typeof value === 'number' ? value : 1;
}

},{"has":9}],48:[function(require,module,exports){
'use strict';

/* Expose. */
module.exports = visitorFactory;

/* Turns `callback` into a child-visitor accepting a parent. */
function visitorFactory(callback) {
  return visitor;

  /* Visit `parent`, invoking `callback` for each child. */
  function visitor(parent) {
    var index = -1;
    var children = parent && parent.children;

    if (!children) {
      throw new Error('Missing children in `parent` for `visitor`');
    }

    while (++index in children) {
      callback(children[index], index, parent);
    }
  }
}

},{}],49:[function(require,module,exports){
'use strict';

/* Expose. */
module.exports = visit;

/* Visit. */
function visit(tree, type, visitor, reverse) {
  if (typeof type === 'function') {
    reverse = visitor;
    visitor = type;
    type = null;
  }

  one(tree);

  return;

  /* Visit a single node. */
  function one(node, index, parent) {
    var result;

    index = index || (parent ? 0 : null);

    if (!type || node.type === type) {
      result = visitor(node, index, parent || null);
    }

    if (node.children && result !== false) {
      return all(node.children, node);
    }

    return result;
  }

  /* Visit children in `parent`. */
  function all(children, parent) {
    var step = reverse ? -1 : 1;
    var max = children.length;
    var min = -1;
    var index = (reverse ? max : min) + step;
    var child;

    while (index > min && index < max) {
      child = children[index];

      if (child && one(child, index, parent) === false) {
        return false;
      }

      index += step;
    }

    return true;
  }
}

},{}],50:[function(require,module,exports){
(function (process){
'use strict';

var path = require('path');
var has = require('has');
var replace = require('replace-ext');
var stringify = require('unist-util-stringify-position');
var buffer = require('is-buffer');
var string = require('x-is-string');

module.exports = VFile;

var proto = VFile.prototype;

proto.toString = toString;
proto.message = message;
proto.fail = fail;

/* Slight backwards compatibility.  Remove in the future. */
proto.warn = message;

/* Order of setting (least specific to most), we need this because
 * otherwise `{stem: 'a', path: '~/b.js'}` would throw, as a path
 * is needed before a stem can be set. */
var order = [
  'history',
  'path',
  'basename',
  'stem',
  'extname',
  'dirname'
];

/* Construct a new file. */
function VFile(options) {
  var prop;
  var index;
  var length;

  if (!options) {
    options = {};
  } else if (string(options) || buffer(options)) {
    options = {contents: options};
  } else if ('message' in options && 'messages' in options) {
    return options;
  }

  if (!(this instanceof VFile)) {
    return new VFile(options);
  }

  this.data = {};
  this.messages = [];
  this.history = [];
  this.cwd = process.cwd();

  /* Set path related properties in the correct order. */
  index = -1;
  length = order.length;

  while (++index < length) {
    prop = order[index];

    if (has(options, prop)) {
      this[prop] = options[prop];
    }
  }

  /* Set non-path related properties. */
  for (prop in options) {
    if (order.indexOf(prop) === -1) {
      this[prop] = options[prop];
    }
  }
}

/* Access full path (`~/index.min.js`). */
Object.defineProperty(proto, 'path', {
  get: function () {
    return this.history[this.history.length - 1];
  },
  set: function (path) {
    assertNonEmpty(path, 'path');

    if (path !== this.path) {
      this.history.push(path);
    }
  }
});

/* Access parent path (`~`). */
Object.defineProperty(proto, 'dirname', {
  get: function () {
    return string(this.path) ? path.dirname(this.path) : undefined;
  },
  set: function (dirname) {
    assertPath(this.path, 'dirname');
    this.path = path.join(dirname || '', this.basename);
  }
});

/* Access basename (`index.min.js`). */
Object.defineProperty(proto, 'basename', {
  get: function () {
    return string(this.path) ? path.basename(this.path) : undefined;
  },
  set: function (basename) {
    assertNonEmpty(basename, 'basename');
    assertPart(basename, 'basename');
    this.path = path.join(this.dirname || '', basename);
  }
});

/* Access extname (`.js`). */
Object.defineProperty(proto, 'extname', {
  get: function () {
    return string(this.path) ? path.extname(this.path) : undefined;
  },
  set: function (extname) {
    var ext = extname || '';

    assertPart(ext, 'extname');
    assertPath(this.path, 'extname');

    if (ext) {
      if (ext.charAt(0) !== '.') {
        throw new Error('`extname` must start with `.`');
      }

      if (ext.indexOf('.', 1) !== -1) {
        throw new Error('`extname` cannot contain multiple dots');
      }
    }

    this.path = replace(this.path, ext);
  }
});

/* Access stem (`index.min`). */
Object.defineProperty(proto, 'stem', {
  get: function () {
    return string(this.path) ? path.basename(this.path, this.extname) : undefined;
  },
  set: function (stem) {
    assertNonEmpty(stem, 'stem');
    assertPart(stem, 'stem');
    this.path = path.join(this.dirname || '', stem + (this.extname || ''));
  }
});

/* Get the value of the file. */
function toString(encoding) {
  var value = this.contents || '';
  return buffer(value) ? value.toString(encoding) : String(value);
}

/* Create a message with `reason` at `position`.
 * When an error is passed in as `reason`, copies the
 * stack.  This does not add a message to `messages`. */
function message(reason, position, ruleId) {
  var filePath = this.path;
  var range = stringify(position) || '1:1';
  var location;
  var err;

  location = {
    start: {line: null, column: null},
    end: {line: null, column: null}
  };

  if (position && position.position) {
    position = position.position;
  }

  if (position) {
    /* Location. */
    if (position.start) {
      location = position;
      position = position.start;
    } else {
      /* Position. */
      location.start = position;
    }
  }

  err = new VMessage(reason.message || reason);

  err.name = (filePath ? filePath + ':' : '') + range;
  err.file = filePath || '';
  err.reason = reason.message || reason;
  err.line = position ? position.line : null;
  err.column = position ? position.column : null;
  err.location = location;
  err.ruleId = ruleId || null;
  err.source = null;
  err.fatal = false;

  if (reason.stack) {
    err.stack = reason.stack;
  }

  this.messages.push(err);

  return err;
}

/* Fail. Creates a vmessage, associates it with the file,
 * and throws it. */
function fail() {
  var message = this.message.apply(this, arguments);

  message.fatal = true;

  throw message;
}

/* Inherit from `Error#`. */
function VMessagePrototype() {}
VMessagePrototype.prototype = Error.prototype;
VMessage.prototype = new VMessagePrototype();

/* Message properties. */
proto = VMessage.prototype;

proto.file = proto.name = proto.reason = proto.message = proto.stack = '';
proto.fatal = proto.column = proto.line = null;

/* Construct a new file message.
 *
 * Note: We cannot invoke `Error` on the created context,
 * as that adds readonly `line` and `column` attributes on
 * Safari 9, thus throwing and failing the data. */
function VMessage(reason) {
  this.message = reason;
}

/* Assert that `part` is not a path (i.e., does
 * not contain `path.sep`). */
function assertPart(part, name) {
  if (part.indexOf(path.sep) !== -1) {
    throw new Error('`' + name + '` cannot be a path: did not expect `' + path.sep + '`');
  }
}

/* Assert that `part` is not empty. */
function assertNonEmpty(part, name) {
  if (!part) {
    throw new Error('`' + name + '` cannot be empty');
  }
}

/* Assert `path` exists. */
function assertPath(path, name) {
  if (!path) {
    throw new Error('Setting `' + name + '` requires `path` to be set too');
  }
}

}).call(this,require('_process'))
},{"_process":2,"has":9,"is-buffer":11,"path":1,"replace-ext":37,"unist-util-stringify-position":47,"x-is-string":52}],51:[function(require,module,exports){
module.exports = function isFunction (fn) {
  return Object.prototype.toString.call(fn) === '[object Function]'
}

},{}],52:[function(require,module,exports){
var toString = Object.prototype.toString

module.exports = isString

function isString(obj) {
    return toString.call(obj) === "[object String]"
}

},{}],53:[function(require,module,exports){
module.exports = extend

var hasOwnProperty = Object.prototype.hasOwnProperty;

function extend() {
    var target = {}

    for (var i = 0; i < arguments.length; i++) {
        var source = arguments[i]

        for (var key in source) {
            if (hasOwnProperty.call(source, key)) {
                target[key] = source[key]
            }
        }
    }

    return target
}

},{}]},{},[3]);
