import API_CONFIG from './catAPI.config';

async function fetchCatImages(page, limit, requestTimeout = 6000) {
	const url =
		`https://api.thecatapi.com/v1/images/search?` +
		`limit=${limit}&page=${page}&order=asc`;

	const controller = new AbortController();
	const timeoutID = setTimeout(() => {
		controller.abort();
		console.error('Fetching cat images timed out...');
	}, requestTimeout);

	const response = await fetch(url, {
		headers: {
			'x-api-key': API_CONFIG.key,
		},
		signal: controller.signal,
	});

	clearTimeout(timeoutID);

	if (!response.ok) throw `Failed fething data from ${baseURL}`;
	const data = await response.json();
	if (!data.length) throw `Response from ${baseURL} returned empty`;
	return data;
}

export { fetchCatImages };
