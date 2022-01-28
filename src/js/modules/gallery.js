import {
	isArr,
	isFn,
	isNum,
	isObj,
	getElement,
	getElements,
	isHtmlObj,
} from './helpers';
import fetchCats from './catAPI';

/**
 * @param {HTMLElement} parentElement   HTMLElement that holds all images
 * @param {Number} [size]                  Amount of images to load
 */
function initCatGallery(parentElement, size = 12) {
	// Gallery states
	let currentPage = null,
		pageCount = null,
		isLoading = false,
		currentError = null;

	const gallery = {};
	const imgContainers = [];
	const listeners = initGalleryListeners(gallery);

	function setLoading(loading) {
		if (loading === isLoading) return;
		isLoading = loading;
		listeners.trigger('load');
	}

	/** Adds an "event-listener" */
	gallery.on = (type, callbackFn) => {
		listeners.set(type, callbackFn);
		return gallery;
	};
	/** Triggers an "event" */
	gallery.trigger = listeners.trigger;

	/** Resets all image containers */
	gallery.reset = () => {
		while (imgContainers.length) imgContainers.shift().remove();
		imgContainers.push(...getElements(size, 'div', { class: 'container' }));
		parentElement.append(...imgContainers);
	};

	/** Triggers load of current page */
	gallery.reload = () => loadPage(currentPage);

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

	/**
	 * Iterate the response data and append an image to each imgContainer
	 * @param {Object[]} data
	 * @returns {Promise<Boolean>[]}
	 */
	function renderImages(data) {
		if (!isArr(data)) throw 'Invalid API Response';
		// return an array of promises which corresponds to each image
		return data.map((cat, i) => {
			if (i >= imgContainers.length) return;
			const attr = {
				alt: 'An image of a cat',
				src: isObj(cat) ? cat.url : null,
			};
			const div = imgContainers[i];
			return new Promise(resolve => {
				const img = getElement('img', attr);
				div.append(img);
				img.addEventListener('load', () => {
					div.classList.add('loaded');
					resolve(true);
				});
				img.addEventListener('error', () => {
					div.classList.add('error');
					div.title = '404 not found';
					console.error(`Failed loading: ${cat.url}`);
					resolve(false);
				});
			});
		});
	}

	/**
	 * Main gallery function, resets and loads a page
	 * @param {Number} page
	 */
	async function loadPage(page) {
		// reset imgContainers
		gallery.reset();
		try {
			// if browser is offline, throw error and skip trying to load
			if (navigator.onLine === false) throw 'No internet connection...';
			// set loading-state to true
			setLoading(true);
			// fetch response, if any errors happen fetchCats throws an error
			const response = await fetchCats(page, size);
			const { data, headers } = response;
			// If headers contains "pagination-count" set value of pageCount
			if (headers['pagination-count']) {
				pageCount = parseInt(headers['pagination-count']) || null;
			}
			// create images and await loading of them
			const promises = renderImages(data);
			await Promise.all(promises);
			// If no error has occured, reset currentError
			currentError = null;
		} catch (e) {
			// If an error occurs, set currentError and trigger error "event"
			currentError = e;
			listeners.trigger('error');
		} finally {
			// Finally, when loading is finished, set loading-state to false
			setLoading(false);
		}
	}
	return gallery;
}

/**
 * Handles "event-listeners" in the gallery
 *
 * @param {CatGallery} gallery 	An object created in initCatGallery
 */
function initGalleryListeners(gallery) {
	const listeners = {
		error: null,
		change: null,
		load: null,
	};
	// validates that a type provided actually exists
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

export default initCatGallery;
