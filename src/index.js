import Object_assign from './ponyfills/Object_assign';
import Object_entries from './ponyfills/Object_entries';
import Promise_constructor from './ponyfills/Promise_constructor';


class Validation {

  constructor(cases = {}){
    if (cases && !this.isObjectLiteral(cases)){
      throw new TypeError('The "cases" parameter must be an object literal.');
    }

    this.cases = new Map();

    if (cases){
      for (const key in cases){
        this.addCase(key, cases[key]);
      }
    }
  }

  get size(){
    return this.cases.size;
  }

  isObjectLiteral(value){
    return value && value.constructor === Object;
  }

  isValidConfig(value){
    return this.isObjectLiteral(value)
        && Object.prototype.hasOwnProperty.call(value, 'validator')
        && typeof value.validator === 'function';
  }

  hasCase(name){
    return this.cases.has(name);
  }

  getCase(name){
    return this.cases.get(name);
  }

  addCase(name, config){
    if (this.hasCase(name)){
      throw new SyntaxError(`Case "${name}" has already been added.`);
    }

    if (!this.isValidConfig(config)){
      throw new TypeError('Validation config must be an object literal with "validator" property as a function.');
    }

    this.cases.set(name, config);
    return this;
  }

  editCase(name, config){
    if (!this.hasCase(name)){
      throw new ReferenceError(`Case "${name}" is not found.`);
    }

    config = Object_assign({}, this.getCase(name), config);

    if (!this.isValidConfig(config)){
      throw new TypeError('Validation config must be an object literal with "validator" property as a function.');
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

      values = Object_entries(values);

      awaitRunner
        .call(this, values)
        .then(resolve)
        .catch(reject);

      function awaitRunner(valueSet, ret = true, current = 0){
        if (current >= valueSet.length){
          return Promise_constructor.resolve(ret);
        }

        const [name, value] = values[current];
        const caseConfig = this.getCase(name);

        if (!caseConfig){
          return Promise_constructor.reject(new ReferenceError(`Value of "${name}" cannot be validated because its case is not found.`));
        }

        const {
          validator,
          context,
          error = `Validation for case "${name}" failed with this value: ${value}`
        } = caseConfig;

        let params;

        if (!Object.prototype.hasOwnProperty.call(caseConfig, 'params')){
          params = [];
        } else if (Array.isArray(caseConfig.params)) {
          params = caseConfig.params;
        } else {
          return Promise_constructor.reject(new TypeError('The "params" property in validation config object, if exists, must be wrapped in an array.'));
        }

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
            return awaitRunner.call(this, valueSet, ret, current + 1);
          });
      }

    })
  }

}


export default Validation;
