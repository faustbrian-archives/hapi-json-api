export function withJSON(
	type: string,
	data: object | object[],
	extraData?,
	schema?
): object {
	// @ts-ignore
	const { Serializer } = this.request.server.plugins[
		"@konceiver/hapi-json-api"
	];

	// @ts-ignore
	return this.response(Serializer.serialize(type, data, schema, extraData));
}
