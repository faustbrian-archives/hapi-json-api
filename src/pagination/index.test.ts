import "jest-extended";

import { plugin } from "../../src";
import { sendRequest } from "../__support__/utils";
import { createServer } from "./server";

describe("Test with defaults values", () => {
	it("Test if limit default is added to request object", async () => {
		const server = createServer();
		await server.register({ plugin });

		const { payload, query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[number]"]).toBe(1);
		expect(query["page[size]"]).toBe(100);
		expect(payload.meta.records.total).toBeUndefined();
	});

	it("Test with additional query string", async () => {
		const server = createServer();
		await server.register({ plugin });

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/?param=1&paramm=2",
		});

		expect(query.param).toBe("1");
		expect(query.paramm).toBe("2");
	});

	it("should set the default response status code when data paginated", async () => {
		const server = createServer();
		await server.register({ plugin });

		const { response } = await sendRequest(server, {
			method: "GET",
			url: "/users",
		});

		expect(response.statusCode).toBe(200);
	});
});

describe("Override default values", () => {
	// it('Override default limit and page', async () => {
	//   const options = {
	//     pagination: {
	//       query: {
	//         limit: {
	//           default: 7,
	//           name: 'myLimit',
	//         },
	//         page: {
	//           default: 2,
	//           name: 'myPage',
	//         },
	//       },
	//     },
	//   }

	//   const server = createServer()
	//   await server.register({ plugin, options })

	//   const { query } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/',
	//   })

	//   expect(query['page[size]']).toBeUndefined()
	//   expect(query['page[number]']).toBeUndefined()

	//   const limit = options.pagination.query['page[size]']
	//   const page = options.pagination.query['page[number]']
	//   expect(query[limit.name]).toBe(limit.default)
	//   expect(query[page.name]).toBe(page.default)
	// })

	it("Override defaults routes with include", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["/"],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[size]"]).toBe(100);
		expect(query["page[number]"]).toBe(1);
	});

	it("Override defaults routes with include 2", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["/"],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/users",
		});

		expect(query["page[size]"]).toBeUndefined();
		expect(query["page[number]"]).toBeUndefined();
	});

	it("Override defaults routes with regex in include", async () => {
		const options = {
			pagination: {
				routes: {
					include: [/^\/u.*s$/],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/users",
		});

		expect(query["page[size]"]).toBe(100);
		expect(query["page[number]"]).toBe(1);
	});

	it("Override defaults routes with both regex and string in include", async () => {
		const options = {
			pagination: {
				routes: {
					include: [/^\/hello$/, "/users"],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/users",
		});

		expect(query["page[size]"]).toBe(100);
		expect(query["page[number]"]).toBe(1);
	});

	it("Override defaults routes with regex in include without a match", async () => {
		const options = {
			pagination: {
				routes: {
					include: [/^\/hello.*$/],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/users",
		});

		expect(query["page[size]"]).toBeUndefined();
		expect(query["page[number]"]).toBeUndefined();
	});

	it("Override defaults routes with exclude", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["*"],
					exclude: ["/"],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[size]"]).toBeUndefined();
		expect(query["page[number]"]).toBeUndefined();
	});

	it("Override defaults routes with exclude 2", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["/users"],
					exclude: ["/"],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[size]"]).toBeUndefined();
		expect(query["page[number]"]).toBeUndefined();
	});

	it("Override defaults routes with regex in exclude", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["*"],
					exclude: [/^\/.*/],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[size]"]).toBeUndefined();
		expect(query["page[number]"]).toBeUndefined();
	});

	it("Override defaults routes with both regex and string in exclude", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["*"],
					exclude: [/^nothing/, "/"],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[size]"]).toBeUndefined();
		expect(query["page[number]"]).toBeUndefined();
	});

	it("Override defaults routes with regex without a match", async () => {
		const options = {
			pagination: {
				routes: {
					include: ["*"],
					exclude: [/^nothing/],
				},
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(query["page[size]"]).toBe(100);
		expect(query["page[number]"]).toBe(1);
	});

	// it('Override query parameter pagination - set active to false', async () => {
	//   const options = {
	//     pagination: {
	//       query: {
	//         limit: {
	//           default: 10,
	//         },
	//         pagination: {
	//           default: true,
	//           active: false,
	//         },
	//       },
	//     },
	//   }

	//   const server = createServer()
	//   await server.register({
	//     plugin,
	//     options,
	//   })

	//   const { payload } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/users?pagination=false',
	//   })

	//   expect(payload.data).toBeArray()
	//   expect(payload.data).toHaveLength(10)
	// })

	it("use custom baseUri instead of server provided uri", async () => {
		const myCustomUri = "https://127.0.0.1:81";
		const options = {
			pagination: {
				baseUri: myCustomUri,
			},
		};

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/",
		});

		expect(payload.links.first).toInclude(myCustomUri);
		expect(payload.links.self).toInclude(myCustomUri);
	});

	it("Do not override the response status code if no pagination", async () => {
		const server = createServer();
		await server.register({
			plugin,
		});

		const { response } = await sendRequest(server, {
			method: "GET",
			url: "/users?pagination=false",
		});
		expect(response.statusCode).toBe(200);
	});

	describe("Custom route options", () => {
		it("Force a route to include pagination", async () => {
			const options = {
				pagination: {
					routes: {
						include: ["/enabled"],
					},
				},
			};

			const server = createServer();
			await server.register({
				plugin,
				options,
			});

			const { query } = await sendRequest(server, {
				method: "GET",
				url: "/enabled",
			});

			expect(query["page[size]"]).toBe(100);
			expect(query["page[number]"]).toBe(1);
		});

		it("Force a route to exclude pagination", async () => {
			const options = {
				pagination: {
					routes: {
						exclude: ["/disabled"],
					},
				},
			};

			const server = createServer();
			await server.register({
				plugin,
				options,
			});

			const { query } = await sendRequest(server, {
				method: "GET",
				url: "/disabled",
			});

			expect(query["page[size]"]).toBeUndefined();
			expect(query["page[number]"]).toBeUndefined();
		});
	});
});

