import Hapi from "@hapi/hapi";
import { paginator } from "../pagination/paginator";

export const onPostHandler = (request: Hapi.Request, h: Hapi.ResponseToolkit) => paginator.onPostHandler(request, h);
