import Boom from "@hapi/boom";

export default () => {
	return {
		decorate(response, numberOfRecords, options) {
			options = options || {};

			const key = options.key;

			if (!Array.isArray(response) && !key) {
				throw Boom.internal("Missing results key");
			}

			if (key && !response[key]) {
				throw Boom.internal(`key: ${key} does not exists on response`);
			}

			const results =
				key && !Array.isArray(response) ? response[key] : response;

			if (key && !Array.isArray(response)) {
				delete response[key];
			}

			// @ts-ignore
			return this.response({
				results,
				numberOfRecords,
				response: Array.isArray(response) ? undefined : response,
			});
		},
	};
};
