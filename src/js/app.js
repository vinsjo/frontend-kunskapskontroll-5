import initErrorOutput from './modules/errorOutput';
import initCatGallery from './modules/gallery';
import initLoadingSpinner from './modules/loadingSpinner';
import { isNum } from './modules/helpers';

const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');

const loadingSpinner = initLoadingSpinner(document.body);
const errorOutput = initErrorOutput(document.body);

const gallery = initCatGallery(document.querySelector('.gallery'), 12)
	.on('error', ({ error }) => {
		const msg = !error
			? 'An unknown error occurred'
			: error.message || error;
		errorOutput.show(msg);
		console.error(msg);
	})
	.on('change', ({ page, pageCount }) => {
		pageText.textContent = page;
		prevBtn.disabled = page <= 0;
		nextBtn.disabled = isNum(pageCount) ? page >= pageCount : false;
	})
	.on('load', ({ loading, error, trigger }) => {
		if (loading) {
			prevBtn.disabled = true;
			nextBtn.disabled = true;
			loadingSpinner.show();
			return;
		}
		trigger('change');
		loadingSpinner.hide();
		!error && errorOutput.hide();
	});

gallery.page = 0;

prevBtn.addEventListener('click', () => gallery.page--);
nextBtn.addEventListener('click', () => gallery.page++);

window.addEventListener('keydown', ev => {
	if (ev.key === 'ArrowLeft') prevBtn.click();
	if (ev.key === 'ArrowRight') nextBtn.click();
});

window.addEventListener('offline', () => {
	errorOutput.show('No internet connection...');
	function onConnected() {
		errorOutput.hide();
		gallery.reload();
		window.removeEventListener('online', onConnected);
	}
	window.addEventListener('online', onConnected);
});
