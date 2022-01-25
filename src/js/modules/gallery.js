import {
	isArr,
	isFn,
	isNum,
	isObj,
	getElement,
	getElements,
	isStr,
} from './helpers';
import fetchCats from './catAPI';

/**
 * @param {HTMLElement} galleryContainer
 * @param {Number} [startingPage]
 * @param {Number} [size]
 * @param {Function} [onGalleryError]
 * @param {Function} [onPageStateChange]
 * @param {Function} [onLoadStateChange]
 * @param {Function} [loadEndCallback]
 */
function initCatGallery(
	galleryContainer,
	startingPage = 0,
	size = 12,
	onGalleryError = null,
	onPageStateChange = null,
	onLoadStateChange = null
) {
	const containers = [];
	const gallery = {};

	let currentPage;
	let pageCount = null;
	let isLoading = false;
	let currentError = null;

	let onError = onGalleryError;
	let onChange = onPageStateChange;
	let onLoad = onLoadStateChange;

	function setLoading(loading) {
		if (loading === isLoading) return;
		isLoading = loading;
		isFn(onLoad) && onLoad(gallery);
	}

	function resetContainers() {
		while (containers.length) containers.shift().remove();
		containers.push(
			...getElements(size, 'div', { className: 'container' })
		);
		galleryContainer.append(...containers);
	}

	function loadImages(data) {
		if (!isArr(data)) return;
		return data.map((cat, i) => {
			if (i >= containers.length) return;
			const attr = {
				alt: 'An image of a cat',
				src: isObj(cat) ? cat.url : null,
			};
			const src = isObj(cat) ? cat.url : null;
			const div = containers[i];
			return new Promise((resolve, reject) => {
				const img = getElement('img', attr);
				div.append(img);
				img.addEventListener('load', () => {
					div.classList.add('loaded');
					resolve();
				});
				img.addEventListener('error', () => {
					img.classList.add('error');
					reject(`Failed loading image: ${src}`);
				});
			});
		});
	}

	async function loadCurrentPage() {
		resetContainers();
		try {
			if (navigator.onLine === false) throw 'No internet connection...';

			setLoading(true);
			const response = await fetchCats(currentPage, size);
			if (!response || !isObj(response) || !isArr(response.data)) return;

			const { data, headers } = response;

			if (isObj(headers) && headers['pagination-count']) {
				pageCount = parseInt(headers['pagination-count']) || null;
			}

			const promises = loadImages(data);
			await Promise.race(promises);
			currentError = null;
		} catch (e) {
			currentError = e;
			if (!isFn(onError)) console.error(e.message || e);
			onError(gallery);
		} finally {
			setLoading(false);
		}
	}

	function setPage(page) {
		if (!isNum(page) || page < 0 || page === currentPage) return;
		currentPage = page;
		isFn(onChange) && onChange(gallery);
		loadCurrentPage();
	}

	Object.defineProperties(gallery, {
		page: { get: () => currentPage, set: setPage },
		isLoading: { get: () => isLoading },
		pageCount: { get: () => pageCount },
		size: { get: () => size },
		error: { get: () => currentError },
		reset: { value: resetContainers },
		reload: { value: loadCurrentPage },
		onError: { set: fn => isFn(fn) && (onError = fn) },
		onPageStateChange: { set: fn => isFn(fn) && (onChange = fn) },
		onLoadStateChange: { set: fn => isFn(fn) && (onLoad = fn) },
	});

	setPage(startingPage || 0);

	return gallery;
}

export default initCatGallery;
