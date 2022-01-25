import { isObj, getElement } from './helpers';
/**
 * @param {HTMLElement} container    element that will contain error messages
 * @param {Number} [maxMessageCount] limit of messages shown
 */
function initErrorOutput(container, msgLimit = 3) {
	return {
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