describe("Override on route level", () => {
	// it('Overriden defaults on route level with pagination to false', async () => {
	//   const server = createServer()
	//   await server.register(plugin)

	//   const { payload } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/defaults',
	//   })

	//   expect(payload.data).toBeArray()
	//   expect(payload.data).toHaveLength(10)
	// })

	// it('Overriden defaults on route level with pagination to true', async () => {
	//   const server = createServer()
	//   await server.register(plugin)

	//   const { payload, query } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/defaults?pagination=true',
	//   })

	//   expect(payload).toBeObject()
	//   expect(payload.data).toHaveLength(10)
	//   expect(payload.meta.records.total).toBe(20)
	//   expect(query['page[size]']).toBe(10)
	//   expect(query['page[number]']).toBe(2)
	// })

	it("Overriden defaults on route level with limit and page to 5 and 1", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload, query } = await sendRequest(server, {
			method: "GET",
			url: "/defaults?pagination=true&page[number]=1&page[size]=5",
		});

		expect(payload).toBeObject();
		expect(payload.data).toHaveLength(5);
		expect(payload.meta.records.total).toBe(20);
		expect(query["page[size]"]).toBe(5);
		expect(query["page[number]"]).toBe(1);
	});
});

describe("Passing page and limit as query parameters", () => {
	// const options = {
	//   pagination: {
	//     query: {
	//       limit: {
	//         default: 5,
	//         name: 'myLimit',
	//       },
	//       page: {
	//         default: 2,
	//         name: 'myPage',
	//       },
	//     },
	//   },
	// }

	it("Passing limit", async () => {
		const server = createServer();

		server.register(plugin);

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/?page[size]=5",
		});

		expect(query["page[size]"]).toBe(5);
		expect(query["page[number]"]).toBe(1);
	});

	// it('Wrong limit and page should return the defaults', async () => {
	//   const server = createServer()
	//   await server.register(plugin)

	//   const { query } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?page[size]=abc10&page[number]=c2',
	//   })

	//   expect(query['page[size]']).toBe(100)
	//   expect(query['page[number]']).toBe(1)
	// })

	// it('Wrong limit with badRequest behavior should return 400 bad request', async () => {
	//   const server = createServer()

	//   await server.register({
	//     plugin,
	//     options: {
	//       pagination: {
	//         query: {
	//           invalid: 'badRequest',
	//         },
	//       },
	//     },
	//   })

	//   const { response } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?page[size]=abc10',
	//   })

	//   expect(response.statusCode).toBe(400)
	// })

	// it('Wrong page with badRequest behavior should return 400 bad request', async () => {
	//   const server = createServer()

	//   await server.register({
	//     plugin,
	//     options: {
	//       pagination: {
	//         query: {
	//           invalid: 'badRequest',
	//         },
	//       },
	//     },
	//   })

	//   const { response } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?page[number]=abc10',
	//   })

	//   expect(response.statusCode).toBe(400)
	// })

	// it('Overriding and passing limit', async () => {
	//   const server = createServer()

	//   await server.register({
	//     plugin,
	//     options,
	//   })

	//   const { query } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?myLimit=7',
	//   })

	//   expect(query[options.pagination.query['page[size]'].name]).toBe(7)
	//   expect(query[options.pagination.query['page[number]'].name]).toBe(2)
	// })

	it("Passing page", async () => {
		const server = createServer();
		await server.register(plugin);

		const { query } = await sendRequest(server, {
			method: "GET",
			url: "/?page[number]=5",
		});

		expect(query["page[number]"]).toBe(5);
	});

	// it('Overriding and passing page', async () => {
	//   const server = createServer()

	//   await server.register({
	//     plugin,
	//     options,
	//   })

	//   const { query } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?myPage=5',
	//   })

	//   expect(query[options.pagination.query['page[size]'].name]).toBe(5)
	//   expect(query[options.pagination.query['page[number]'].name]).toBe(5)
	// })
});

