import "jest-extended";

import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import Joi from "@hapi/joi";
import { plugin } from "../src";
import { sendRequest } from "./__support__/utils";

let server: Hapi.Server;

const setupServer = () => {
	server = new Hapi.Server({
		host: "localhost",
		port: 8000,
		debug: { request: ["*"] },
	});

	server.route({
		method: "GET",
		path: "/sort",
		handler: (request: any) => ({
			data: request.jsonapi.sort,
		}),
	});
	server.route({
		method: "GET",
		path: "/include",
		handler: (request: any) => ({
			data: request.jsonapi.include,
		}),
	});
	server.route({
		method: "GET",
		path: "/filter",
		handler: (request: any) => ({
			data: request.jsonapi.filter,
		}),
	});
	server.route({
		method: "GET",
		path: "/pagination",
		handler: (request: any) => ({
			data: request.jsonapi.pagination,
		}),
	});
	server.route({
		method: "GET",
		path: "/fields",
		handler: (request: any) => ({
			data: request.jsonapi.fields,
		}),
	});

	server.route({
		method: "GET",
		path: "/transformers/resource",
		handler: request => {
			const { Resource } = request.server.plugins["@kodekeep/hapi-json-api"];

			return {
				data: new Resource()
					.type("articles")
					.id(1)
					.attributes({
						title: "JSON:API paints my bikeshed!",
					})
					.toJSON(),
			};
		},
	});

	server.route({
		method: "GET",
		path: "/transformers/collection",
		handler: request => {
			const { Collection } = request.server.plugins["@kodekeep/hapi-json-api"];

			return {
				data: new Collection()
					.type("articles")
					.resource({
						id: 1,
						attributes: {
							title: "JSON:API paints my bikeshed!",
						},
					})
					.resource({
						id: 2,
						attributes: {
							title: "JSON:API paints my bikeshed!",
						},
					})
					.resource({
						id: 3,
						attributes: {
							title: "JSON:API paints my bikeshed!",
						},
					})
					.toJSON(),
			};
		},
	});

	server.route({ method: "OPTIONS", path: "/ok", handler: () => ({ data: { id: "ok", type: "response" } }) });
	server.route({ method: "GET", path: "/ok", handler: () => ({ data: { id: "ok", type: "response" } }) });
	server.route({ method: "POST", path: "/post", handler: () => ({ data: { id: "post", type: "response" } }) });
	server.route({ method: "GET", path: "/auth", handler: () => Boom.unauthorized() });
	server.route({ method: "DELETE", path: "/delete", handler: (_request, h) => h.response().code(204) });
	server.route({
		method: "GET",
		path: "/text",
		handler: (_request, h) =>
			h
				.response("ok")
				.code(200)
				.header("Content-Type", "text/plain"),
	});

	// @ts-ignore
	server.route({
		method: "GET",
		path: "/joi/{name}",
		handler: request => ({
			data: `Hello ${request.params.name}!`,
		}),
		options: {
			validate: {
				failAction: (_req, _h, err) => err,
				params: Joi.object({
					name: Joi.string()
						.min(3)
						.max(10),
				}),
			},
		},
	});
};

const expectSuccessResponse = (response, payload) => {
	expect(response.statusCode).toBe(200);
	expect(payload.jsonapi.version).toEqual("1.0");
};

const expectErrorResponse = (response, code?, detail?) => {
	const payload = JSON.parse(response.payload);

	expect(response.statusCode).toBe(code);

	expect(payload.jsonapi.version).toEqual("1.0");

	expect(payload).toHaveProperty("errors");
	expect(payload.errors).toHaveLength(1);

	expect(payload).toHaveProperty("meta");
	expect(payload.meta).toHaveProperty("id");

	if (detail) {
		expect(payload.errors[0].detail).toBe(detail);
	}
};

