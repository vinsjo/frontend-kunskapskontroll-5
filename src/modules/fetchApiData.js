/**
 *
 * @param {Object} params
 */
function parseUrlParams(params) {
	if (typeof params !== 'object' || !!Object.keys(params).length) return;
	return Object.entries(params)
		.map(([key, value]) => encodeURI(`${key}=${value}`))
		.join('&');
}

/**
 * Inspired by: https://dmitripavlutin.com/timeout-fetch-request/
 *
 * @param {String} baseURL
 * @param {Object} urlParams
 * @param {Object} fetchOptions
 * @param {Number} requestTimeout
 */
async function fetchApiData(
	baseURL,
	urlParams = {},
	fetchOptions = {},
	requestTimeout = 6000
) {
	const paramStr = parseUrlParams(urlParams);
	const url = paramStr ? `${baseURL}?${paramStr}` : baseURL;

	const controller = new AbortController();

	const timeoutID = setTimeout(() => {
		controller.abort();
		console.log('Fetch request timed out...');
	}, requestTimeout);

	const response = await fetch(url, {
		...fetchOptions,
		signal: controller.signal,
	});
	clearTimeout(timeoutID);

	if (!response.ok) throw `Failed fething data from ${baseURL}`;
	const data = await response.json();
	if (!data.length) throw `Response from ${baseURL} returned empty`;
	return data;
}

export default fetchApiData;
