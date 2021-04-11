import Hapi from "@hapi/hapi";

export class Parser {
	public static fields(request: Hapi.Request) {
		const pattern = /fields\[(.*?)\]/;

		const matches = [];
		for (const [key, value] of Object.entries(request.query)) {
			if (RegExp(pattern).test(key)) {
				matches.push({
					// @ts-ignore
					type: key.match(/\[(.*?)\]/)[1],
					// @ts-ignore
					fields: value.split(","),
				});
			}
		}

		return matches;
	}

	public static filter(request: Hapi.Request) {
		const pattern = /filter\[(.*?)\]/;

		const matches = [];
		for (const [key, value] of Object.entries(request.query)) {
			if (RegExp(pattern).test(key)) {
				matches.push({
					// @ts-ignore
					field: key.match(/\[(.*?)\]/)[1],
					// @ts-ignore
					value,
				});
			}
		}

		return matches;
	}

	// public static include(request: Hapi.Request) {
	public static include(request: any) {
		const parameters = request.query.include || "";

		return parameters.split(",").map(parameter => ({
			relationship: parameter,
		}));
	}

	public static pagination(request: Hapi.Request) {
		const allowed = ["number", "size", "offset", "limit", "cursor"];
		const pattern = /page\[(.*?)\]/;

		const matches = {};
		for (const [key, value] of Object.entries(request.query)) {
			if (RegExp(pattern).test(key)) {
				// @ts-ignore
				const parameter = key.match(/\[(.*?)\]/)[1];

				if (allowed.includes(parameter!)) {
					matches[parameter!] = +value;
				}
			}
		}

		return matches;
	}

	// public static sort(request: Hapi.Request) {
	public static sort(request: any) {
		const parameters = request.query.sort || "";

		return parameters.split(",").map(parameter => ({
			field: parameter.startsWith("-") ? parameter.substr(1) : parameter,
			ascending: !parameter.startsWith("-"),
		}));
	}
}
