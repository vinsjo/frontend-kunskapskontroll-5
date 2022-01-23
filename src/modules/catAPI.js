async function fetchCatImages(page, limit, requestTimeout = 6000) {
	const url =
		`https://api.thecatapi.com/v1/images/search?` +
		`limit=${limit}&page=${page}&order=asc`;

	const controller = new AbortController();
	const timeoutID = setTimeout(() => {
		controller.abort();
		console.error('Fetching cat images timed out...');
	}, requestTimeout);

	try {
		const response = await fetch(url, {
			headers: {
				'x-api-key': 'f5b346c6-fbd2-482a-9c9d-f9a056a73a1e',
			},
			signal: controller.signal,
		});

		if (!response.ok) throw `Failed fething data from ${url}`;
		const data = await response.json();
		if (!data.length) throw `Response from ${baseURL} returned empty`;
		return data;
	} catch (e) {
		console.error(e);
		return null;
	} finally {
		clearTimeout(timeoutID);
	}
}

export { fetchCatImages };
