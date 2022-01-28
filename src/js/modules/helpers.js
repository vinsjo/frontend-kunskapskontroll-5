//#region TYPE CHECKERS
const isNum = x => typeof x === 'number' && !Number.isNaN(x);
const isStr = x => typeof x === 'string';
const isObj = x => typeof x === 'object' && x instanceof Object;
const isArr = x => Array.isArray(x);
const isFn = x => typeof x === 'function';
const isHtmlObj = x => isObj(x) && x instanceof HTMLElement;
//#endregion

//#region DOM MANIPULATION
/**
 * Creates an HTMLElement and adds optional attributes
 * Inspired by jQuery
 *
 * @see setAttributes
 *
 * @param {String} tagName
 * @param {Object} [attributes]
 * @returns {HTMLElement}
 */
function getElement(tagName, attributes) {
	return setAttributes(document.createElement(tagName), attributes);
}

/**
 * Creates an array of HTMLElements and adds optional attributes to all of them
 * @see getElement
 * @see setAttributes
 *
 * @param {Number} count   The amount of elements to create
 * @param {String} tagName
 * @param {Object} [attributes]
 * @returns {HTMLElement[]}
 */
function getElements(count, tagName, attributes) {
	if (!isNum(count)) return [];
	const elements = [];
	while (elements.length < count) {
		elements.push(getElement(tagName, attributes));
	}
	return elements;
}

/**
 * Set multiple attributes on an HTMLElement and returns it
 *
 * @param {HTMLElement} el     The element to set attributes on
 * @param {Object} attributes  The attributes, as key-value pairs
 * @returns {HTMLElement}
 */
function setAttributes(el, attributes) {
	if (!isObj(el) || !isObj(attributes)) return el;
	for (const [key, value] of Object.entries(attributes)) {
		el.setAttribute(key, value);
	}
	return el;
}
//#endregion

export {
	isNum,
	isStr,
	isObj,
	isArr,
	isFn,
	isHtmlObj,
	getElement,
	getElements,
	setAttributes,
};
