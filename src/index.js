import { isArr, isNum, isObj } from './modules/helpers';
import { fetchCatImages } from './modules/catAPI';

const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');

const errorPopup = document.querySelector('.error-output');

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

function initGallery(gallerySize = 12) {
	const gallery = document.querySelector('.gallery');
	const containers = [];
	while (containers.length < gallerySize) {
		const div = document.createElement('div');
		div.classList.add('container');
		gallery.append(div);
		containers.push(div);
	}

	let isOnline = true;
	let isLoading = false;
	let currentPage = 0;

	function setLoading(state) {
		if (!state) {
			gallery.classList.remove('loading');
			return;
		}
		gallery.classList.add('loading');
		window.scrollTo({ top: 0 });
	}

	function setPage(page) {
		currentPage = page;
		pageText.textContent = page;
		prevBtn.disabled = page <= 0;
	}

	function render(data) {
		if (!isArr(data) || !data.length) return false;
		return data.map((cat, i) => {
			if (!isObj(cat)) return null;
			const div = containers[i];
			const prevImg = div.querySelector('img');
			if (prevImg) prevImg.remove();
			const img = document.createElement('img');
			img.alt = 'An image of a cat';
			div.append(img);
			return new Promise((resolve, reject) => {
				img.addEventListener('load', () => {
					div.classList.add('loaded');
					resolve();
				});
				img.addEventListener('error', () => {
					reject(`Failed loading image: ${cat.url}`);
				});
				img.src = cat.url;
			});
		});
	}

	async function loadPage(page) {
		if (isLoading || !isNum(page) || page < 0) return;
		setPage(page);
		containers.forEach(div => {
			div.classList.remove('loaded');
		});
		if (!isOnline) return;
		setLoading(true);
		try {
			const data = await fetchCatImages(page, gallerySize);
			const promises = render(data);
			await Promise.race(promises);
		} catch (e) {
			console.error(e.message);
		}
		setLoading(false);
	}

	window.addEventListener('offline', () => {
		isOnline = false;
		showError('No internet connection...');
		function onReconnect() {
			isOnline = true;
			hideError();
			loadPage(currentPage);
			window.removeEventListener('online', onReconnect);
		}
		window.addEventListener('online', onReconnect);
	});

	const pageStepper = step => () => loadPage(currentPage + step);

	const prev = pageStepper(-1);
	const next = pageStepper(1);

	loadPage(0);

	return [prev, next];
}

const [prevPage, nextPage] = initGallery();

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