describe("Test /users route", () => {
	it("Test default with totalCount added to request object", async () => {
		const urlForPage = (page) => [
			"http://localhost/users?",
			`page%5Bnumber%5D=${page}`,
			"&",
			"page%5Bsize%5D=5",
		];

		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/users?page[number]=2&page[size]=5",
		});

		expect(payload.meta).toBeObject();
		expect(payload.meta.records.page).toBe(5);
		expect(payload.meta.records.total).toBe(20);
		expect(payload.meta.pages.total).toBe(4);
		expect(payload.links.prev).toIncludeMultiple(urlForPage(1));
		expect(payload.links.next).toIncludeMultiple(urlForPage(3));
		expect(payload.links.last).toIncludeMultiple(urlForPage(4));
		expect(payload.links.first).toIncludeMultiple(urlForPage(1));
		expect(payload.links.self).toIncludeMultiple(urlForPage(2));

		expect(payload.data).toBeArray();
		expect(payload.data).toHaveLength(5);
	});
});

describe("Testing pageCount", () => {
	it("Limit is 3, page should be 7", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/users?page[size]=3",
		});

		expect(payload.meta.pages.total).toBe(7);
	});

	it("Limit is 4, page should be 5", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/users?page[size]=4",
		});

		expect(payload.meta.pages.total).toBe(5);
	});

	it("Limit is 1, page should be 20", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/users?page[size]=1",
		});

		expect(payload.meta.pages.total).toBe(20);
	});
});

describe("POST request", () => {
	it("Should work with a post request", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "POST",
			url: "/users",
		});

		expect(payload.data).toEqual(["Works"]);
	});
});

