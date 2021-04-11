import Hapi from "@hapi/hapi";
import { config } from "../config";
import { wrapResponse } from "../helpers";

const setHeader = (value) => {
	const header = "application/vnd.api+json";
	value.headers["content-type"] = header;
	value.headers.accept = header;
};

const handleBoom = (request, meta) => {
	const { response } = request;
	const { output } = response;

	output.payload = wrapResponse({
		errors: [
			{
				title: output.payload.error,
				status: output.statusCode,
				detail: output.payload.message,
			},
		],
		meta: { id: request.info.id, ...meta },
	});

	if (response.data) {
		if (output.statusCode === 500) {
			request.log(
				"error",
				response.data instanceof Buffer
					? response.data.toString()
					: response.data
			);
		}
	}

	setHeader(output);
};

const handleJoi = (request, meta) => {
	const { response } = request;
	const { output } = response;

	const getErrorMessage = (details) =>
		`${details.message} (${details.path.join(".")})`;

	const error: any = {
		title: output.payload.error,
		status: output.statusCode,
		detail: output.payload.message,
	};

	if (response.details) {
		error.details = response.details.map(getErrorMessage).join(", ");
	}

	output.payload = wrapResponse({
		errors: [error],
		meta: { id: request.info.id, ...meta },
	});

	setHeader(output);
};

const handleSuccess = (request, meta) => {
	const { response } = request;

	if (response.source) {
		if (response.source.errors) {
			response.source = wrapResponse(response.source);
		} else {
			response.source =
				response.source.links || response.source.data
					? wrapResponse(response.source)
					: wrapResponse({ data: response.source });
		}

		response.source.meta = {
			...response.source.meta,
			id: request.info.id,
			...meta,
		};
	}

	setHeader(response);
};

// export const onPreResponse = (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
export const onPreResponse = (request: any, h: Hapi.ResponseToolkit) => {
	const meta = config.get("meta");

	if (request.method === "options") {
		return h.continue;
	}

	if (request.response.isJoi) {
		handleJoi(request, meta);
	} else if (request.response.isBoom) {
		handleBoom(request, meta);
	} else {
		handleSuccess(request, meta);
	}

	return h.continue;
};
