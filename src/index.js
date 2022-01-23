import { isArr, isNum, isObj } from './modules/helpers';
import initState from './modules/initState';
import { fetchCatImages } from './modules/catAPI';

const gallery = document.querySelector('.gallery'),
	prevBtn = document.querySelector('button.previous'),
	nextBtn = document.querySelector('button.next'),
	pageText = document.querySelector('.pagination .page');

const gallerySize = 12;
const containers = [];

while (containers.length < gallerySize) {
	const div = document.createElement('div');
	div.classList.add('container');
	gallery.append(div);
	containers.push(div);
}

function renderGallery(data) {
	if (!isArr(data) || !data.length) return false;
	return data.map((cat, i) => {
		if (!isObj(cat)) return null;
		const div = containers[i];
		div.textContent = '';
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

const isLoading = initState(false, loading => {
	if (gallery.classList.contains('loading') === loading) return;
	if (!loading) {
		gallery.classList.remove('loading');
		return;
	}
	gallery.classList.add('loading');
	window.scrollTo({ top: 0 });
});

const currentPage = initState(
	0,
	async page => {
		pageText.textContent = page;
		prevBtn.disabled = page <= 0;
		isLoading.state = true;
		containers.forEach(div => div.classList.remove('loaded'));
		try {
			const data = await fetchCatImages(page, gallerySize);
			const promises = renderGallery(data);
			await Promise.race(promises);
			// isLoading.state = false;
			// await Promise.all(promises);
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

prevBtn.addEventListener('click', prevPage);
nextBtn.addEventListener('click', nextPage);

window.addEventListener('keydown', ev => {
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
