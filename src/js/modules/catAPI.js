import { isArr, isObj } from './helpers';

function getURL(params) {
	const url = new URL('https://api.thecatapi.com/v1/images/search');
	if (!isObj(params)) return url;
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.append(key, value);
	}
	return url;
}

/**
 *
 * @param {Number} page              the page to be loaded
 * @param {Number} limit             limit of images returned
 * @param {Number} [requestTimeout]  time in ms before request is aborted
 * @returns
 */
async function fetchCats(page, limit, requestTimeout = 4000) {
	try {
		const url = getURL({ limit: limit, page: page, order: 'asc' });
		const controller = new AbortController();
		const timeoutID = setTimeout(() => {
			controller.abort();
		}, requestTimeout);

		const response = await fetch(url, {
			headers: {
				'x-api-key': 'f5b346c6-fbd2-482a-9c9d-f9a056a73a1e',
			},
			signal: controller.signal,
		});
		clearTimeout(timeoutID);

		if (!response.ok) throw 'API request failed';
		const data = await response.json();

		if (!isArr(data) || !data.length) throw 'Empty API response received';

		const headers = {
			'pagination-count': response.headers.get('pagination-count'),
		};
		return { data, headers };
	} catch (e) {
		if (e.name === 'AbortError') throw 'Request timed out...';
		throw e;
	}
}

export default fetchCats;