describe("Meta", () => {
	beforeAll(async () => {
		setupServer();

		await server.register({
			plugin,
			options: {
				meta: { test: true },
				pagination: {
					routes: {
						include: [],
					},
				},
			},
		});
	});

	describe("Content-Type", () => {
		test("valid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "POST",
				url: "/post",
				payload: { data: { type: "post", attributes: { name: "test" } } },
				headers: {
					accept: "application/vnd.api+json",
					"content-type": "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual({ id: "post", type: "response" });
		});

		test("missing", async () => {
			const { response } = await sendRequest(server, {
				method: "POST",
				url: "/post",
				payload: { data: { type: "post", attributes: { name: "test" } } },
				headers: {
					accept: "application/vnd.api+json",
					"content-type": "",
				},
			});

			expectErrorResponse(response, 415, 'Expected content-type header to be "application/vnd.api+json"');
		});

		test("invalid type", async () => {
			const { response } = await sendRequest(server, {
				method: "POST",
				url: "/post",
				payload: { data: { type: "post", attributes: { name: "test" } } },
				headers: {
					accept: "application/vnd.api+json",
					"content-type": "text/json",
				},
			});

			expectErrorResponse(response, 415, 'Expected content-type header to be "application/vnd.api+json"');
		});

		test("invalid sub-type", async () => {
			const { response } = await sendRequest(server, {
				method: "POST",
				url: "/post",
				payload: { data: { type: "post", attributes: { name: "test" } } },
				headers: {
					accept: "application/vnd.api+json",
					"content-type": "application/json",
				},
			});

			expectErrorResponse(response, 415, 'Expected content-type header to be "application/vnd.api+json"');
		});

		test("media type", async () => {
			const { response } = await sendRequest(server, {
				method: "POST",
				url: "/post",
				payload: { data: { type: "post", attributes: { name: "test" } } },
				headers: {
					accept: "application/vnd.api+json",
					"content-type": "application/vnd.api+jsonq=0.9",
				},
			});

			expectErrorResponse(response, 415, "Unsupported Media Type");
		});

		test("media type is charset=utf-8", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "POST",
				url: "/post",
				payload: { data: { type: "post", attributes: { name: "test" } } },
				headers: {
					accept: "application/vnd.api+json",
					"content-type": "application/vnd.api+json; charset=UTF-8",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual({ id: "post", type: "response" });
		});
	});

	describe("Responses", () => {
		test("empty reply", async () => {
			const { response } = await sendRequest(server, {
				method: "DELETE",
				url: "/delete",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expect(response.statusCode).toBe(204);
			expect(response.payload).toBe("");
		});

		test("options", async () => {
			const { response } = await sendRequest(server, {
				method: "OPTIONS",
				url: "/ok",
				headers: {
					Origin: "http://localhost",
					"Access-Control-Request-Method": "GET",
				},
			});

			expect(response.statusCode).toBe(200);
		});
	});

	describe("Boom", () => {
		test("401", async () => {
			const { response } = await sendRequest(server, {
				method: "GET",
				url: "/auth",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectErrorResponse(response, 401, "Unauthorized");
		});

		test("404", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/missing",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectErrorResponse(response, 404);
			expect(payload.meta.test).toBeTrue();
		});
	});

	describe("Joi", () => {
		test("valid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/joi/john",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toBe("Hello john!");
		});

		test("invalid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/joi/invalid-name",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expect(response.statusCode).toBe(400);
			expect(payload.errors).toEqual([
				{
					detail:
						'child "name" fails because ["name" length must be less than or equal to 10 characters long]',
					details: '"name" length must be less than or equal to 10 characters long (name)',
					status: 400,
					title: "Bad Request",
				},
			]);
		});
	});

	describe("Sort", () => {
		test("valid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/sort?sort=-created,title",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual([{ field: "created", ascending: false }, { field: "title", ascending: true }]);
		});
	});

	describe("Include", () => {
		test("valid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/include?include=author,comments.author",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual([{ relationship: "author" }, { relationship: "comments.author" }]);
		});
	});

	describe("Filter", () => {
		test("valid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/filter?filter[firstname]=John&filter[lastname]=Doe",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual([{ field: "firstname", value: "John" }, { field: "lastname", value: "Doe" }]);
		});
	});

	describe("Pagination", () => {
		test("page-based", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/pagination?page[number]=1&page[size]=10",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual({ number: 1, size: 10 });
		});

		test("offset-based", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/pagination?page[offset]=10&page[limit]=20",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expect(response.statusCode).toBe(200);
			expect(payload.data).toEqual({ offset: 10, limit: 20 });
		});

		test("cursor-based", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/pagination?page[cursor]=30",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual({ cursor: 30 });
		});
	});

	describe("Fields", () => {
		test("valid", async () => {
			const { response, payload } = await sendRequest(server, {
				method: "GET",
				url: "/fields?fields[articles]=title,body&fields[people]=name",
				headers: {
					accept: "application/vnd.api+json",
				},
			});

			expectSuccessResponse(response, payload);
			expect(payload.data).toEqual([
				{ type: "articles", fields: ["title", "body"] },
				{ type: "people", fields: ["name"] },
			]);
		});
	});

	// describe("Transformers", () => {
	// 	test("resource", async () => {
	// 		const { response, payload } = await sendRequest(server, {
	// 			method: "GET",
	// 			url: "/transformers/resource",
	// 			headers: {
	// 				accept: "application/vnd.api+json",
	// 			},
	// 		});

	// 		expectSuccessResponse(response, payload);
	// 		expect(payload.data).toEqual({
	// 			type: "articles",
	// 			id: 1,
	// 			attributes: { title: "JSON:API paints my bikeshed!" },
	// 		});
	// 	});

	// 	test("collection", async () => {
	// 		const { response, payload } = await sendRequest(server, {
	// 			method: "GET",
	// 			url: "/transformers/collection",
	// 			headers: {
	// 				accept: "application/vnd.api+json",
	// 			},
	// 		});

	// 		expectSuccessResponse(response, payload);
	// 		expect(payload.data).toEqual([
	// 			{
	// 				type: "articles",
	// 				id: 1,
	// 				attributes: { title: "JSON:API paints my bikeshed!" },
	// 			},
	// 			{
	// 				type: "articles",
	// 				id: 2,
	// 				attributes: { title: "JSON:API paints my bikeshed!" },
	// 			},
	// 			{
	// 				type: "articles",
	// 				id: 3,
	// 				attributes: { title: "JSON:API paints my bikeshed!" },
	// 			},
	// 		]);
	// 	});
	// });
});
