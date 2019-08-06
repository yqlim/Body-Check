/**
 * Modified from MDN
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign#Polyfill
 */
function Object_assign_polyfill(target, ...args){
  if (target === null || target === undefined) {
    throw new TypeError('Cannot convert undefined or null to object');
  }

  const to = Object(target);
  const len = args.length;

  for (let i = 0; i < len; i++) {
    const obj = args[i];
    if (obj !== null && obj !== undefined) { 
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          to[key] = obj[key];
        }
      }
    }
  }

  return to;
}


const Object_assign = 
  typeof Object.assign === 'function'
    ? Object.assign
    : Object_assign_polyfill;


export default Object_assign;
