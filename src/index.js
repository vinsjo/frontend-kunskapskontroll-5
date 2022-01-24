import initErrorOutput from './modules/errorOutput';
import initCatGallery from './modules/catGallery';
import { isNum, isObj } from './modules/helpers';

const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');
const pageCountText = document.querySelector('.pagination .page-count');
const nav = document.querySelector('nav');

const errorPopup = initErrorOutput(document.querySelector('.error-output'));

function onGalleryError(e) {
	if (e.name === 'AbortError') {
		errorPopup.show('Request timed out...');
		return;
	}
	console.error(e.message || e);
}

function onLoadStart() {
	prevBtn.disabled = true;
	nextBtn.disabled = true;
}

function onPageUpdate(gallery) {
	if (!isObj(gallery)) return;
	const { page, pageCount } = gallery;
	if (isNum(page)) {
		pageText.textContent = page;
		prevBtn.disabled = page <= 0;
	}
	if (isNum(pageCount)) {
		nextBtn.disabled = page >= pageCount;
		pageCountText.textContent = `of ${pageCount}`;
	}
}

function onLoadEnd(gallery) {
	onPageUpdate(gallery);
	window.scrollTo({ top: 0 });
	if (!gallery.error) errorPopup.hide();
}

const gallery = initCatGallery(
	document.querySelector('.gallery'),
	0,
	12,
	onGalleryError,
	onPageUpdate,
	onLoadStart,
	onLoadEnd
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

window.addEventListener('scroll', () => {
	const { top, height } = nav.getBoundingClientRect();
	const y = top > 0 ? 0 : Math.abs(top - height * 0.5);
	[prevBtn, nextBtn].forEach(
		btn => (btn.style.transform = `translateY(${y}px)`)
	);
});
