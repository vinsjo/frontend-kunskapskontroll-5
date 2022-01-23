import { isArr, isNum, isObj, isStr } from './modules/helpers';
import { fetchCatImages } from './modules/catAPI';

const gallery = document.querySelector('.gallery');
const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');
const errorPopup = document.querySelector('.error-output');

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

function showError(message) {
	if (!message) return;
	const p = document.createElement('p');
	p.textContent = message;
	errorPopup.append(p);
	errorPopup.classList.add('show');
}

function hideError() {
	errorPopup.classList.remove('show');
	errorPopup.textContent = null;
}

function setLoading(loading) {
	if (!loading) {
		gallery.classList.remove('loading');
		return;
	}
	gallery.classList.add('loading');
	window.scrollTo({ top: 0 });
}

function renderGallery(data) {
	if (!isArr(data) || !data.length) return false;
	return data.map((cat, i) => {
		if (!isObj(cat)) return null;
		const div = containers[i];
		if (div.querySelector('*')) div.textContent = null;
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

async function loadPage(page) {
	containers.forEach(div => div.classList.remove('loaded', 'error'));
	if (!isOnline) return;
	setLoading(true);
	try {
		const data = await fetchCatImages(page, gallerySize);
		const promises = renderGallery(data);
		await Promise.race(promises);
	} catch (e) {
		console.error(e.message);
	}
	setLoading(false);
}

function setPage(page) {
	if (isLoading || !isNum(page) || page < 0 || currentPage === page) {
		return;
	}
	currentPage = page;
	pageText.textContent = currentPage;
	prevBtn.disabled = currentPage <= 0;
	loadPage(currentPage);
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
	isOnline = false;
	showError('No internet connection...');
	function onConnected() {
		isOnline = true;
		hideError();
		loadPage(currentPage);
		window.removeEventListener('online', onConnected);
	}
	window.addEventListener('online', onConnected);
});

setPage(0);
