import PromisePonyfill from 'promise-polyfill';

const Promise_constructor = 
  typeof Promise === 'function'
    ? Promise
    : PromisePonyfill;

export default Promise_constructor;
