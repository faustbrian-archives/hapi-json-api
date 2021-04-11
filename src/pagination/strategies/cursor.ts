import { get } from "lodash";
import { config } from "../../config";
import { Strategy } from "./strategy";

class CursorStrategy extends Strategy {
	public onPreHandler(request, h, routeOptions) {
		this.setRequest(request);

		const cursorKey = "strategies.cursor.cursor";
		const cursor =
			get(routeOptions, cursorKey) || config.get(`pagination.${cursorKey}`);

		this.setQueryParameter("page[cursor]", cursor);

		return h.continue;
	}

	public onPostHandler(request, h) {
		this.setRequest(request);

		return h.continue;
	}
}

export const cursorStrategy = new CursorStrategy();
