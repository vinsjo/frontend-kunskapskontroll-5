import.meta.hot;
import { isArr, isObj } from './helpers';

const { SNOWPACK_PUBLIC_API_KEY } = __SNOWPACK_ENV__;

/**
 * @param {Number} page              the page to be loaded
 * @param {Number} limit             limit of images returned
 * @param {Number} [requestTimeout]  time in ms before request is aborted
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
				'x-api-key': SNOWPACK_PUBLIC_API_KEY,
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
		// If e was caused by the AbortController, throw a custom error
		if (e.name === 'AbortError') throw 'API Request timed out';
		// Else, just let the error bubble as-is to the caller
		throw e;
	}
}

/**
 * Creates a URL-object with the provided parameters as key-value pairs
 * @param {Object} [params]
 */
function getURL(params) {
	const url = new URL('https://api.thecatapi.com/v1/images/search');
	if (!isObj(params)) return url;
	for (const [key, value] of Object.entries(params)) {
		url.searchParams.append(key, value);
	}
	return url;
}

export default fetchCats;
