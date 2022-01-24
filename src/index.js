import initErrorOutput from './modules/errorOutput';
import initCatGallery from './modules/catGallery';

const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');

const errorPopup = initErrorOutput(document.querySelector('.error-output'));

function onGalleryError(e) {
	if (e.name === 'AbortError') {
		errorPopup.show('Request timed out...');
		return;
	}
	console.error(e.message || e);
}

function onPageChange(page) {
	pageText.textContent = page;
	prevBtn.disabled = page <= 0;
}

function onGalleryLoad(success) {
	window.scrollTo({ top: 0 });
	if (success) errorPopup.hide();
}

const gallery = initCatGallery(
	document.querySelector('.gallery'),
	0,
	12,
	onGalleryError,
	onPageChange,
	onGalleryLoad
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
