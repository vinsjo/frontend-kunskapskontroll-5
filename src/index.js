import { isArr, isFn, isNum, isObj, isStr } from './modules/helpers';
import initErrorOutput from './modules/errorOutput';
import fetchImageData from './modules/catAPI';

const gallery = document.querySelector('.gallery');
const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');
const errorContainer = document.querySelector('.error-output');

const containers = [];
const gallerySize = 12;

let isOnline = true;
let isLoading = false;
let currentPage;

while (containers.length < gallerySize) {
	const div = document.createElement('div');
	div.classList.add('container');
	gallery.append(div);
	containers.push(div);
}

const errorPopup = initErrorOutput(errorContainer);

/**
 * @param {HTMLElement} gallery
 * @param {Number} [size]
 */
function initGallery(gallery, size = 12) {
	/**
	 * @returns {HTMLDivElement[]}
	 */
	function createContainers() {
		const divs = [];
		while (divs.length < size) {
			const div = document.createElement('div');
			div.classList.add('container');
			gallery.append(div);
			containers.push(div);
		}
		return divs;
	}

	const containers = createContainers();

	function resetContainers() {
		while (containers.length) containers.shift().remove();
		containers.push(...createContainers);
	}

	return {
		get containers() {
			return containers;
		},
	};
}

function setLoading(loading) {
	loading
		? gallery.classList.add('loading')
		: gallery.classList.remove('loading');
}

function setOnline(online) {
	if (isOnline === online) return;
	isOnline = online;
	if (!isOnline) return errorPopup.show('No internet connection...');
	errorPopup.hide();
	renderCurrentPage();
}

function renderGallery(data) {
	if (!isArr(data) || !data.length) return;

	return data.map((cat, i) => {
		const div = containers[i];
		div.textContent = null;
		const img = document.createElement('img');
		img.alt = 'An image of a cat';
		div.append(img);
		return new Promise((resolve, reject) => {
			img.addEventListener('load', () => {
				div.classList.add('loaded');
				resolve();
			});
			img.addEventListener('error', () => {
				div.classList.add('error');
				reject(`Failed loading image: ${cat.url}`);
			});
			img.src = cat.url;
		});
	});
}

async function renderCurrentPage() {
	containers.forEach(div => div.classList.remove('loaded', 'error'));
	if (!isOnline) return;

	setLoading(true);
	try {
		const data = await fetchImageData(
			currentPage,
			gallerySize,
			() => errorPopup.show('API request timed out...'),
			5000
		);
		if (!data || !data.length) return;

		errorPopup.hide();
		const promises = await renderGallery(data);
		await Promise.race(promises);
	} catch (e) {
		console.error(e);
		errorPopup.show(e);
	} finally {
		setLoading(false);
		window.scrollTo({ top: 0 });
	}
}

function setPage(page) {
	if (isLoading || !isNum(page) || page < 0 || currentPage === page) {
		return;
	}
	currentPage = page;
	pageText.textContent = currentPage;
	prevBtn.disabled = currentPage <= 0;
	renderCurrentPage();
}

const prevPage = () => setPage(currentPage - 1 || 0);
const nextPage = () => setPage(currentPage + 1 || 0);

prevBtn.addEventListener('click', prevPage);
nextBtn.addEventListener('click', nextPage);

window.addEventListener('keydown', ev => {
	switch (ev.key) {
		case 'ArrowLeft':
			prevPage();
			break;
		case 'ArrowRight':
			nextPage();
			break;
	}
});

window.addEventListener('offline', () => {
	setOnline(false);
	errorPopup.show('No internet connection...');
	function onConnected() {
		setOnline(true);
		renderCurrentPage(currentPage);
		window.removeEventListener('online', onConnected);
	}
	window.addEventListener('online', onConnected);
});

setPage(0);
