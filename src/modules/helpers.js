const isNum = x => typeof x === 'number' && !Number.isNaN(x);
const isInt = x => isNum(x) && x % 1 === 0;
const isFloat = x => isNum(x) && !isInt(x);
const isStr = x => typeof x === 'string';
const isBool = x => typeof x === 'boolean';
const isObj = x => typeof x === 'object' && x instanceof Object;
const isArr = x => Array.isArray(x);
const isFn = x => typeof x === 'function';

export { isNum, isInt, isFloat, isStr, isBool, isObj, isArr, isFn };
