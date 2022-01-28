import initErrorOutput from './modules/errorOutput';
import initCatGallery from './modules/gallery';
import initLoadingSpinner from './modules/loadingSpinner';
import { isNum } from './modules/helpers';

//#region GLOBAL DOM REFERENCES
const prevBtn = document.querySelector('button.previous');
const nextBtn = document.querySelector('button.next');
const pageText = document.querySelector('.pagination .page');
//#endregion

//#region COMPONENT INITIALIZATION

// loadingSpinner and errorOutput is created and appended to document.body
const loadingSpinner = initLoadingSpinner(document.body);
const errorOutput = initErrorOutput(document.body);

/*
 * The chaining of adding "listeners" was inspired by Express.js, mainly
 * because I think it looks pretty clean.
 * The gallery-object, which holds all states,
 * is passed as a parameter to the callback-functions which makes updating
 * the UI based on current state easier.
 */
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
		// If gallery is loading, disable buttons and show spinner
		if (loading) {
			prevBtn.disabled = true;
			nextBtn.disabled = true;
			loadingSpinner.show();
			return;
		}
		// Else, update buttons by triggering change "event", hide spinner
		// and if gallery doesn't have any current errors, hide errorOutput
		trigger('change');
		loadingSpinner.hide();
		!error && errorOutput.hide();
	});

// gallery.page is set to 0, which loads the gallery at page 0
gallery.page = 0;

//#endregion

//#region EVENT LISTENERS

// Click events for the buttons */
prevBtn.addEventListener('click', () => gallery.page--);
nextBtn.addEventListener('click', () => gallery.page++);

// Keyboard events, for navigating with left and right arrow key
window.addEventListener('keydown', ev => {
	if (ev.key === 'ArrowLeft') prevBtn.click();
	if (ev.key === 'ArrowRight') nextBtn.click();
});

/**
 * When the offline-event is triggered an error is shown and a listeners is added
 * to the online-event (No need for an online-listener when browser is online)
 * The online-listener hides the error-message, tries to reload the gallery
 * and then deattaches itself from the online-event
 */
window.addEventListener('offline', () => {
	errorOutput.show('No internet connection...');
	function onConnected() {
		errorOutput.hide();
		gallery.reload();
		window.removeEventListener('online', onConnected);
	}
	window.addEventListener('online', onConnected);
});

//#endregion
