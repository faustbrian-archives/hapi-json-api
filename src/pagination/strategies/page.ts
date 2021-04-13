import { get } from "lodash";

import { config } from "../../config";
import { Strategy } from "./strategy";

class PageStrategy extends Strategy {
	public onPreHandler(request, h, routeOptions) {
		this.setRequest(request);

		const pageNumberKey = "strategies.page.number";
		const pageNumber =
			get(routeOptions, pageNumberKey) ||
			config.get(`pagination.${pageNumberKey}`);

		const sizeKey = "strategies.page.size";
		const size =
			get(routeOptions, sizeKey) || config.get(`pagination.${sizeKey}`);

		this.setQueryParameter("page[number]", +pageNumber);
		this.setQueryParameter("page[size]", +size);

		return h.continue;
	}

	public onPostHandler(request, h) {
		this.setRequest(request);

		const { source, results } = this.getResults();

		const currentPage = this.request.query["page[number]"];
		const currentSize = this.request.query["page[size]"];

		const numberOfRecords =
			source.numberOfRecords || this.request.numberOfRecords;

		let numberOfPages = 0;

		if (numberOfRecords) {
			const totalPages = Math.trunc(numberOfRecords / currentSize);

			numberOfPages =
				totalPages + (numberOfRecords % currentSize === 0 ? 0 : 1);
		}

		const hasMore = numberOfRecords !== 0 && currentPage < numberOfPages;

		const newSource = {
			links: {
				self: this.getUri(currentPage),
				first: this.getUri(1),
				prev: this.getUri(currentPage - 1),
				next: hasMore ? this.getUri(currentPage + 1) : undefined,
				last: this.getUri(numberOfPages),
			},
			meta: {
				path: config.get("pagination.uri", "/"),
				records: {
					total: numberOfRecords || undefined,
					page: results.length,
				},
				pages: {
					has_more: !!hasMore,
					total: numberOfPages,
					self: currentPage,
					first: 1,
					next: hasMore ? currentPage + 1 : undefined,
					prev: currentPage - 1 || undefined,
					last: numberOfPages || currentPage,
				},
			},
			data: results,
		};

		if (source.response) {
			for (const key of Object.keys(source.response)) {
				if (!["meta", "results"].includes(key)) {
					newSource[key] = source.response[key];
				}
			}
		}

		this.request.response.source = newSource;

		return h.continue;
	}

	public getUri(page) {
		return page ? this.getFullUri({ "page[number]": page }) : undefined;
	}
}

export const pageStrategy = new PageStrategy();
