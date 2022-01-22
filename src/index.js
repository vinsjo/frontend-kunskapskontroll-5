import $ from 'jquery';
import { isArr, isNum, isObj } from './modules/helpers';
import initState from './modules/initState';
import { fetchCatImages } from './modules/catAPI';

const gallery = $('.gallery'),
	prevBtn = $('button.previous'),
	nextBtn = $('button.next'),
	pageText = $('.pagination .page');

const gallerySize = 12;

for (let i = 0; i < gallerySize; i++) {
	gallery.append($('<div></div>', { class: 'container' })[0]);
}

const containers = $('.gallery .container');

async function renderGallery(data) {
	if (!isArr(data) || !data.length) return;
	try {
		const promises = data.map((cat, i) => {
			if (!isObj(cat)) return;
			const props = {
				alt: 'An image of a cat',
				src: cat.url,
			};
			const container = $(containers[i]).empty();
			return new Promise((resolve, reject) => {
				container.append(
					$('<img>', props)
						.on('load', () => {
							container.addClass('loaded');
							resolve();
						})
						.on('error', () => {
							reject(`Failed loading image: ${cat.url}`);
						})
				);
			});
		});
		await Promise.all(promises);
	} catch (e) {
		console.error(e.message);
	}
}

const isLoading = initState(false, loading => {
	if (gallery.is('.loading') === loading) return;
	if (!loading) {
		gallery.removeClass('loading');
		return;
	}
	gallery.addClass('loading');
	$(window).scrollTop(0);
});

const currentPage = initState(
	0,
	async page => {
		pageText.text(page);
		prevBtn.prop('disabled', page <= 0);
		isLoading.state = true;
		containers.removeClass('loaded');
		try {
			const data = await fetchCatImages(page, gallerySize);
			await renderGallery(data);
		} catch (e) {
			console.error(e.message);
		} finally {
			isLoading.state = false;
		}
	},
	page => !isLoading.state && isNum(page) && page >= 0
);

function prevPage() {
	if (isLoading.state === true) return;
	currentPage.state--;
}
function nextPage() {
	if (isLoading.state === true) return;
	currentPage.state++;
}

prevBtn.on('click', prevPage);
nextBtn.on('click', nextPage);

$(window).on('keydown', ev => {
	if (isLoading.state === true) return;
	switch (ev.key) {
		case 'ArrowLeft':
			prevPage();
			break;
		case 'ArrowRight':
			nextPage();
			break;
	}
});

// $(window).on('offline', ev => {
// 	console.log('offline', ev);
// 	$(window).on('online', ev => {
// 		console.log('online', ev);
// 	});
// });
