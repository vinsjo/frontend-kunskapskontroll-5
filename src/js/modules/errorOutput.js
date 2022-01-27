import { isObj, getElement, isHtmlObj } from './helpers';
/**
 * @param {HTMLElement} parentElement   element that output will be appended to
 * @param {Number} [maxMessageCount] limit of messages shown
 */
function initErrorOutput(parentElement, msgLimit = 3) {
	const container = getElement('div', { className: 'error-output' });
	if (isHtmlObj(parentElement)) parentElement.append(container);
	return {
		get element() {
			return container;
		},
		show(err) {
			container.classList.add('show');
			if (!err) return;
			const msg = isObj(err) && err.message ? err.message : err;
			const now = new Date();
			const output = getElement('p', { class: 'error-message' });
			output.textContent = `${now.toLocaleTimeString()} - ${msg}`;
			container.append(output);
			while (container.children.length > msgLimit) {
				container.children[0].remove();
			}
		},
		hide() {
			container.classList.remove('show');
			container.textContent = null;
		},
	};
}

export default initErrorOutput;
