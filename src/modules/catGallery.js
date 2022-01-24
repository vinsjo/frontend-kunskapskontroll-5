import { isArr, isFn, isNum, isObj } from './helpers';
import fetchCats from './catAPI';

/**
 *
 * @param {Object[]} data
 * @param {HTMLElement[]} containers
 */
function renderCatGallery(data, containers) {
	if (!isArr(data) || !data.length || !isArr(containers)) return;
	return data.map((cat, i) => {
		const c = containers[i];
		c.textContent = null;
		const src = isObj(cat) ? cat.url : null;
		const img = document.createElement('img');
		img.alt = 'An image of a cat';
		c.append(img);
		return new Promise((resolve, reject) => {
			img.addEventListener('load', () => {
				c.classList.add('loaded');
				resolve();
			});
			img.addEventListener('error', () => {
				c.classList.add('error');
				reject(`Failed loading image: ${src}`);
			});
			img.src = src;
		});
	});
}

/**
 * @param {Number} gallerySize
 * @returns {HTMLDivElement[]};
 */
function createContainers(gallerySize) {
	if (!isNum(gallerySize) || gallerySize <= 0) return [];
	const containers = [];
	while (containers.length < gallerySize) {
		const div = document.createElement('div');
		div.classList.add('container');
		containers.push(div);
	}
	return containers;
}

/**
 * @param {HTMLElement} gallery
 * @param {Number} [startingPage]
 * @param {Number} [size]
 * @param {Function} [errorCallback]
 * @param {Function} [changeCallback]
 * @param {Function} [loadStartCallback]
 * @param {Function} [loadEndCallback]
 */
function initCatGallery(
	gallery,
	startingPage = 0,
	size = 12,
	errorCallback = null,
	changeCallback = null,
	loadStartCallback = null,
	loadEndCallback = null
) {
	const containers = [];
	const handler = {};

	let currentPage;
	let pageCount = null;
	let isLoading = false;
	let currentError = null;

	let onError = null;
	let onChange = null;
	let onLoadStart = null;
	let onLoadEnd = null;

	function setLoading(loading) {
		if (loading === isLoading) return;
		isLoading = loading;
		if (isLoading) {
			gallery.classList.add('loading');
			isFn(onLoadStart) && onLoadStart(handler);
			return;
		}
		gallery.classList.remove('loading');
		isFn(onLoadEnd) && onLoadEnd(handler);
	}

	function resetContainers() {
		while (containers.length) {
			const removed = containers.shift();
			if (!(removed instanceof HTMLElement)) continue;
			removed.remove();
		}
		containers.push(...createContainers(size));
		gallery.append(...containers);
	}

	async function loadCurrentPage() {
		resetContainers();
		if (navigator.onLine === false) return;
		setLoading(true);
		try {
			const response = await fetchCats(currentPage, size);
			if (!response || !isObj(response) || !isArr(response.data)) return;

			const { data, headers } = response;

			if (isObj(headers) && headers.hasOwnProperty('pagination-count')) {
				pageCount = parseInt(headers['pagination-count']) || null;
			}

			const promises = renderCatGallery(data, containers);
			await Promise.race(promises);

			currentError = null;
		} catch (e) {
			currentError = e;
			if (!isFn(onError)) console.error(e.message || e);
			onError(handler);
		} finally {
			setLoading(false);
		}
	}

	function setPage(page) {
		if (!isNum(page) || page < 0 || page === currentPage) return;
		currentPage = page;
		isFn(onChange) && onChange(handler);
		loadCurrentPage();
	}

	Object.defineProperties(handler, {
		page: { get: () => currentPage, set: setPage },
		isLoading: { get: () => isLoading },
		pageCount: { get: () => pageCount },
		size: { get: () => size },
		error: { get: () => currentError },
		reset: { value: resetContainers },
		reload: { value: loadCurrentPage },
		onError: { set: fn => isFn(fn) && (onError = fn) },
		onChange: { set: fn => isFn(fn) && (onChange = fn) },
		onLoadStart: { set: fn => isFn(fn) && (onLoadStart = fn) },
		onLoadEnd: { set: fn => isFn(fn) && (onLoadEnd = fn) },
	});

	handler.onError = errorCallback;
	handler.onChange = changeCallback;
	handler.onLoadStart = loadStartCallback;
	handler.onLoadEnd = loadEndCallback;
	setPage(startingPage);

	return handler;
}

export default initCatGallery;
