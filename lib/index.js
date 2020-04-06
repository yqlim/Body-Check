/*!
 * BodyCheck
 * (c) 2019 Yong Quan Lim
 * Released under MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.BodyCheck = factory());
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

  function Object_getOwnPropertySymbols(obj) {
    return typeof Object.getOwnPropertySymbols !== 'function' ? [] : Object.getOwnPropertySymbols(obj);
  }

  var BodyCheck =
  /*#__PURE__*/
  function () {
    function BodyCheck() {
      var _this = this;

      var cases = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

      _classCallCheck(this, BodyCheck);

      if (cases && !this.isObjectLiteral(cases)) {
        throw new TypeError('The "cases" parameter must be an object literal.');
      } // If you need to change this, you have to deliberately redefine its descriptor.


      Object.defineProperty(this, 'cases', {
        value: new Map(),
        configurable: true
      });

      if (cases) {
        for (var key in cases) {
          this.addCase(key, cases[key]);
        }

        Object_getOwnPropertySymbols(cases).forEach(function (symbol) {
          _newArrowCheck(this, _this);

          this.addCase(symbol, cases[symbol]);
        }.bind(this));
      }
    }

    _createClass(BodyCheck, [{
      key: "isObjectLiteral",
      value: function isObjectLiteral(value) {
        return !!value && value.constructor === Object;
      }
    }, {
      key: "isValidConfig",
      value: function isValidConfig(value) {
        if (!this.isObjectLiteral(value)) return false;
        if (!Object.prototype.hasOwnProperty.call(value, 'validator')) return false;
        if (typeof value.validator !== 'function') return false;
        if (Object.prototype.hasOwnProperty.call(value, 'params') && value.params !== void 0) if (!Array.isArray(value.params)) return false;
        return true;
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
          throw new TypeError("Case \"".concat(name.toString(), "\" has already been added."));
        }

        if (!this.isValidConfig(config)) {
          throw new TypeError('BodyCheck config must be an object literal with "validator" property as a function.');
        }

        this.cases.set(name, config);
        return this;
      }
    }, {
      key: "editCase",
      value: function editCase(name, config) {
        if (!this.hasCase(name)) {
          throw new ReferenceError("Case \"".concat(name.toString(), "\" is not found."));
        }

        if (!this.isObjectLiteral(config)) {
          throw new TypeError("The \"config\" parameter must be an object literal.");
        }

        config = Object_assign({}, this.getCase(name), config);

        if (!this.isValidConfig(config)) {
          throw new TypeError('BodyCheck config must be an object literal with "validator" property as a function.');
        }

        this.cases.set(name, config);
        return this;
      }
    }, {
      key: "removeCase",
      value: function removeCase(name) {
        return this.cases["delete"](name);
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
        var _this2 = this;

        return new Promise(function (resolve, reject) {
          var _this3 = this;

          _newArrowCheck(this, _this2);

          if (!this.isObjectLiteral(values)) {
            reject(new TypeError('The "values" parameter must be an object literal.'));
            return;
          }

          var props = Object.keys(values).concat(Object_getOwnPropertySymbols(values));
          var entries = props.map(function (prop) {
            _newArrowCheck(this, _this3);

            return [prop, values[prop]];
          }.bind(this));
          awaitRunner(this, entries).then(resolve)["catch"](reject);

          function awaitRunner(instance, valueSet) {
            var _this4 = this;

            var ret = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
            var current = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;

            if (current >= valueSet.length) {
              return Promise.resolve(ret);
            }

            var _valueSet$current = _slicedToArray(valueSet[current], 2),
                name = _valueSet$current[0],
                value = _valueSet$current[1];

            var caseConfig = instance.getCase(name);

            if (caseConfig === void 0) {
              return Promise.reject(new ReferenceError("Value of \"".concat(name.toString(), "\" cannot be validated because its case is not found.")));
            }

            var validator = caseConfig.validator,
                context = caseConfig.context,
                _caseConfig$params = caseConfig.params,
                params = _caseConfig$params === void 0 ? [] : _caseConfig$params,
                _caseConfig$error = caseConfig.error,
                error = _caseConfig$error === void 0 ? "Validation for case \"".concat(name.toString(), "\" failed with this value: ").concat(value.toString()) : _caseConfig$error;
            return Promise.resolve(validator.call.apply(validator, [context, value].concat(_toConsumableArray(params))))["catch"](Promise.reject.bind(Promise)).then(function (result) {
              _newArrowCheck(this, _this4);

              if (result !== true) {
                if (ret === true) {
                  ret = {};
                }

                ret[name] = typeof result === 'string' ? result : error;
              }

              return awaitRunner(instance, valueSet, ret, current + 1);
            }.bind(this));
          }
        }.bind(this));
      }
    }, {
      key: "runSync",
      value: function runSync(values) {
        var _this5 = this;

        if (!this.isObjectLiteral(values)) {
          throw new TypeError('The "values" parameter must be an object literal.');
        }

        var props = Object.keys(values).concat(Object_getOwnPropertySymbols(values));
        var entries = props.map(function (prop) {
          _newArrowCheck(this, _this5);

          return [prop, values[prop]];
        }.bind(this));
        var ret = true;
        var taskLength = entries.length;

        for (var i = 0; i < taskLength; i++) {
          var _entries$i = _slicedToArray(entries[i], 2),
              name = _entries$i[0],
              value = _entries$i[1];

          var caseConfig = this.getCase(name);

          if (caseConfig === void 0) {
            throw new ReferenceError("Value of \"".concat(name.toString(), "\" cannot be validated because its case is not found."));
          }

          var validator = caseConfig.validator,
              context = caseConfig.context,
              _caseConfig$params2 = caseConfig.params,
              params = _caseConfig$params2 === void 0 ? [] : _caseConfig$params2,
              _caseConfig$error2 = caseConfig.error,
              error = _caseConfig$error2 === void 0 ? "Validation for case \"".concat(name.toString(), "\" failed with this value: ").concat(value.toString()) : _caseConfig$error2;
          var result = validator.call.apply(validator, [context, value].concat(_toConsumableArray(params)));

          if (result !== true) {
            if (ret === true) {
              ret = {};
            }

            ret[name] = typeof result === 'string' ? result : error;
          }
        }

        return ret;
      }
    }, {
      key: "size",
      get: function get() {
        return this.cases.size;
      }
    }]);

    return BodyCheck;
  }();

  return BodyCheck;

}));
