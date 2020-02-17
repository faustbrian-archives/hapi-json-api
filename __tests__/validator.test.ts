import Hapi from "@hapi/hapi";
import { plugin } from "../src";

const schema: object = {
	properties: {
		name: { type: "string" },
	},
	required: ["name"],
};

const sendRequest = async ({
	url,
	method = "GET",
}: {
	url: string;
	method?: string;
}): Promise<Hapi.ServerInjectResponse> => {
	const server = new Hapi.Server({ debug: { request: ["*"] } });
	await server.register({ plugin });

	server.route({
		method: "GET",
		path: "/",
		handler: () => [],
	});

	// @ts-ignore
	server.route({
		method: "GET",
		path: "/query",
		handler: () => [],
		options: {
			plugins: {
				jsonapi: {
					validate: {
						query: schema,
					},
				},
			},
		},
	});

	// @ts-ignore
	server.route({
		method: "POST",
		path: "/payload",
		handler: () => [],
		options: {
			plugins: {
				jsonapi: {
					validate: {
						payload: schema,
					},
				},
			},
		},
	});

	// @ts-ignore
	server.route({
		method: "GET",
		path: "/params",
		handler: () => [],
		options: {
			plugins: {
				jsonapi: {
					validate: {
						params: schema,
					},
				},
			},
		},
	});

	// @ts-ignore
	server.route({
		method: "GET",
		path: "/headers",
		handler: () => [],
		options: {
			plugins: {
				jsonapi: {
					validate: {
						headers: schema,
					},
				},
			},
		},
	});

	return server.inject({ method, url, payload: {}, headers: { "Content-Type": "application/vnd.api+json" } });
};

const expect422 = (response: any) => {
	expect(response.statusCode).toBe(422);

	const { errors } = JSON.parse(response.payload);

	expect(errors).toEqual([
		{
			status: 422,
			source: {
				pointer: "#/required",
			},
			title: "required",
			detail: "should have required property 'name'",
		},
	]);
};

describe("Validator", () => {
	it("should return 200 if no validation is required", async () => {
		expect((await sendRequest({ url: "/" })).statusCode).toBe(200);
	});

	it("should return 422 if query validation fails", async () => {
		expect422(await sendRequest({ url: "/query" }));
	});

	it("should return 422 if payload validation fails", async () => {
		expect422(await sendRequest({ url: "/payload", method: "POST" }));
	});

	it("should return 422 if params validation fails", async () => {
		expect422(await sendRequest({ url: "/params" }));
	});

	it("should return 422 if headers validation fails", async () => {
		expect422(await sendRequest({ url: "/headers" }));
	});
});
