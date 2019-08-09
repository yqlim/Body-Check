import Object_assign from './ponyfills/Object_assign';
import Object_getOwnPropertySymbols from './ponyfills/Object_getOwnPropertySymbols';
import Promise_constructor from './ponyfills/Promise_constructor';


class BodyCheck {

  constructor(cases = {}){
    if (cases && !this.isObjectLiteral(cases)){
      throw new TypeError('The "cases" parameter must be an object literal.');
    }

    // If you need to change this, you have to deliberately redefine its descriptor.
    Object.defineProperty(this, 'cases', {
      value: new Map(),
      configurable: true
    });

    if (cases){
      for (const key in cases){
        this.addCase(key, cases[key]);
      }
      Object_getOwnPropertySymbols(cases).forEach(symbol => {
        this.addCase(symbol, cases[symbol]);
      });
    }
  }

  get size(){
    return this.cases.size;
  }

  isObjectLiteral(value){
    return !!value && value.constructor === Object;
  }

  isValidConfig(value){
    if (!this.isObjectLiteral(value))
      return false;

    if (!Object.prototype.hasOwnProperty.call(value, 'validator'))
      return false;

    if (typeof value.validator !== 'function')
      return false;

    if (Object.prototype.hasOwnProperty.call(value, 'params') && value.params !== void 0)
      if (!Array.isArray(value.params))
        return false;

    return true;
  }

  hasCase(name){
    return this.cases.has(name);
  }

  getCase(name){
    return this.cases.get(name);
  }

  addCase(name, config){
    if (this.hasCase(name)){
      throw new TypeError(`Case "${name.toString()}" has already been added.`);
    }

    if (!this.isValidConfig(config)){
      throw new TypeError('BodyCheck config must be an object literal with "validator" property as a function.');
    }

    this.cases.set(name, config);
    return this;
  }

  editCase(name, config){
    if (!this.hasCase(name)){
      throw new ReferenceError(`Case "${name.toString()}" is not found.`);
    }

    if (!this.isObjectLiteral(config)){
      throw new TypeError(`The "config" parameter must be an object literal.`);
    }

    config = Object_assign({}, this.getCase(name), config);

    if (!this.isValidConfig(config)){
      throw new TypeError('BodyCheck config must be an object literal with "validator" property as a function.');
    }

    this.cases.set(name, config);
    return this;
  }

  removeCase(name){
    return this.cases.delete(name);
  }

  clear(){
    return this.cases.clear();
  }

  // Cannot use async/await syntax
  // because it needs global-polluting polyfills using Babel.
  run(values){
    return new Promise_constructor((resolve, reject) => {

      if (!this.isObjectLiteral(values)){
        reject(new TypeError('The "values" parameter must be an object literal.'));
        return;
      }

      const props = Object.keys(values).concat(Object_getOwnPropertySymbols(values));
      const entries = props.map(prop => [prop, values[prop]]);

      awaitRunner(this, entries)
        .then(resolve)
        .catch(reject);

      function awaitRunner(instance, valueSet, ret = true, current = 0){
        if (current >= valueSet.length){
          return Promise_constructor.resolve(ret);
        }

        const [name, value] = valueSet[current];
        const caseConfig = instance.getCase(name);

        if (caseConfig === void 0){
          return Promise_constructor.reject(new ReferenceError(`Value of "${name.toString()}" cannot be validated because its case is not found.`));
        }

        const {
          validator,
          context,
          params = [],
          error = `Validation for case "${name.toString()}" failed with this value: ${value.toString()}`
        } = caseConfig;

        return Promise_constructor
          .resolve(validator.call(context, value, ...params))
          .catch(Promise_constructor.reject.bind(Promise_constructor))
          .then(result => {
            if (result !== true){
              if (ret === true){
                ret = {};
              }
              ret[name] = 
                typeof result === 'string'
                  ? result
                  : error;
            }
            return awaitRunner(instance, valueSet, ret, current + 1);
          });
      }

    });
  }

}


export default BodyCheck;
