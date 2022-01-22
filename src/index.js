import $ from 'jquery';
import { isArr, isBool, isNum, isObj } from './modules/helpers';
import initState from './modules/initState';
import { fetchCatImages } from './modules/catAPI';

const catGallery = $('.cat-grid'),
	catContainers = $('.cat-container'),
	pageText = $('.pagination .page'),
	pageCountText = $('.pagination .count'),
	prevBtn = $('button.previous'),
	nextBtn = $('button.next');

function updatePagination(currentPage = null, pageCount = null) {
	if (currentPage !== null) {
		pageText.text(currentPage);
		prevBtn.prop('disabled', currentPage <= 0);
	}
	if (pageCount !== null) {
		pageCountText.text(pageCount);
		nextBtn.prop('disabled', currentPage >= pageCount);
	}
}

async function renderGallery(data) {
	if (!isArr(data) || !data.length) return;
	try {
		const promises = data.map((cat, i) => {
			if (!isObj(cat)) return null;
			const container = $(catContainers[i]).removeClass('loaded').empty();
			const img = $('<img>', {
				alt: 'An image of a cat',
				src: cat.url,
			}).data('id', cat.id);
			container.append(img);

			function onImgLoad(resolve) {
				container.addClass('loaded');
				resolve();
			}

			return new Promise((resolve, reject) => {
				if (img[0].complete) onImgLoad(resolve);
				img.on('load', () => onImgLoad(resolve)).on('error', () => {
					reject(`Failed loading image from url: ${cat.url}`);
				});
			});
		});
		await Promise.all(promises);
	} catch (e) {
		console.error(e.message);
	}
}

const isLoading = initState(true, loading => {
	if (catGallery.is('.loading') === loading) return;
	if (loading) {
		catGallery.append(
			$('<div></div>', { class: 'loading-overlay' }).text('Loading...')
		);
		catGallery.addClass('loading');
		$(window).scrollTop(0);
		return;
	}
	$('.loading-overlay').remove();
	catGallery.removeClass('loading');
});

const pageCount = initState(100, count => updatePagination(null, count));

const currentPage = initState(
	0,
	async page => {
		updatePagination(page);
		isLoading.value = true;
		try {
			const data = await fetchCatImages(page, catContainers.length);
			await renderGallery(data);
		} catch (e) {
			console.error(e.message);
		} finally {
			isLoading.value = false;
		}
	},
	page => isNum(page) && page >= 0 && page <= pageCount.value
);

function prevPage() {
	currentPage.value--;
}
function nextPage() {
	currentPage.value++;
}

prevBtn.on('click', prevPage);
nextBtn.on('click', nextPage);

$(window).on('keydown', ev => {
	if (isLoading.value === true) return;
	switch (ev.key) {
		case 'ArrowLeft':
			prevPage();
		case 'ArrowRight':
			nextPage();
	}
});
