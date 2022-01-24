import { isArr, isFn, isNum, isObj } from './helpers';
import fetchImageData from './catAPI';

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
 * @param {Function} [loadCallback]
 */
function initCatGallery(
	gallery,
	startingPage = 0,
	size = 12,
	errorCallback = null,
	changeCallback = null,
	loadCallback = null
) {
	const containers = [];

	let currentPage;
	let isLoading = false;
	let loadSuccess = false;

	let onError = null;
	let onChange = null;
	let onLoad = null;

	function resetContainers() {
		while (containers.length) {
			const removed = containers.shift();
			if (!(removed instanceof HTMLElement)) continue;
			removed.remove();
		}
		containers.push(...createContainers(size));
		gallery.append(...containers);
	}

	function setLoading(loading) {
		if (loading === isLoading) return;
		isLoading = loading;
		if (isLoading) return gallery.classList.add('loading');
		gallery.classList.remove('loading');
		isFn(onLoad) && onLoad(loadSuccess);
	}

	async function loadCurrentPage() {
		resetContainers();
		if (navigator.onLine === false) return;
		setLoading(true);
		try {
			const data = await fetchImageData(currentPage, size);
			if (!data || !data.length) return;
			const promises = renderCatGallery(data, containers);
			await Promise.race(promises);
			loadSuccess = true;
		} catch (e) {
			loadSuccess = false;
			if (!isFn(onError)) console.error(e.message || e);
			onError(e);
		} finally {
			setLoading(false);
		}
	}

	function setPage(page) {
		if (!isNum(page) || page < 0 || page === currentPage) return;
		currentPage = page;
		isFn(onChange) && onChange(currentPage);
		loadCurrentPage();
	}

	const output = Object.defineProperties(
		{},
		{
			page: { get: () => currentPage, set: setPage },
			isLoading: { get: () => isLoading, set: setLoading },
			size: { get: () => size },
			onError: { set: fn => isFn(fn) && (onError = fn) },
			onChange: { set: fn => isFn(fn) && (onChange = fn) },
			onLoadEnd: { set: fn => isFn(fn) && (onLoad = fn) },
			reset: { value: resetContainers },
			reload: { value: loadCurrentPage },
		}
	);

	output.onError = errorCallback;
	output.onChange = changeCallback;
	output.onLoadEnd = loadCallback;
	setPage(startingPage);

	return output;
}

export default initCatGallery;
