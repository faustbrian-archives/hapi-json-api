import Joi from "@hapi/joi";

export const configSchema = Joi.object({
	/**
	 * Additional information provided at the top-level meta object.
	 *
	 * https://jsonapi.org/format/#document-meta
	 */
	meta: Joi.object().default({}),
	/**
	 * The options that are going to be used to set the pagination behaviour.
	 *
	 * https://jsonapi.org/format/#fetching-pagination
	 */
	pagination: Joi.object({
		/**
		 * The base URI used to prefix request URIs.
		 *
		 * https://jsonapi.org/format/#document-links
		 */
		baseUri: Joi.string().allow(""),
		/**
		 * The strategy that is going to be used to paginate data.
		 *
		 * https://jsonapi.org/format/#fetching-pagination
		 */
		strategy: Joi.string().valid("page", "offset", "cursor").default("page"),
		/**
		 * The strategies that can be used to paginate records.
		 */
		strategies: Joi.object({
			/**
			 * The options for a page based strategy.
			 */
			page: Joi.object({
				number: Joi.number().integer().positive().default(1),
				size: Joi.number().integer().positive().default(100),
			}).default(),
			/**
			 * The options for an offsett based strategy.
			 */
			offset: Joi.object({
				offset: Joi.number().integer().default(0),
				limit: Joi.number().integer().positive().default(100),
			}).default(),
			/**
			 * The options for a cursor based strategy.
			 */
			cursor: Joi.object({
				cursor: Joi.number().integer().default(0),
			}).default(),
		}).default(),
		/**
		 * The options that determine which routes are going to be processed.
		 */
		routes: Joi.object({
			/**
			 * The routes that are included into any processing.
			 */
			include: Joi.array()
				.items(
					Joi.alternatives().try(Joi.object().instance(RegExp), Joi.string())
				)
				.default(["*"]),
			/**
			 * The routes that are excluded from any processing.
			 */
			exclude: Joi.array()
				.items(
					Joi.alternatives().try(Joi.object().instance(RegExp), Joi.string())
				)
				.default([]),
		}).default(),
	}).default(),
});

export const routeSchema = Joi.object({
	enabled: Joi.boolean(),
});
