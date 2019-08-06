import './polyfills/object_assign';


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

    config = Object.assign({}, this.getCase(name), config);

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

  run(values){
    return new Promise(async (resolve, reject) => {

      if (!this.isObjectLiteral(values)){
        reject(new TypeError('The "values" parameter must be an object literal.'));
        return;
      }

      const ret = {};

      for (const name in values){
        const caseConfig = this.getCase(name);

        if (!caseConfig){
          reject(new ReferenceError(`Value of "${name}" cannot be validated because its case is not found.`));
          return;
        }

        const value = values[name];
        const {
          validator,
          error = `Validation for case "${name}" failed with this value: ${value}`,
          params = [],
          context
        } = caseConfig;

        const result = await validator.call(context, value, ...params);

        if (result !== true){
          if (!ret.error){
            ret.error = {};
          }
          ret.error[name] = 
            typeof result === 'string'
              ? result
              : error;
        }
      }

      resolve(ret);

    });
  }

}


export default Validation;
