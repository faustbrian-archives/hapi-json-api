import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import Hoek from "@hapi/hoek";
import * as qs from "querystring";
import { config } from "../../config";

export class Strategy {
	protected request: any;
	// protected request: Hapi.Request;

	public setRequest(request: Hapi.Request) {
		this.request = request;
	}

	public getResults() {
		const { source }: any = this.request.response;

		const results = Array.isArray(source) ? source : source.results;

		Hoek.assert(Array.isArray(results), "The results must be an array");

		return { source, results };
	}

	public setQueryParameter(name, defaultValue) {
		let value: number = 0;

		if (this.request.query[name] || this.request.query[name] === 0) {
			value = parseInt(this.request.query[name], 10);

			if (isNaN(value)) {
				throw Boom.badRequest(`Invalid ${name}`);
			}
		}

		this.request.query[name] = value || defaultValue;
	}

	public getFullUri(query) {
		const baseUri = `${config.get("pagination.uri")}${this.request.url.pathname}?`;
		const baseQuery = { ...this.request.query, ...this.request.orig.query };

		return baseUri + qs.stringify(Hoek.applyToDefaults(baseQuery, query));
	}
}
