/**
 * Modified from MDN
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries#Polyfill
 */
function Object_entries_polyfill(obj){
  const props = Object.keys(obj);

  let i = props.length;
  const ret = new Array(i);

  while (i--)
    ret[i] = [props[i], obj[props[i]]];

  return ret;
}


const Object_entries = 
  typeof Object.entries === 'function'
    ? Object.entries
    : Object_entries_polyfill;


export default Object_entries;
