import { Request, ResponseToolkit } from "@hapi/hapi";
import AJV, { ErrorObject } from "ajv";
import { get } from "lodash";

import { IValidationError } from "./interfaces";

const mapErrors = (type: string, errors: ErrorObject[]): any[] => {
	return errors.map((error) => {
		const report: IValidationError = {
			status: 422,
			source: { pointer: error.schemaPath },
			title: error.keyword,
		};

		if (error.message) {
			report.detail = error.message;
		}

		// @ts-ignore
		if (error.dataPath) {
			// @ts-ignore
			report.source.parameter = error.dataPath;
		}

		// @ts-ignore
		if (type === "query" && error.params.additionalProperty) {
			report.title = "Invalid Query Parameter";
			report.detail = `The endpoint does not have a '${
				// @ts-ignore
				error.params.additionalProperty
			}' query parameter.`;
		}

		return report;
	});
};

export const onPreHandler = (request: Request, h: ResponseToolkit) => {
	const config = get(request.route.settings.plugins, "jsonapi.validate");

	if (!config) {
		return h.continue;
	}

	const ajv = new AJV();

	for (const type of ["headers", "params", "query", "payload"]) {
		const schema = config[type];

		if (schema) {
			// @TODO: enable this later on
			// if (type !== "headers") {
			// 	schema.additionalProperties = false;
			// }

			if (!ajv.validate(schema, request[type])) {
				return h
					.response({
						errors: ajv.errors ? mapErrors(type, ajv.errors) : [],
					})
					.code(422)
					.takeover();
			}
		}
	}

	return h.continue;
};
