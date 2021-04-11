import { get } from "lodash";
import { config } from "../../config";
import { Strategy } from "./strategy";

class OffsetStrategy extends Strategy {
	public onPreHandler(request, h, routeOptions) {
		this.setRequest(request);

		const offsetKey = "strategies.offset.offset";
		const offset =
			get(routeOptions, offsetKey) || config.get(`pagination.${offsetKey}`);

		const limitKey = "strategies.offset.limit";
		const limit =
			get(routeOptions, limitKey) || config.get(`pagination.${limitKey}`);

		this.setQueryParameter("page[offset]", offset);
		this.setQueryParameter("page[limit]", limit);

		return h.continue;
	}

	public onPostHandler(request, h) {
		this.setRequest(request);

		return h.continue;
	}
}

export const offsetStrategy = new OffsetStrategy();
