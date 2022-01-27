import { isHtmlObj, getElement, getElements } from './helpers';

function initLoadingSpinner(parentElement) {
	const spinner = getElement('div', { className: 'loading-spinner' });
	spinner.append(...getElements(4, 'div'));
	if (isHtmlObj(parentElement)) parentElement.append(spinner);
	return {
		get element() {
			return spinner;
		},
		show: () => spinner.classList.add('show'),
		hide: () => spinner.classList.remove('show'),
	};
}

export default initLoadingSpinner;
