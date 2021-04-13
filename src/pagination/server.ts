import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";

const users: Array<{ name: string; username: string }> = [];
for (let i = 0; i < 20; ++i) {
	users.push({
		name: `name${i}`,
		username: `username${i}`,
	});
}

export const createServer = () => {
	const server = new Hapi.Server({
		host: "localhost",
		debug: { request: ["*"] },
	});

	server.route({
		method: "GET",
		path: "/",
		handler: () => [],
	});

	server.route({
		method: "GET",
		path: "/empty",
		handler: (_request: any, h: any) => h.withPagination([], 0),
	});

	server.route({
		method: "GET",
		path: "/exception",
		handler: () => {
			throw new Error("test");
		},
	});

	server.route({
		method: "GET",
		path: "/users",
		handler: (request: any, h: any) => {
			const limit = request.query["page[size]"];
			const page = request.query["page[number]"];
			const pagination = request.query.pagination || true;

			const offset = limit * (page - 1);
			const response: Array<{ name: string; username: string }> = [];

			for (let i = offset; i < offset + limit && i < users.length; ++i) {
				response.push(users[i]!);
			}

			if (pagination) {
				return h.withPagination(response, users.length);
			}

			return h.response(users);
		},
	});

	server.route({
		method: "GET",
		path: "/users2",
		handler: (request: any, h: any) => {
			const limit = request.query["page[size]"];
			const page = request.query["page[number]"];
			const pagination = request.query.pagination || true;

			const offset = limit * (page - 1);
			const response: Array<{ name: string; username: string }> = [];

			for (let i = offset; i < offset + limit && i < users.length; ++i) {
				response.push(users[i]!);
			}

			if (pagination) {
				return h.withPagination(
					{ results: response, otherKey: "otherKey", otherKey2: "otherKey2" },
					users.length,
					{ key: "results" }
				);
			}

			return h.response(users);
		},
	});

	server.route({
		method: "GET",
		path: "/users3",
		handler: (request: any, h: any) => {
			const limit = request.query["page[size]"];
			const page = request.query["page[number]"];
			const resultsKey = request.query.resultsKey;
			const totalCountKey = request.query.totalCountKey;

			const offset = limit * (page - 1);

			const response = {};

			response[resultsKey] = [];
			response[totalCountKey] = users.length;

			for (let i = offset; i < offset + limit && i < users.length; ++i) {
				response[resultsKey].push(users[i]);
			}

			return h.response(response);
		},
	});

	server.route({
		method: "GET",
		path: "/enabled",
		// @ts-ignore
		config: {
			plugins: {
				pagination: {
					enabled: true,
				},
			},
			handler: () => [],
		},
	});

	server.route({
		method: "GET",
		path: "/disabled",
		// @ts-ignore
		config: {
			plugins: {
				pagination: {
					enabled: false,
				},
			},
			handler: () => [],
		},
	});

	server.route({
		method: "GET",
		path: "/defaults",
		// @ts-ignore
		config: {
			plugins: {
				pagination: {
					enabled: false,
				},
			},
		},
		handler: (request: any, h: any) => {
			const limit = request.query["page[size]"];
			const page = request.query["page[number]"];
			const pagination = request.query.pagination || true;

			const offset = limit * (page - 1);
			const response: Array<{ name: string; username: string }> = [];

			for (let i = offset; i < offset + limit && i < users.length; ++i) {
				response.push(users[i]!);
			}

			if (pagination) {
				return h.withPagination(response, users.length);
			}

			return h.response(users);
		},
	});

	server.route({
		method: "POST",
		path: "/users",
		handler: () => ["Works"],
	});

	server.route({
		method: "GET",
		path: "/array-exception",
		handler: (_request: any, h: any) =>
			h
				.response({
					message: "Custom Error Message",
				})
				.code(500),
	});

	// Dummy Websocket upgrade request
	server.route({
		method: "GET",
		path: "/ws-upgrade",
		handler: (_request: any, h: any) =>
			h
				.response({
					message: "WS Upgrade request",
				})
				.code(101),
	});

	server.route({
		method: "GET",
		path: "/query-params",
		// @ts-ignore
		config: {
			validate: {
				query: Joi.object({
					testDate: Joi.date(),
					testArray: Joi.array(),
					testObject: Joi.object(),
					"page[number]": Joi.number(),
					"page[size]": Joi.number(),
				}),
			},
		},
		handler: (_request: any, h: any) => h.withPagination([{}, {}, {}], 3),
	});

	server.route({
		method: "GET",
		path: "/custom-header",
		handler: (_request: any, h: any) =>
			h.withPagination([{}, {}, {}], 3).header("custom-header", "pizza"),
	});

	return server;
};
