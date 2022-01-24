/**
 * @param {HTMLElement} container    element that will contain error messages
 * @param {Number} [maxMessageCount] limit of messages shown
 */
function initErrorOutput(container) {
	const output = document.createElement('p');
	output.classList.add('error-message');
	container.append(output);
	return {
		show(err) {
			container.classList.add('show');
			if (!err) return;
			const msg = err instanceof Error && err.message ? err.message : err;
			const now = new Date();
			output.textContent = `${now.toLocaleTimeString()} - ${msg}`;
		},
		hide() {
			container.classList.remove('show');
			output.textContent = null;
		},
	};
}

export default initErrorOutput;
