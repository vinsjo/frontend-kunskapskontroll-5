/**
 * @param {HTMLElement} container    element that will contain error messages
 * @param {Number} [maxMessageCount] limit of messages shown
 */
function initErrorOutput(container, msgLimit = 5) {
	function appendMsg(msg) {
		const p = document.createElement('p');
		p.classList.add('error-message');
		p.textContent = msg;
		container.append(p);
		while (container.children.length > msgLimit) {
			container.children[0].remove();
		}
	}
	return {
		show(err) {
			container.classList.add('show');
			if (!err) return;
			const msg = err instanceof Error && err.message ? err.message : err;
			const now = new Date();
			appendMsg(`${now.toLocaleTimeString()} - ${msg}`);
		},
		hide(clearContent = true) {
			container.classList.remove('show');
			if (clearContent) container.textContent = null;
		},
	};
}

export default initErrorOutput;
