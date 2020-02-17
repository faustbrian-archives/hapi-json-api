export const sendRequest = async (server, options) => {
	const response = await server.inject(options);

	let { payload } = response;
	try {
		payload = JSON.parse(response.payload);
	} catch (e) {
		//
	}

	return {
		response,
		payload,
		query: response.request.query,
		headers: response.headers,
		jsonapi: response.request.jsonapi,
	};
};
