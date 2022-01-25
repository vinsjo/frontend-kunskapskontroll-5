const isNum = x => typeof x === 'number' && !Number.isNaN(x);
const isInt = x => isNum(x) && x % 1 === 0;
const isFloat = x => isNum(x) && !isInt(x);
const isStr = x => typeof x === 'string';
const isBool = x => typeof x === 'boolean';
const isObj = x => typeof x === 'object' && x instanceof Object;
const isArr = x => Array.isArray(x);
const isFn = x => typeof x === 'function';

/**
 * @param {String} tagName
 * @param {Object} attributes
 * @returns {HTMLElement}
 */
function getElement(tagName, attributes = {}) {
	return setAttributes(document.createElement(tagName), attributes);
}

/**
 * @param {Number} count
 * @param {String} tagName
 * @param {Object} [attributes]
 * @returns {HTMLElement[]}
 */
function getElements(count, tagName, attributes = {}) {
	if (!isNum(count)) return [];
	const elements = [];
	while (elements.length < count) {
		elements.push(getElement(tagName, attributes));
	}
	return elements;
}

/**
 * @param {HTMLElement} el
 * @param {Object} attr
 * @returns {HTMLElement}
 */
function setAttributes(el, attr) {
	if (!isObj(el) || !isObj(attr) || !Object.keys(attr).length) return el;
	return Object.assign(el, attr);
}

export {
	isNum,
	isInt,
	isFloat,
	isStr,
	isBool,
	isObj,
	isArr,
	isFn,
	getElement,
	getElements,
	setAttributes,
};
