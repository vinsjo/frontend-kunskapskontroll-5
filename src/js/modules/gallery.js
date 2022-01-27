import { isArr, isFn, isNum, isObj, getElement, getElements } from './helpers';
import fetchCats from './catAPI';

/**
 * @param {Object[]} data
 * @param {HTMLDivElement[]} containers
 */
function renderImages(data, containers) {
	if (!isArr(data)) return false;
	return data.map((cat, i) => {
		if (i >= containers.length) return;
		const attr = {
			alt: 'An image of a cat',
			src: isObj(cat) ? cat.url : null,
		};
		const div = containers[i];
		return new Promise(resolve => {
			const img = getElement('img', attr);
			div.append(img);
			img.addEventListener('load', () => {
				div.classList.add('loaded');
				resolve(true);
			});
			img.addEventListener('error', () => {
				div.classList.add('error');
				console.error(`Failed loading: ${cat.url}`);
				resolve(false);
			});
		});
	});
}

function initGalleryListeners(gallery) {
	const listeners = {
		error: null,
		change: null,
		load: null,
	};
	const validListener = type => Object.keys(listeners).includes(type);

	return {
		set(type, callbackFn) {
			if (!validListener(type) || !isFn(callbackFn)) return;
			listeners[type] = callbackFn;
		},
		trigger(type) {
			if (!validListener(type) || !isFn(listeners[type])) return;
			listeners[type](gallery);
		},
	};
}

/**
 * @param {HTMLElement} galleryContainer
 * @param {Number} [size]
 */
function initCatGallery(galleryContainer, size = 12) {
	let currentPage = null,
		pageCount = null,
		isLoading = null,
		currentError = null;

	const gallery = {};
	const containers = [];
	const listeners = initGalleryListeners(gallery);

	Object.defineProperties(gallery, {
		page: {
			get: () => currentPage,
			set: page => {
				if (!isNum(page) || page < 0 || page === currentPage) return;
				currentPage = page;
				listeners.trigger('change');
				loadPage(currentPage);
			},
		},
		pageCount: { get: () => pageCount },
		loading: { get: () => isLoading },
		error: { get: () => currentError },
	});

	/** Adds an "event-listener" */
	gallery.on = (type, callbackFn) => {
		listeners.set(type, callbackFn);
		return gallery;
	};
	/** Triggers an "event" */
	gallery.trigger = listeners.trigger;

	/** Resets all image containers */
	gallery.reset = () => {
		while (containers.length) containers.shift().remove();
		containers.push(
			...getElements(size, 'div', { className: 'container' })
		);
		galleryContainer.append(...containers);
	};

	/** Triggers load of current page */
	gallery.reload = () => loadPage(currentPage);

	function setLoading(loading) {
		if (loading === isLoading) return;
		isLoading = loading;
		listeners.trigger('load');
	}

	/**
	 * Main gallery function, resets and loads a page
	 * @param {Number} page
	 */
	async function loadPage(page) {
		gallery.reset();
		try {
			if (navigator.onLine === false) throw 'No internet connection...';
			setLoading(true);
			const response = await fetchCats(page, size);
			if (!response || !isObj(response) || !isArr(response.data)) return;
			const { data, headers } = response;
			if (headers['pagination-count']) {
				pageCount = parseInt(headers['pagination-count']) || null;
			}
			const promises = renderImages(data, containers);
			await Promise.all(promises);

			currentError = null;
		} catch (e) {
			currentError = e.message || e;
			listeners.trigger('error');
		} finally {
			setLoading(false);
		}
	}

	return gallery;
}

export default initCatGallery;