describe("Changing pagination query parameter", () => {
	it("Should return the results with no pagination", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/?pagination=false",
		});

		expect(payload.data).toBeArray();
	});

	it("Pagination to random value (default is true)", async () => {
		const server = createServer();
		await server.register(plugin);

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/?pagination=abcd",
		});

		expect(payload.meta).toBeObject();
		expect(payload.data).toBeArray();
	});

	// it('Pagination to random value (default is false)', async () => {
	//   const server = createServer()
	//   await server.register({
	//     plugin,
	//     options: {
	//       pagination: {
	//         query: {
	//           pagination: {
	//             default: false,
	//           },
	//         },
	//       },
	//     },
	//   })

	//   const { payload } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?pagination=abcd',
	//   })

	//   expect(payload.data).toBeArray()
	// })

	// it('Pagination explicitely to true', async () => {
	//   const options = {
	//     pagination: {
	//       query: {
	//         pagination: {
	//           default: true,
	//         },
	//       },
	//     },
	//   }

	//   const server = createServer()
	//   await server.register({
	//     plugin,
	//     options,
	//   })
	//   const { payload } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?pagination=true',
	//   })

	//   const names = options.pagination.meta
	//   expect(payload.meta).toBeObject()
	//   expect(payload.meta.limit).toBe(100)
	//   expect(payload.meta.page).toBe(1)
	//   expect(payload.meta.records.page).toBe(0)
	//   expect(payload.meta.records.total).toBeUndefined()
	//   expect(payload.meta.pages.total).toBeUndefined()
	//   // expect(payload.meta[names.hasNext.name]).toBeFalse()
	//   // expect(payload.meta[names.hasPrevious.name]).toBeFalse()
	//   expect(payload.data).toBeArray()
	//   expect(payload.data).toHaveLength(0)
	// })

	// it('Pagination default is false', async () => {
	//   const options = {
	//     pagination: {
	//       query: {
	//         pagination: {
	//           default: false,
	//         },
	//       },
	//     },
	//   }
	//   const server = createServer()
	//   await server.register({
	//     plugin,
	//     options,
	//   })

	//   const { payload } = await sendRequest(server, {
	//     method: 'GET',
	//     url: '/?pagination=true',
	//   })

	//   const names = options.pagination.meta

	//   expect(payload.meta).toBeObject()
	//   expect(payload.meta.limit).toBe(100)
	//   expect(payload.meta.page).toBe(1)
	//   expect(payload.meta.records.page).toBe(0)
	//   expect(payload.meta.records.total).toBeUndefined()
	//   expect(payload.meta.pages.total).toBeUndefined()
	//   // expect(payload.meta[names.hasNext.name]).toBeFalse()
	//   // expect(payload.meta[names.hasPrevious.name]).toBeFalse()
	//   expect(payload.data).toBeArray()
	//   expect(payload.data).toHaveLength(0)
	// })
});

describe("Wrong options", () => {
	it("Should return an error on register", async () => {
		const server = createServer();

		await expect(
			server.register({
				plugin,
				options: {
					pagination: {
						query: {
							limit: {
								default: "abcd",
							},
						},
					},
				},
			})
		).rejects.toThrow();
	});
});

describe("Results with other keys", () => {
	it("Should return the response with the original response keys", async () => {
		const server = createServer();
		await server.register(plugin);

		const request = {
			method: "GET",
			url: "/users2",
		};

		const { payload } = await sendRequest(server, request);

		expect(payload.otherKey).toBe("otherKey");
		expect(payload.otherKey2).toBe("otherKey2");
		expect(payload.meta).toBeDefined();
		expect(payload.data).toBeDefined();
	});

	it("Should return an internal server error", async () => {
		const server = createServer();
		await server.register(plugin);

		server.route({
			method: "GET",
			path: "/error",
			handler: (_request, h: any) => h.withPagination({ results: [] }, 0),
		});

		const request = {
			method: "GET",
			url: "/error",
		};

		const { response } = await sendRequest(server, request);

		expect(response.statusCode).toBe(500);
	});

	it("Should return an internal server error #2", async () => {
		const server = createServer();

		await server.register(plugin);

		server.route({
			method: "GET",
			path: "/error",
			handler: (_request, h: any) =>
				h.withPagination({ results: [] }, 0, { key: "res" }),
		});

		const request = {
			method: "GET",
			url: "/error",
		};

		const { response } = await sendRequest(server, request);

		expect(response.statusCode).toBe(500);
	});

	it("Should not override meta and results", async () => {
		const server = createServer();
		await server.register(plugin);

		server.route({
			method: "GET",
			path: "/nooverride",
			handler: (_request, h: any) =>
				h.withPagination({ res: [], results: "results", meta: "meta" }, 0, {
					key: "res",
				}),
		});

		const request = {
			method: "GET",
			url: "/nooverride",
		};

		const { payload } = await sendRequest(server, request);

		expect(payload.meta).not.toBe("meta");
		expect(payload.data).not.toBe("results");
	});
});

