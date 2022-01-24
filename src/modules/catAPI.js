import { isFn } from './helpers';

/**
 *
 * @param {Number} page              the page to be loaded
 * @param {Number} limit             limit of images returned
 * @param {Function} [onTimeOut]     callback that's executed if timeout is reached
 * @param {Number} [requestTimeout]  time in ms before request is aborted
 * @returns
 */
async function fetchImageData(
	page,
	limit,
	onTimeOut = null,
	requestTimeout = 6000
) {
	const url =
		`https://api.thecatapi.com/v1/images/search?` +
		`limit=${limit}&page=${page}&order=asc`;
	const controller = new AbortController();
	try {
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
		if (!response.ok) throw 'API request failed...';
		const data = await response.json();
		if (!data.length) throw 'Empty API response received...';
		return data;
	} catch (e) {
		if (e.name === 'AbortError' && isFn(onTimeOut)) return onTimeOut(e);
		console.error(e.message || e);
		return null;
	}
}

export default fetchImageData;
