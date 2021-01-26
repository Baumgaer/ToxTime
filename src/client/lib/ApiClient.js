import httpErrors from "http-errors";
import { stripHtml } from "string-strip-html";
import { isObjectLike, isArray } from "lodash";
import { Store } from "~client/lib/Store";

export default class ApiClient {

    static store = Store.getInstance();

    static post(target, data = {}, additionalHeaders = {}) {
        return this.request("POST", target, data, additionalHeaders);
    }

    static put(target, data = {}, additionalHeaders = {}) {
        return this.request("PUT", target, data, additionalHeaders);
    }

    static patch(target, data = {}, additionalHeaders = {}) {
        return this.request("PATCH", target, data, additionalHeaders);
    }

    static delete(target, data = {}, additionalHeaders = {}) {
        return this.request("DELETE", target, data, additionalHeaders);
    }

    static get(target, data = {}, additionalHeaders = {}) {
        return this.request("GET", target, data, additionalHeaders);
    }

    static async request(method, target, data, additionalHeaders) {
        const defaultHeaders = { redirect: 'follow', mode: 'cors', Accept: "application/json", "Content-Type": "application/json" };
        const fetchObject = { method, headers: Object.assign(additionalHeaders, defaultHeaders) };

        // HEAD and GET doesn't allow body, so apply body only when method is different
        if (!["GET", "HEAD"].includes(method) && Object.keys(data).length) Object.assign(fetchObject, { body: JSON.stringify(data) });

        const response = await fetch(target, fetchObject);

        // Errors can be receives as JSON or text, so we have to pass the whole response
        if (response.status >= 400) return this.handleHttpError(response);

        // Models always comes as JSON, so we can safely get the JSON
        return this.handleModels(await response.json());
    }

    /**
     *
     *
     * @static
     * @param {Response} response
     * @memberof ApiClient
     */
    static async handleHttpError(response) {
        let error = null;
        if (!response.headers.get("Content-Type").includes("application/json")) {
            const result = stripHtml(await response.text()).result;
            const matches = result.match(/:(.*?)at/);
            error = httpErrors(response.status, matches ? matches[1] : result);
        } else {
            error = new Error();
            Object.assign(error, await response.json());
        }

        if (response.status === 404) {
            window.vm.$toasted.error(window.vm.$t("notFound"), { className: "errorToaster" });
        } else if (!error.name && error.message) {
            window.vm.$toasted.error(error.message, { className: "errorToaster" });
        } else if (!error.name && !error.message) {
            window.vm.$toasted.error("unknownError", { className: "errorToaster" });
        } else window.vm.$toasted.error(window.vm.$t(error.name), { className: "errorToaster" });

        return error;
    }

    /**
     *
     *
     * @static
     * @param {any} responseJson
     * @returns {any}
     * @memberof ApiClient
     */
    static handleModels(responseJson) {

        if (isArray(responseJson)) {
            // We maybe have an array of models
            const processedModels = [];
            for (const model of responseJson) processedModels.push(this.handleModels(model));
            return processedModels;
        } else if (this.store.isModel(responseJson)) {
            // Seems to be a model, watch into every key to get submodels
            for (const key in responseJson) {
                if (Object.hasOwnProperty.call(responseJson, key)) {
                    const element = responseJson[key];
                    if (isObjectLike(element)) responseJson[key] = this.handleModels(responseJson[key]);
                }
            }
            return this.store.addModel(responseJson);
        }

        // We have something different...
        return responseJson;
    }
}
