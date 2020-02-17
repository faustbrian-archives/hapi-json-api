import Serializer from "json-api-serializer";
import { config } from "./config";
import { onPostHandler } from "./events/post-handler";
import { onPreHandler } from "./events/pre-handler";
import { onPreResponse } from "./events/pre-response";
import withPagination from "./pagination/decorator";
import { paginator } from "./pagination/paginator";
import { withJSON } from "./serializer";

export const plugin = {
	pkg: require("../package.json"),
	once: true,
	register: (server, options = {}) => {
		// Configure...
		config.load(server, options);

		if (config.hasError()) {
			throw config.getError();
		}

		// Configure Pagination...
		config.set("pagination.uri", config.get("pagination.baseUri", server.info.uri));

		paginator.init();

		// Expose...
		const ser = new Serializer();
		server.expose("Serializer", ser);

		// Extend...
		server.ext("onPreHandler", onPreHandler);
		server.ext("onPreResponse", onPreResponse);
		server.ext("onPostHandler", onPostHandler);

		// Decorate...
		server.decorate("toolkit", "withPagination", withPagination().decorate);
		server.decorate("toolkit", "withJSON", withJSON);
	},
};
