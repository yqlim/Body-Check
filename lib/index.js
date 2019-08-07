/*!
 * Validation
 * (c) 2019 Yong Quan Lim
 * Released under MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Validation = factory());
}(this, function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _newArrowCheck(innerThis, boundThis) {
    if (innerThis !== boundThis) {
      throw new TypeError("Cannot instantiate an arrow function");
    }
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
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

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  /**
   * Modified from MDN
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
   */
  function Object_assign_polyfill(target) {
    if (target === null || target === undefined) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    var to = Object(target);
    var len = arguments.length <= 1 ? 0 : arguments.length - 1;

    for (var i = 0; i < len; i++) {
      var obj = i + 1 < 1 || arguments.length <= i + 1 ? undefined : arguments[i + 1];

      if (obj !== null && obj !== undefined) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            to[key] = obj[key];
          }
        }
      }
    }

    return to;
  }

  var Object_assign = typeof Object.assign === 'function' ? Object.assign : Object_assign_polyfill;

  /**
   * Modified from MDN
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
   */
  function Object_entries_polyfill(obj) {
    var props = Object.keys(obj);
    var i = props.length;
    var ret = new Array(i);

    while (i--) {
      ret[i] = [props[i], obj[props[i]]];
    }

    return ret;
  }

  var Object_entries = typeof Object.entries === 'function' ? Object.entries : Object_entries_polyfill;

  /**
   * @this {Promise}
   */
  function finallyConstructor(callback) {
    var constructor = this.constructor;
    return this.then(function (value) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function () {
        return value;
      });
    }, function (reason) {
      // @ts-ignore
      return constructor.resolve(callback()).then(function () {
        // @ts-ignore
        return constructor.reject(reason);
      });
    });
  }

  // other code modifying setTimeout (like sinon.useFakeTimers())

  var setTimeoutFunc = setTimeout;

  function isArray(x) {
    return Boolean(x && typeof x.length !== 'undefined');
  }

  function noop() {} // Polyfill for Function.prototype.bind


  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }
  /**
   * @constructor
   * @param {Function} fn
   */


  function Promise$1(fn) {
    if (!(this instanceof Promise$1)) throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    /** @type {!number} */

    this._state = 0;
    /** @type {!boolean} */

    this._handled = false;
    /** @type {Promise|undefined} */

    this._value = undefined;
    /** @type {!Array<!Function>} */

    this._deferreds = [];
    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }

    if (self._state === 0) {
      self._deferreds.push(deferred);

      return;
    }

    self._handled = true;

    Promise$1._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;

      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }

      var ret;

      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }

      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');

      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;

        if (newValue instanceof Promise$1) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }

      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise$1._immediateFn(function () {
        if (!self._handled) {
          Promise$1._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }

    self._deferreds = null;
  }
  /**
   * @constructor
   */


  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }
  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */


  function doResolve(fn, self) {
    var done = false;

    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise$1.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise$1.prototype.then = function (onFulfilled, onRejected) {
    // @ts-ignore
    var prom = new this.constructor(noop);
    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise$1.prototype['finally'] = finallyConstructor;

  Promise$1.all = function (arr) {
    return new Promise$1(function (resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.all accepts an array'));
      }

      var args = Array.prototype.slice.call(arr);
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;

            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }

          args[i] = val;

          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise$1.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise$1) {
      return value;
    }

    return new Promise$1(function (resolve) {
      resolve(value);
    });
  };

  Promise$1.reject = function (value) {
    return new Promise$1(function (resolve, reject) {
      reject(value);
    });
  };

  Promise$1.race = function (arr) {
    return new Promise$1(function (resolve, reject) {
      if (!isArray(arr)) {
        return reject(new TypeError('Promise.race accepts an array'));
      }

      for (var i = 0, len = arr.length; i < len; i++) {
        Promise$1.resolve(arr[i]).then(resolve, reject);
      }
    });
  }; // Use polyfill for setImmediate for performance gains


  Promise$1._immediateFn = // @ts-ignore
  typeof setImmediate === 'function' && function (fn) {
    // @ts-ignore
    setImmediate(fn);
  } || function (fn) {
    setTimeoutFunc(fn, 0);
  };

  Promise$1._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  var Promise_constructor = typeof Promise === 'function' ? Promise : Promise$1;

  var Validation =
  /*#__PURE__*/
  function () {
    function Validation() {
      var cases = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, Validation);

      if (cases && !this.isObjectLiteral(cases)) {
        throw new TypeError('The "cases" parameter must be an object literal.');
      }

      this.cases = new Map();

      if (cases) {
        for (var key in cases) {
          this.addCase(key, cases[key]);
        }
      }
    }

    _createClass(Validation, [{
      key: "isObjectLiteral",
      value: function isObjectLiteral(value) {
        return value && value.constructor === Object;
      }
    }, {
      key: "isValidConfig",
      value: function isValidConfig(value) {
        return this.isObjectLiteral(value) && Object.prototype.hasOwnProperty.call(value, 'validator') && typeof value.validator === 'function';
      }
    }, {
      key: "hasCase",
      value: function hasCase(name) {
        return this.cases.has(name);
      }
    }, {
      key: "getCase",
      value: function getCase(name) {
        return this.cases.get(name);
      }
    }, {
      key: "addCase",
      value: function addCase(name, config) {
        if (this.hasCase(name)) {
          throw new SyntaxError("Case \"".concat(name, "\" has already been added."));
        }

        if (!this.isValidConfig(config)) {
          throw new TypeError('Validation config must be an object literal with "validator" property as a function.');
        }

        this.cases.set(name, config);
        return this;
      }
    }, {
      key: "editCase",
      value: function editCase(name, config) {
        if (!this.hasCase(name)) {
          throw new ReferenceError("Case \"".concat(name, "\" is not found."));
        }

        config = Object_assign({}, this.getCase(name), config);

        if (!this.isValidConfig(config)) {
          throw new TypeError('Validation config must be an object literal with "validator" property as a function.');
        }

        this.cases.set(name, config);
        return this;
      }
    }, {
      key: "removeCase",
      value: function removeCase(name) {
        return this.cases.delete(name);
      }
    }, {
      key: "clear",
      value: function clear() {
        return this.cases.clear();
      } // Cannot use async/await syntax
      // because it needs global-polluting polyfills using Babel.

    }, {
      key: "run",
      value: function run(values) {
        var _this = this;

        return new Promise_constructor(function (resolve, reject) {
          _newArrowCheck(this, _this);

          if (!this.isObjectLiteral(values)) {
            reject(new TypeError('The "values" parameter must be an object literal.'));
            return;
          }

          values = Object_entries(values);
          awaitRunner.call(this, values).then(resolve).catch(reject);

          function awaitRunner(valueSet) {
            var _this2 = this;

            var ret = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;
            var current = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;

            if (current >= valueSet.length) {
              return Promise_constructor.resolve(ret);
            }

            var _values$current = _slicedToArray(values[current], 2),
                name = _values$current[0],
                value = _values$current[1];

            var caseConfig = this.getCase(name);

            if (!caseConfig) {
              return Promise_constructor.reject(new ReferenceError("Value of \"".concat(name, "\" cannot be validated because its case is not found.")));
            }

            var validator = caseConfig.validator,
                context = caseConfig.context,
                _caseConfig$error = caseConfig.error,
                error = _caseConfig$error === void 0 ? "Validation for case \"".concat(name, "\" failed with this value: ").concat(value) : _caseConfig$error;
            var params;

            if (!Object.prototype.hasOwnProperty.call(caseConfig, 'params')) {
              params = [];
            } else if (Array.isArray(caseConfig.params)) {
              params = caseConfig.params;
            } else {
              return Promise_constructor.reject(new TypeError('The "params" property in validation config object, if exists, must be wrapped in an array.'));
            }

            return Promise_constructor.resolve(validator.call.apply(validator, [context, value].concat(_toConsumableArray(params)))).catch(Promise_constructor.reject.bind(Promise_constructor)).then(function (result) {
              _newArrowCheck(this, _this2);

              if (result !== true) {
                if (ret === true) {
                  ret = {};
                }

                ret[name] = typeof result === 'string' ? result : error;
              }

              return awaitRunner.call(this, valueSet, ret, current + 1);
            }.bind(this));
          }
        }.bind(this));
      }
    }, {
      key: "size",
      get: function get() {
        return this.cases.size;
      }
    }]);

    return Validation;
  }();

  return Validation;

}));
