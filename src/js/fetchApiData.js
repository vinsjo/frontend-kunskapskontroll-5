async function fetchApiData(url, params = {}, options = {}) {
	try {
		if (Object.keys(params).length) {
			url +=
				'?' +
				Object.entries(params)
					.map(([key, value]) => {
						return encodeURI(`${key}=${value}`);
					})
					.join('&');
		}
		const response = await fetch(url, options);
		if (!response.ok) throw `Failed fething data from ${url}`;
		const data = await response.json();
		if (!data.length) throw `Response from ${url} returned empty`;
		return data;
	} catch (e) {
		console.log(e);
		return null;
	}
}

export default fetchApiData;
