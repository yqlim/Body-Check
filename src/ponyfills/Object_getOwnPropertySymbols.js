function Object_getOwnPropertySymbols(obj){
  return typeof Object.getOwnPropertySymbols !== 'function'
    ? []
    : Object.getOwnPropertySymbols(obj);
}


export default Object_getOwnPropertySymbols;
