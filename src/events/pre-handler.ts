import Boom from "@hapi/boom";
import Hapi from "@hapi/hapi";
import * as MediaType from "media-type";
import { paginator } from "../pagination/paginator";
import { Parser } from "../parser";
import { onPreHandler as validator } from "../validator";

const handleAcceptHeader = (request) => {
	if (request.headers.accept.indexOf("application/vnd.api+json") === -1) {
		throw Boom.notAcceptable(
			'Expected accept header to be "application/vnd.api+json"'
		);
	}
};

const handleContentTypeHeader = (request) => {
	const contentMedia = MediaType.fromString(request.headers["content-type"]);

	if (contentMedia.parameters.charset === "UTF-8") {
		delete contentMedia.parameters.charset;
	}

	const hasInvalidType = contentMedia.type !== "application";
	const hasInvalidSubType = contentMedia.subtype !== "vnd.api";
	const hasInvalidParameters = Object.keys(contentMedia.parameters).length > 0;

	if (hasInvalidType || hasInvalidSubType || hasInvalidParameters) {
		throw Boom.unsupportedMediaType(
			'Expected content-type header to be "application/vnd.api+json"'
		);
	}
};

// export const onPreHandler = (request: Hapi.Request, h: Hapi.ResponseToolkit) => {
export const onPreHandler = (request: any, h: Hapi.ResponseToolkit) => {
	if (request.headers["content-type"]) {
		handleContentTypeHeader(request);
	} else if (request.headers.accept) {
		handleAcceptHeader(request);
	}

	request.jsonapi = {
		include: Parser.include(request),
		sort: Parser.sort(request),
		filter: Parser.filter(request),
		pagination: Parser.pagination(request),
		fields: Parser.fields(request),
	};

	paginator.onPreHandler(request, h);

	return validator(request, h);
};
