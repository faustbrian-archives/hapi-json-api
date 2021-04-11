export const wrapResponse = (data) => ({
	...{ jsonapi: { version: "1.0" } },
	...data,
});