describe("Empty result set", () => {
	it("Counts should be 0", async () => {
		const server = createServer();
		await server.register(plugin);

		const request = {
			method: "GET",
			url: "/empty",
		};

		const { payload } = await sendRequest(server, request);

		expect(payload.meta.records.total).toBeUndefined();
		expect(payload.meta.records.page).toBe(0);
		expect(payload.meta.pages.total).toBe(0);
	});

	// it('Staus code should be >=200 & <=299', async () => {
	//   const server = createServer()
	//   await server.register(plugin)

	//   const request = {
	//     method: 'GET',
	//     url: '/empty',
	//   }

	//   const { response } = await sendRequest(server, request)

	//   expect(response.statusCode).toBeGreaterThan(199)
	//   expect(response.statusCode).toBeLessThan(300)
	// })
});

describe("Exception", () => {
	it("Should not continue on exception", async () => {
		const server = createServer();
		await server.register(plugin);

		const { response } = await sendRequest(server, {
			method: "GET",
			url: "/exception",
		});
		expect(response.statusCode).toBe(500);
	});

	it("Should not process further if response code is not in 200 - 299 range", async () => {
		const server = createServer();
		await server.register(plugin);

		const { response, payload } = await sendRequest(server, {
			method: "GET",
			url: "/array-exception",
		});

		expect(payload.data.message).toBe("Custom Error Message");
		expect(response.statusCode).toBe(500);
	});

	it("Should not process further if upgrade request is received", async () => {
		const server = createServer();
		await server.register(plugin);

		const { response } = await sendRequest(server, {
			method: "GET",
			url: "/ws-upgrade",
		});
		expect(response.statusCode).toBe(101);
	});
});

describe("Empty baseUri should give relative url", () => {
	it("use custom baseUri instead of server provided uri", async () => {
		const options = {
			pagination: {
				baseUri: "",
			},
		};

		const urlForPage = (page) => [
			"/users?",
			`page%5Bnumber%5D=${page}`,
			"&",
			"page%5Bsize%5D=5",
		];

		const server = createServer();
		await server.register({
			plugin,
			options,
		});

		const { payload } = await sendRequest(server, {
			method: "GET",
			url: "/users?page[size]=5",
		});

		expect(payload.links.first).toIncludeMultiple(urlForPage(1));
		expect(payload.links.first).not.toInclude("localhost");
		expect(payload.links.self).toIncludeMultiple(urlForPage(1));
		expect(payload.links.next).toIncludeMultiple(urlForPage(2));
	});
});

