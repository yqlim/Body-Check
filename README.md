# BodyCheck <!-- omit in toc -->

1. [Overview](#overview)
2. [Support](#support)
3. [Install](#install)
4. [Usage](#usage)
5. [Types](#types)
6. [API](#api)
   1. [Constructor](#constructor)
   2. [Methods](#methods)
   3. [Properties](#properties)

## Overview

This package provides a tool for you to flexibly define cases for validating request body.

This can be especially useful when you need to validate user input in the server or form values in the browser.

This package is inspired by [Vue](https://vuejs.org)'s [prop validation](https://vuejs.org/v2/guide/components-props.html#Prop-Validation).

## Support

### NodeJS <!-- omit in toc -->

_All Node versions._

### Browser <!-- omit in toc -->

| Browser | Version (>=) |
|:------- | -------:|
| Internet Explorer | 11* |
| Edge | 12 |
| Chrome | 38 |
| Firefox | 13 |
| Safari | 8 |
| Android | 38 |
| Opera | 25 |
| Firefox for Android | 14 |

\* Partial support: Does not support `.run` method because it depends on `Promise`.

## Install

```
npm install --save body-check
```

## Usage

_This package exposes itself using the UMD format._

In module environment:

```javascript
import BodyCheck from 'body-check';
const checker = new BodyCheck();
```

In CommonJS environment:

```javascript
// Requiring the package
const BodyCheck = require('body-check');
const checker = new BodyCheck();
```

In browser:

```html
<script src="path/to/body-check.js"></script>
<script>
const checker = new BodyCheck();
</script>
```

## Types

_The following uses TypeScript declaration syntax to illustrate the types._

### CaseName <!-- omit in toc -->

```typescript
type CaseName = string | symbol;
```

### BodyCheckConfig <!-- omit in toc -->

```typescript
interface BodyCheckConfig {
  validator(value: any, ...params: any[]): boolean | string;
  error?: string;
  params?: any[];
  context?: any;
}
```

### BodyCheckCases <!-- omit in toc -->

```typescript
interface BodyCheckCases {
  [caseName: CaseName]: BodyCheckConfig;
}
```

### BodyCheckResult <!-- omit in toc -->

```typescript
interface BodyCheckError {
  [caseName: CaseName]: string;
}
```

### BodyCheckValues <!-- omit in toc -->

```typescript
interface BodyCheckValues {
  [caseName: CaseName]: any;
}
```

## API

_The following uses TypeScript declaration syntax to illustrate the types._

### Constructor

#### constructor(cases: BodyCheckCases = {}): this <!-- omit in toc -->

```javascript
// Can be created without parameter.
const checker = new BodyCheck();

// Or automatically create cases by passing in a [BodyCheckCases](#bodycheckcases).
const checker = new BodyCheck({
  email: {
    validator: value => isEmail(value),
    error: 'Email is invalid.'
  },
  confirmPassword: {
    validator: (value, password) => value === password,
    error: 'Passwords do not matach.',
    params: [request.body.password]
  } 
});
```

### Methods

#### isObjectLiteral(value: any): boolean <!-- omit in toc -->

This method is used internally to check if a value is an object literal.

It is exposed publicly tho. So you can use it.

```javascript
const checker = new BodyCheck();

checker.isObjectLiteral([]);
// -> false

checker.isObjectLiteral(checker);
// -> false

checker.isObjectLiteral({});
// -> true
```

#### isValidConfig(value: any): boolean <!-- omit in toc -->

This method is used internally to check if a value matches the [BodyCheckConfig](#bodycheckconfig) interface.

```javascript
const checker = new BodyCheck();

checker.isValidConfig([]);
// -> false

checker.isValidConfig({
  error: 'some error',
  params: [/* some params */],
  context: `thisArg`
});
// -> false

checker.isValidConfig({
  validator: 'not function'
});
// -> false

checker.isValidConfig({
  validator: n => n === 10
});
// -> true

checker.isValidConfig({
  validator: n => n === 10,
  params: 'not array'
});
// -> false

checker.isValidConfig({
  validator: (v, n) => v === n,
  params: [10]
});
// -> true
```

#### hasCase(name: CaseName): boolean <!-- omit in toc -->

Check if a case already exists.

```javascript
const symbol = Symbol('example');
const checker = new BodyCheck({
  example: {
    validator(){
      return this.toString() === 'example'
    },
    context: 'example'
  },
  [symbol]: {
    validator: n => n === 'symbol'
  }
});

checker.hasCase('example');
// -> true

checker.hasCase(symbol);
// -> true

checker.hasCase('any');
// -> false
```

#### getCase(name: CaseName): BodyCheckConfig | undefined <!-- omit in toc -->

Get the configuration object of a case.

```javascript
const symbol = Symbol('example');
const checker = new BodyCheck({
  [symbol]: {
    validator: (n, ...i) => i.includes(n),
    params: [1, 2, 3]
  }
});

checker.getCase('example');
// -> undefined

checker.getCase(symbol);
// -> { validator: [object Function], params: [1, 2, 3] }
```

#### addCase(name: CaseName, config: BodyCheckConfig): this <!-- omit in toc -->

Add new case to the instance.

This method is chainable.

```javascript
// Add case with constructor
const checker = new BodyCheck({
  any: {
    validator: n => !n
  }
});

// Add case with .addCase method
checker.addCase('example', {
  validator(str){
    return str === this.toString()
  },
  context: 'example'
});

// Adding case with the same name will throw an error
checker.addCase('example', {
  validator: n => !!n
});
// Exception: TypeError

// Adding case with invalid config will throw an error
checker.addCase('example2', {});
// Exception: TypeError
```

#### editCase(name: CaseName, config: object): this <!-- omit in toc -->

Edit existing cases of the instance.

The method will extend the existing configuration object with the `config` parameter. The resulting configuration will be checked using `.isValidConfig()` before being updated to the instance.

This method is chainable.

```javascript
const checker = new BodyCheck({
  example: {
    validator: (v, n) => v === n
  }
});

// If a case is not found, throws error.
checker.editCase('not found', {
  params: [10]
});
// Exception: ReferenceError

// If `config` makes the existing configuration invalid, throws error.
checker.editCase('example', {
  validator: 'not function'
});
// Exception: TypeError

checker.editCase('example', {
  params: [10]
});
// Success
```

#### removeCase(name: CaseName): boolean <!-- omit in toc -->

Remove a case from the instance.

```javascript
const checker = new BodyCheck({
  example: {
    validator: n => !!n
  }
});

checker.removeCase('example');
// -> true
```

#### clear(): void <!-- omit in toc -->

Clear all cases from the instance.

```javascript
const checker = new BodyCheck({
  example: {
    validator: n => !!n
  }
});

checker.clear();
```

#### run(valueObj: BodyCheckValues): Promise<true | BodyCheckError | TypeError | ReferenceError> <!-- omit in toc -->

_In environment that does not natively support `Promise`, you must include a polyfill for `Promise` to correctly run this method. Otherwise, exception will be thrown._

Asynchronously run all tests with the values provided.

The test will iterate through the properties in `valueObj`. As such, property key that is not found in the instance will throw an exception.

Not all existing cases must be validated, but all `valueObj` properties must correspond to an existing case.

Case names that are not found in `valueObj` will be skipped when running the validation.

```javascript
const symbol = Symbol('example');
const checker = new BodyCheck({
  defaultError: {
    validator: n => n < 10
  },
  customDefaultError: {
    validator: n => n < 10,
    error: 'This is wrong!'
  },
  customError: {
    validator: v => v || 'No!'
  },
  parameters: {
    validator: (v, p) => v === p,
    params: ['password']
  },
  this: {
    validator: function(n){
      return this.valueOf() === n;
    },
    context: 10
  },
  [10]: {
    validator: v => !!v;
  },
  [symbol]: {
    validator: v => !!v;
  }
});

checker.run({
  defaultError: 10,
  customDefaultError: 10,
  customError: false,
  parameters: 'password',
  this: 10,
  10: 1,
  [symbol]: 1
}).then(obj => {
  /**
   * Resolves as an object containing caseName-error pair:
   * {
   *   defaultError: 'Validation for case "defaultError" failed with this value: 10',
   *   customDefaultError: 'This is wrong!',
   *   customError: 'No!'
   * }
   */
});
```

#### runSync(valueObj: BodyCheckValues): true | BodyCheckError <!-- omit in toc -->

Synchronously run all tests with the values provided.

The test will iterate through the properties in `valueObj`. As such, property key that is not found in the instance will throw an exception.

Not all existing cases must be validated, but all `valueObj` properties must correspond to an existing case.

Case names that are not found in `valueObj` will be skipped when running the validation.

```javascript
const symbol = Symbol('example');
const checker = new BodyCheck({
  defaultError: {
    validator: n => n < 10
  },
  customDefaultError: {
    validator: n => n < 10,
    error: 'This is wrong!'
  },
  customError: {
    validator: v => v || 'No!'
  },
  parameters: {
    validator: (v, p) => v === p,
    params: ['password']
  },
  this: {
    validator: function(n){
      return this.valueOf() === n;
    },
    context: 10
  },
  [10]: {
    validator: v => !!v;
  },
  [symbol]: {
    validator: v => !!v;
  }
});

checker.runSync({
  defaultError: 10,
  customDefaultError: 10,
  customError: false,
  parameters: 'password',
  this: 10,
  10: 1,
  [symbol]: 1
});
/**
 * Returns an object containing caseName-error pair:
 * {
 *   defaultError: 'Validation for case "defaultError" failed with this value: 10',
 *   customDefaultError: 'This is wrong!',
 *   customError: 'No!'
 * }
 */
```

### Properties

_The following uses TypeScript declaration syntax to illustrate the types._

#### cases: Map<CaseName, BodyCheckConfig> <!-- omit in toc -->

Returns a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) of all cases with its configuration.

This is used internally. You should not change this value if you don't know what you're doing.

This property is unwritable and unenumerable. To change this value, you need to use `Object.defineProperty` to redefine its descriptors.

#### size: number <!-- omit in toc -->

Returns the total amount of cases currently in the instance.
