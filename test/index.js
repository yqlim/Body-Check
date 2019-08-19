const chai = require('chai');
const expect = chai.expect;
chai.should();

const BodyCheck = require('./../lib');

const symbol = Symbol('symbol');
const cases = {
  defaultError: {
    validator: n => n < 10
  },
  customDefaultError: {
    validator: n => n > 10,
    error: 'Custom Default Error'
  },
  customError: {
    validator: (v = false) => v || 'Custom Error'
  },
  parameters: {
    validator: (v = false, a, b) => v || (a === b),
    params: [10, 10]
  },
  this: {
    validator: function(n){
      return this.valueOf() === n;
    },
    context: 10
  },
  [10]: {
    validator: (v = false) => v || true
  },
  [symbol]: {
    validator: (v = false) => v || true
  }
};

const basic = {
  cases,
  entries: Object.entries(cases),
  keys: Object.keys(cases),
  values: Object.values(cases),
  symbols: Object.getOwnPropertySymbols(cases),
  props: Object.keys(cases).concat(Object.getOwnPropertySymbols(cases)),
  get length(){
    return this.props.length;
  }
};


describe('BodyCheck', function(){

  describe('Constructor', function(){

    it('should create an instance without parameters.', function(){
      const instance = new BodyCheck();
      instance.should.be.instanceOf(BodyCheck);
    });

    it('should have property "cases" as a Map instance.', function(){
      const instance = new BodyCheck();
      instance.should.have.property('cases');
      instance.cases.should.be.instanceOf(Map);
    });

    it('should throw TypeError if parameter is truthy but not object literal.', function(){
      const create = function(){ return new BodyCheck(this) };
      const error = 'The "cases" parameter must be an object literal.';
      const runner = (...args) => {
        args.forEach(arg => {
          expect(create.bind(arg)).to.throw(TypeError, error);
        });
      }
      runner(
        1,
        '1',
        true,
        [],
        () => {},
        Symbol(),
        new BodyCheck()
      );
    });

    it('should appropriately add cases when passed in parameter.', function(){
      const instance = new BodyCheck(basic.cases);
      expect(instance.size).to.equal(basic.props.length);
      basic.props.forEach(prop => {
        expect(instance.getCase(prop)).to.not.equal(void 0);
      });
    });

  });

  describe('.cases', function(){

    const instance = new BodyCheck();
    const casesDescriptors = Object.getOwnPropertyDescriptors(instance).cases;

    it('should return a Map.', function(){
      instance.cases.should.be.an.instanceOf(Map);
    });

    it('should not be writable.', function(){
      expect(casesDescriptors.writable).to.equal(false);
    });

    it('should not be enumerable.', function(){
      expect(casesDescriptors.enumerable).to.equal(false);
    });

    it('should be configurable.', function(){
      expect(casesDescriptors.configurable).to.equal(true);
    });

  });

  describe('.size', function(){

    const instance = new BodyCheck();

    let i = 0;

    it('should return correct size on init.', function(){
      expect(instance.size).to.equal(i);
    });

    it('should return correct size after adding new cases.', function(){
      instance.addCase(i++, { validator: () => {} });
      expect(instance.size).to.equal(i);
      instance.addCase(i++, { validator: () => {} });
      expect(instance.size).to.equal(i);
    });

    it('should return correct size after edtting cases.', function(){
      instance.editCase(--i, { error: 'ok' });
      expect(instance.size).to.equal(++i);
    });

    it('should return correct size after removing cases.', function(){
      instance.removeCase(--i);
      expect(instance.size).to.equal(i);
      instance.removeCase(--i);
      expect(instance.size).to.equal(i);
    });

  });

  describe('.isObjectLiteral', function(){

    it('should return false if value is not object literal.', function(){
      const instance = new BodyCheck();
      const run = value => instance.isObjectLiteral(value);
      const runner = (...args) => {
        args.forEach(([value, expected]) => {
          expect(run(value)).to.equal(expected);
        });
      };
      runner(
        [{}, true],
        [[], false],
        [true, false],
        [1, false],
        [Symbol(), false],
        ['ok', false],
        [() => {}, false],
        [instance, false],
        [null, false],
        [void 0, false]
      );
    });

  });

  describe('.isValidConfig', function(){

    const instance = new BodyCheck();
    const run = value => instance.isValidConfig(value);
    const runner = (...args) => {
      args.forEach(([value, expected]) => {
        expect(run(value)).to.equal(expected);
      });
    };

    it('should return false if value is not object literal.', function(){
      runner(
        [[], false],
        [true, false],
        [1, false],
        [Symbol(), false],
        ['ok', false],
        [() => {}, false],
        [instance, false],
        [null, false],
        [void 0, false]
      );
    });

    it('should return false if object does not have own property "validator" as function.', function(){
      runner(
        [{}, false],
        [{ validator: {} }, false],
        [{ validator: [] }, false],
        [{ validator: true }, false],
        [{ validator: 1 }, false],
        [{ validator: 'ok' }, false],
        [{ validator: instance }, false],
        [{ validator: Symbol() }, false],
        [{ validator: null }, false],
        [{ validator: void 0 }, false],
        [{ validator: () => {} }, true]
      )
    });

    it('should return false if object has a defined "params" property but its value is not an array.', function(){
      const base = { validator: () => {} };
      const create = params => Object.assign({}, base, { params });
      runner(
        [create({}), false],
        [create([]), true],
        [create(true), false],
        [create(1), false],
        [create('ok'), false],
        [create(instance), false],
        [create(Symbol()), false],
        [create(null), false],
        [create(void 0), true],
        [create(() => {}), false]
      )
    });

  });

  describe('.hasCase', function(){
    
    const instance = new BodyCheck(basic.cases);

    it('should return true if case name is found.', function(){
      basic.props.forEach(prop => {
        expect(instance.hasCase(prop)).to.equal(true);
      });
    });

    it('should return false if case name is not found.', function(){
      expect(instance.hasCase('any')).to.equal(false);
    });

  });

  describe('.getCase', function(){

    const instance = new BodyCheck(basic.cases);

    it('should return appropriately if case name is found.', function(){
      basic.props.forEach(prop => {
        instance.getCase(prop).should.deep.equal(basic.cases[prop]);
      });
    });

    it('should return void if case name is not found.', function(){
      expect(instance.getCase('any')).to.equal(void 0);
    });

  });

  describe('.addCase', function(){

    const instance = new BodyCheck();
    const string = 'string';
    const symbol = Symbol('symbol');
    const config = { validator(){} };
    const cases = [
      [string, config],
      [symbol, config]
    ];

    afterEach(function(){
      instance.clear();
    });

    it('should throw TypeError if case name is duplicated.', function(){
      cases.forEach(([key, val]) => {
        instance.addCase(key, val);
        const run = instance.addCase.bind(instance, key, val);
        expect(run).to.throw(TypeError, /has already been added/);
      });
    });

    it('should throw TypeError if case config is not valid.', function(){
      const config = [
        {},
        [],
        { validator: 1 }
      ]

      config.forEach((val, key) => {
        const run = instance.addCase.bind(instance, key, val);
        expect(run).to.throw(TypeError, /must be an object literal/);
      });
    });

    it('should be chainable.', function(){
      instance
        .addCase('a', config)
        .addCase('symbol', config);

      expect(instance.size).to.equal(2);
    });

  });

  describe('.editCase', function(){

    const instance = new BodyCheck();

    afterEach(function(){
      instance.clear();
    });

    it('should throw ReferenceError if case is not found.', function(){
      const run = instance.editCase.bind(instance, 'any', basic.values[0]);
      expect(run).to.throw(ReferenceError, /is not found/);
    });

    it('should throw TypeError if paramter[1] is not object literal.', function(){
      const values = [
        [],
        true,
        1,
        'ok',
        instance,
        Symbol(),
        null,
        void 0,
        () => {}
      ];

      const caseName = 'example';
      instance.addCase(caseName, { validator: () => {} });

      values.forEach(value => {
        const run = instance.editCase.bind(instance, caseName, value);
        expect(run).to.throw(TypeError, 'The "config" parameter must be an object literal.');
      });
    });

    it('should throw TypeError if case config becomes invalid.', function(){
      instance.addCase(...basic.entries[0])
      const run = instance.editCase.bind(instance, basic.keys[0], { validator: 1 });
      expect(run).to.throw(TypeError, /"validator" property as a function/);
    });

    it('should appropriately edit config object.', async function(){
      let result;

      const name = 'name';
      const value = { [name]: 10 };

      instance.addCase(name, { validator: n => n < 10 });
      result = await instance.run(value);
      expect(result).to.have.property(name);

      instance.editCase(name, { validator: n => n === 10 });
      result = await instance.run(value);
      expect(result).to.equal(true);

      return;
    });

    it('should not mutate original object.', function(){

      const name = 'name';
      const testVal = 10;
      const original = {
        validator: (_, n) => n < 10,
        params: [testVal]
      };

      instance.addCase(name, original);
      instance.editCase(name, { params: [1] });

      expect(original.params[0]).to.equal(testVal);

    });

  });

  describe('.removeCase', function(){

    const name = 'name';
    const config = { validator(){} };
    const instance = new BodyCheck({
      [name]: config
    });

    it('should appropriately remove case.', function(){
      instance.removeCase(name);
      expect(instance.size).to.equal(0);
      expect(instance.hasCase(name)).to.equal(false);
    });

  });

  describe('.clear', function(){

    const instance = new BodyCheck(basic.cases);

    it('should appropriately clear all cases.', function(){
      instance.clear();
      expect(instance.size).to.equal(0);
      basic.props.forEach(prop => {
        expect(instance.hasCase(prop)).to.equal(false);
      });
    });

  });

  describe('.run', function(){

    const instance = new BodyCheck(basic.cases);

    let result;

    afterEach(function(){
      result = void 0;
    });

    it('should return a Promise.', function(){
      instance.run({}).should.be.an.instanceOf(Promise);
    });

    it('should be rejected with a TypeError if values are not object literal.', async function(){

      const values = [
        [],
        true,
        1,
        '1',
        Symbol(1),
        () => {},
        void 0,
        null,
        instance
      ];
      
      for (const val of values){
        try {
          result = await instance.run(val)
        } catch(err){
          result = err;
        } finally {
          expect(result).to.be.instanceOf(TypeError, /must be an object literal/);
        }
      }

    });

    it('should be rejected with a ReferenceError if case is not found.', async function(){
      try {
        result = await instance.run({
          any: 'any'
        });
      } catch(err){
        result = err;
      } finally {
        expect(result).to.be.instanceOf(ReferenceError, /case is not found/);
        return;
      }
    });
    
    it('should be resolved to true if all values passed the validation.', async function(){
      const valueSet = {
        defaultError: 9,
        customDefaultError: 11,
        customError: true,
        parameters: true,
        this: 10,
        10: false,
        [symbol]: false
      }
      try {
        result = await instance.run(valueSet);
      } catch(err){
        result = err;
      } finally {
        expect(result).to.equal(true);
        return;
      }
    });

    it('should return an object with respective case name as properties and value as error message.', async function(){
      const valueSet = {
        defaultError: 10,
        customDefaultError: 10,
        customError: false,
        parameters: 'true',
        this: '10',
        10: 'false',
        [symbol]: 'false'
      }
      try {
        result = await instance.run(valueSet);
      } catch(err){
        result = err;
      } finally {
        basic.symbols.forEach(symbol => {
          expect(Object.getOwnPropertySymbols(result)).to.include(symbol);
        });
        basic.keys.forEach(key => {
          expect(result).to.have.own.property(key);
          switch(key){
            case 'defaultError':
            case 'this':
              expect(result[key]).to.match(/failed with this value\:/);
              break;
            case 'customDefaultError':
              expect(result[key]).to.equal(basic.cases.customDefaultError.error);
              break;
            case 'customError':
              expect(result[key]).to.equal(basic.cases.customError.validator());
              break;
            case 'parameters':
            default:
              expect(result[key]).to.equal(valueSet[key]);
          }
        });
        return;
      }
    });

    it('should be rejected with whatever exception thrown by validator.', async function(){
      const randomError = new Error('Any error');
      const instance = new BodyCheck({
        throw: {
          validator: () => { throw randomError }
        }
      });
      try {
        result = await instance.run({ throw: 'any' });
      } catch(err){
        result = err;
      } finally {
        expect(result).to.equal(randomError);
        return;
      }
    });

  });

  describe('.runSync', function(){

    const instance = new BodyCheck(basic.cases);

    let result;

    afterEach(function(){
      result = void 0;
    });

    it('should throw if values are not object literal.', function(){

      const values = [
        [],
        true,
        1,
        '1',
        Symbol(1),
        () => {},
        void 0,
        null,
        instance
      ];

      for (const val of values){
        expect(instance.runSync.bind(instance, val)).to.throw(TypeError, /must be an object literal/);
      }

    });

    it('should throw if case is not found.', function(){
      expect(instance.runSync.bind(instance, { any: 'any' }))
        .to
        .throw(ReferenceError, /case is not found/);
    });

    it('should return true if all values passed the validation.', function(){

      const valueSet = {
        defaultError: 9,
        customDefaultError: 11,
        customError: true,
        parameters: true,
        this: 10,
        10: false,
        [symbol]: false
      }

      expect(instance.runSync(valueSet)).to.equal(true);

    });

    it('should return an object with respective case name as properties and value as error message.', function(){

      const valueSet = {
        defaultError: 10,
        customDefaultError: 10,
        customError: false,
        parameters: 'true',
        this: '10',
        10: 'false',
        [symbol]: 'false'
      }

      const result = instance.runSync(valueSet);

      basic.symbols.forEach(symbol => {
        expect(Object.getOwnPropertySymbols(result)).to.include(symbol);
      });

      basic.keys.forEach(key => {
        expect(result).to.have.own.property(key);
        switch(key){
          case 'defaultError':
          case 'this':
            expect(result[key]).to.match(/failed with this value\:/);
            break;
          case 'customDefaultError':
            expect(result[key]).to.equal(basic.cases.customDefaultError.error);
            break;
          case 'customError':
            expect(result[key]).to.equal(basic.cases.customError.validator());
            break;
          case 'parameters':
          default:
            expect(result[key]).to.equal(valueSet[key]);
        }
      });

    });

    it('should be thrown with whatever exception thrown by validator.', function(){
      const randomError = new Error('Any error');
      const instance = new BodyCheck({
        throw: {
          validator: () => { throw randomError }
        }
      });

      expect(instance.runSync.bind(instance, { throw: 'any' }))
        .to
        .throw(randomError);
    });

  });

});
