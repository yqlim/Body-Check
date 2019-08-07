const assert = require('assert');
const Validation = require('./../lib');


describe('Validation', async function(){

  const validation = new Validation();

  beforeEach(function(){
    validation.clear();
  });

  it('should return error when validation fails.', function(){
    return validation
      .addCase('small', {
        validator: n => n < 10
      })
      .run({
        small: 10
      })
      .then(result => {
        assert.deepStrictEqual(typeof result.small, 'string');
        assert.deepStrictEqual(Object.entries(result).length, 1)
      });
  });

  it('should return custom default error on validation fail if one is provided.', function(){
    const error = 'Too big';
    return validation
      .addCase('big', {
        error,
        validator: n => n > 10
      })
      .run({
        big: 10
      })
      .then(result => {
        assert.deepStrictEqual(result.big, error);
        assert.deepStrictEqual(Object.entries(result).length, 1)
      });
  });

  it('should appropriately pass extra params to validator.', function(){
    return validation
      .addCase('normal', {
        validator: (_, n) => n === 10,
        params: [10]
      })
      .run({
        normal: 0
      })
      .then(result => {
        assert.deepStrictEqual(result.normal, void 0);
        assert.deepStrictEqual(Object.entries(result).length, 0)
      });
  });

  it('should return the value of validator if it is not true.', function(){
    const error = 'Custom error';
    return validation
      .addCase('wrong', {
        validator: () => error
      })
      .run({
        wrong: void 0
      })
      .then(result => {
        assert.deepStrictEqual(result.wrong, error);
        assert.deepStrictEqual(Object.entries(result).length, 1)
      });
  })

});
