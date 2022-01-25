import initErrorOutput from './modules/errorOutput';
import initCatGallery from './modules/gallery';
import { isNum, isObj } from './modules/helpers';

const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');
const galleryContainer = document.querySelector('.gallery');

const errorPopup = initErrorOutput(document.querySelector('.error-output'));

function onGalleryError(gallery) {
	const e = gallery.error;
	const msg = !e
		? 'An unknown error occurred'
		: e.name === 'AbortError'
		? 'API request timed out...'
		: e.message || e;
	errorPopup.show(msg);
}

function onPageChange(gallery) {
	const { page, pageCount } = gallery;
	if (isNum(page)) {
		pageText.textContent = page;
		prevBtn.disabled = page <= 0;
	}
	if (!isNum(pageCount)) {
		nextBtn.disabled = false;
		return;
	}
	nextBtn.disabled = page >= pageCount;
}

function onLoadChange(gallery) {
	const { isLoading, error } = gallery;
	if (isLoading) {
		prevBtn.disabled = true;
		nextBtn.disabled = true;
		galleryContainer.classList.add('loading');
		return;
	}
	onPageChange(gallery);
	window.scrollTo({ top: 0 });
	if (!error) errorPopup.hide();
	galleryContainer.classList.remove('loading');
}

const gallery = initCatGallery(
	galleryContainer,
	0,
	12,
	onGalleryError,
	onPageChange,
	onLoadChange
);

prevBtn.addEventListener('click', () => gallery.page--);
nextBtn.addEventListener('click', () => gallery.page++);

window.addEventListener('keydown', ev => {
	switch (ev.key) {
		case 'ArrowLeft':
			prevBtn.click();
			break;
		case 'ArrowRight':
			nextBtn.click();
			break;
	}
});

window.addEventListener('offline', () => {
	errorPopup.show('No internet connection...');
	function onConnected() {
		errorPopup.hide();
		gallery.reload();
		window.removeEventListener('online', onConnected);
	}
	window.addEventListener('online', onConnected);
});