describe("Should include original values of query parameters in pagination urls when Joi validation creates objects", () => {
	const urlPrefix = "http://localhost/query-params?";
	const urlPrefixLen = urlPrefix.length;
	const expectedCount = 3;

	const splitParams = (url) => {
		// expect(url).toStartWith(urlPrefix)
		return url.substr(urlPrefixLen).split("&");
	};

	it("Should include dates in pagination urls", async () => {
		const dateQuery = "testDate=1983-01-27";

		const server = createServer();
		await server.register(plugin);

		const { payload, query } = await sendRequest(server, {
			method: "GET",
			url: `/query-params?${dateQuery}&page[number]=2&page[size]=1`,
		});

		expect(query.testDate).toBeDate();
		expect(query.testDate.toISOString()).toBe("1983-01-27T00:00:00.000Z");

		expect(payload.meta.records.page).toBe(expectedCount);
		expect(payload.meta.pages.total).toBe(expectedCount);
		expect(payload.meta.records.total).toBe(expectedCount);
		expect(splitParams(payload.links.next)).toContain(dateQuery);
		expect(splitParams(payload.links.prev)).toContain(dateQuery);
		expect(splitParams(payload.links.self)).toContain(dateQuery);
		expect(splitParams(payload.links.first)).toContain(dateQuery);
		expect(splitParams(payload.links.last)).toContain(dateQuery);
	});

	it("Should include arrays in pagination urls", async () => {
		const arrayQuery = `testArray=${encodeURIComponent("[3,4]")}`;

		const server = createServer();
		await server.register(plugin);

		const { payload, query } = await sendRequest(server, {
			method: "GET",
			url: `/query-params?${arrayQuery}&page[number]=2&page[size]=1`,
		});

		expect(query.testArray).toBeArray();
		expect(query.testArray).toEqual([3, 4]);

		expect(payload.meta.records.page).toBe(expectedCount);
		expect(payload.meta.pages.total).toBe(expectedCount);
		expect(payload.meta.records.total).toBe(expectedCount);
		expect(splitParams(payload.links.next)).toContain(arrayQuery);
		expect(splitParams(payload.links.prev)).toContain(arrayQuery);
		expect(splitParams(payload.links.self)).toContain(arrayQuery);
		expect(splitParams(payload.links.first)).toContain(arrayQuery);
		expect(splitParams(payload.links.last)).toContain(arrayQuery);
	});

	it("Should include objects in pagination urls", async () => {
		const objectQuery = `testObject=${encodeURIComponent(
			JSON.stringify({ a: 1, b: 2 })
		)}`;

		const server = createServer();
		await server.register(plugin);

		const { payload, query } = await sendRequest(server, {
			method: "GET",
			url: `/query-params?${objectQuery}&page[number]=2&page[size]=1`,
		});
		expect(query.testObject).toBeObject();
		expect(query.testObject).toEqual({ a: 1, b: 2 });

		expect(payload.meta.records.page).toBe(expectedCount);
		expect(payload.meta.pages.total).toBe(expectedCount);
		expect(payload.meta.records.total).toBe(expectedCount);
		expect(splitParams(payload.links.next)).toContain(objectQuery);
		expect(splitParams(payload.links.prev)).toContain(objectQuery);
		expect(splitParams(payload.links.self)).toContain(objectQuery);
		expect(splitParams(payload.links.first)).toContain(objectQuery);
		expect(splitParams(payload.links.last)).toContain(objectQuery);
	});
});

describe("Override on route level error", () => {
	it("Should return an error", async () => {
		const server = createServer();
		server.route({
			path: "/error",
			method: "GET",
			// @ts-ignore
			config: {
				plugins: {
					pagination: {
						enabled: "a",
					},
				},
				handler: (_request, h) => h(),
			},
		});

		await expect(server.register(plugin)).rejects.toThrow();
	});
});

describe("Strategies", () => {
	it("page", async () => {
		const server = createServer();
		await server.register({ plugin });

		const { jsonapi } = await sendRequest(server, {
			method: "GET",
			url: "/?page[number]=1&page[size]=5",
		});

		expect(jsonapi.pagination.number).toBe(1);
		expect(jsonapi.pagination.size).toBe(5);
	});

	it("offset", async () => {
		const server = createServer();
		await server.register({ plugin });

		const { jsonapi } = await sendRequest(server, {
			method: "GET",
			url: "/?page[offset]=10&page[limit]=20",
		});

		expect(jsonapi.pagination.offset).toBe(10);
		expect(jsonapi.pagination.limit).toBe(20);
	});

	it("cursor", async () => {
		const server = createServer();
		await server.register({ plugin });

		const { jsonapi } = await sendRequest(server, {
			method: "GET",
			url: "/?page[cursor]=10",
		});

		expect(jsonapi.pagination.cursor).toBe(10);
	});
});
