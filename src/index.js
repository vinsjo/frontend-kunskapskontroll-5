import $ from 'jquery';
import fetchApiData from './js/fetchApiData';
import API_CONFIG from './api.config.json';

function createHook(initialState, onStateChange = null) {
	let currentState = initialState;
	let onUpdate = () => {};
	const output = {
		get state() {
			return currentState;
		},
		set state(state) {
			if (currentState === state) return;
			currentState = state;
			onUpdate(currentState);
		},
		get onUpdate() {
			return onUpdate;
		},
		set onUpdate(updateCallback) {
			if (typeof updateCallback !== 'function') return;
			onUpdate = updateCallback;
		},
	};

	if (onStateChange) output.onUpdate = onStateChange;
	return output;
}

const limit = 12;
const container = $('.cat-grid');
const buttons = {
	prev: $('button.previous'),
	next: $('button.next'),
	setDisabled(prev = null, next = null) {
		if (typeof prev === 'boolean') this.prev.prop('disabled', prev);
		if (typeof next === 'boolean') this.next.prop('disabled', next);
	},
};
const pagination = {
	current: $('.pagination .current'),
	total: $('.pagination .total'),
};

const totalPages = createHook('hello', pages => pagination.total.text(pages));
const page = createHook(0, page => {
	buttons.prev.prop('disabled', page <= 1);
	buttons.next.prop('disabled', page >= totalPages.state);
	pagination.current.text(page);
});
const loading = createHook(false, loading => {
	if (loading) {
		container.addClass('loading');
		container.append(
			$('<div></div>', { class: 'loading-overlay' }).append(
				$('<h2></h2>').text('Loading...')
			)
		);
		return;
	}
	container.removeClass('loading');
	$('.loading-overlay').remove();
	// loading ?  container.addClass('loading'): container.removeClass('loading');
});

async function updatePage(inc) {
	if (!inc || typeof inc !== 'number' || Number.isNaN(inc)) return;
	const updated = page.state + inc;
	if (updated < 1 || updated > totalPages.state) return;
	container.empty();
	loading.state = true;

	page.state = updated;

	const data = await fetchApiData(
		'https://api.thecatapi.com/v1/images/search',
		{
			page: page.state,
			limit: limit,
			order: 'asc',
		},
		{
			headers: {
				'x-api-key': API_CONFIG.key,
			},
		}
	);

	const promises = data.map((cat, i) => {
		const img = $('<img>').data('id', cat.id);
		const div = $('<div></div>', { class: 'cat-container' }).append(img);
		container.append(div);
		return new Promise(resolve => {
			$(img)
				.attr('src', cat.url)
				.on('load', () => {
					div.addClass('loaded');
					resolve();
				});
		});
	});
	await Promise.all(promises);
	loading.state = false;
}

buttons.prev.on('click', () => updatePage(-1));
buttons.next.on('click', () => updatePage(+1));

updatePage(1);
totalPages.state = 100;
