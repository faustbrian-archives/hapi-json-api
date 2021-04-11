import { some } from "lodash";
import { config } from "../config";
import { cursorStrategy } from "./strategies/cursor";
import { offsetStrategy } from "./strategies/offset";
import { pageStrategy } from "./strategies/page";

class Paginator {
	private config: any;

	public init() {
		this.config = config.get("pagination");
	}

	public getRouteOptions(request) {
		return request.route.settings.plugins.pagination || {};
	}

	public containsPath(path, array) {
		return some(array, (item) =>
			item instanceof RegExp ? item.test(path) : item === path
		);
	}

	public isValidRoute(request) {
		const options = this.getRouteOptions(request);

		const { include, exclude } = this.config.routes;
		const { method, path } = request.route;

		if (options.enabled) {
			return options.enabled;
		}

		if (!["get", "post"].includes(method)) {
			return false;
		}

		if (exclude && this.containsPath(path, exclude)) {
			return false;
		}

		if (include[0] === "*") {
			return true;
		}

		if (!this.containsPath(path, include)) {
			return false;
		}

		return true;
	}

	public getPagination(request) {
		const routeDefaults = this.getRouteOptions(request).defaults || {};

		// this.config.query.pagination.default
		return routeDefaults.pagination ? routeDefaults.pagination : true;
	}

	public onPreHandler(request, h) {
		if (this.isValidRoute(request)) {
			const routeDefaults = this.getRouteOptions(request).defaults || {};

			if (!this.getPagination(request)) {
				return h.continue;
			}

			if (this.config.strategy === "cursor") {
				return cursorStrategy.onPreHandler(request, h, routeDefaults);
			}

			if (this.config.strategy === "offset") {
				return offsetStrategy.onPreHandler(request, h, routeDefaults);
			}

			if (this.config.strategy === "page") {
				return pageStrategy.onPreHandler(request, h, routeDefaults);
			}
		}

		return h.continue;
	}

	public onPostHandler(request, h) {
		const statusCode = request.response.statusCode;
		const processResponse =
			this.isValidRoute(request) &&
			statusCode >= 200 &&
			statusCode <= 299 &&
			this.getPagination(request);

		if (!processResponse) {
			return h.continue;
		}

		if (this.config.strategy === "cursor") {
			return cursorStrategy.onPostHandler(request, h);
		}

		if (this.config.strategy === "offset") {
			return offsetStrategy.onPostHandler(request, h);
		}

		if (this.config.strategy === "page") {
			return pageStrategy.onPostHandler(request, h);
		}

		return h.continue;
	}
}

export const paginator = new Paginator();
