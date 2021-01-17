import validator from "validator";
import httpErrors from "http-errors";
import stripHTML from "string-strip-html";
import { capitalize } from "~common/utils";

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

        let theTarget = target;
        if (validator.isMongoId(target)) theTarget = `api/${target}`;

        const fetchObject = {
            method: method,
            headers: Object.assign(additionalHeaders, {
                redirect: 'follow',
                mode: 'cors',
                Accept: "application/json",
                "Content-Type": "application/json"
            })
        };
        if (!["GET", "HEAD"].includes(method) && Object.keys(data).length) Object.assign(fetchObject, { body: JSON.stringify(data) });
        const response = await fetch(theTarget, fetchObject);

        const defaultResponse = { success: false, error: { name: "unknownError" } };
        const httpError = this.handleHttpErrors(response, defaultResponse);
        if (httpError) return httpError;

        const theJson = await response.json();
        let mapped = {};
        if (theJson.success && theJson.data?.models && theJson.data.models instanceof Array) {
            this.handleModels(theJson, mapped);
        } else if (theJson.data?.errors && theJson.data.errors instanceof Object) {
            this.handleHttpErrors(theJson, mapped);
        } else mapped = theJson;
        return Object.keys(mapped).length ? mapped : defaultResponse;
    }

    static handleDatabaseError(responseJson, mapping = {}) {
        if (!responseJson.data.errors) return;
        mapping.success = false;
        mapping.data = { models: [] };
        for (const key in responseJson.data.errors) {
            if (Object.hasOwnProperty.call(responseJson.data.errors, key)) {
                const rawError = responseJson.data.errors[key];
                rawError.className = "Error";
                delete rawError.properties;
                const error = new Error();
                Object.assign(error, rawError);
                mapping.data.models.push(error);
            }
        }
    }

    static async handleHttpErrors(response, mapping = {}) {
        if (response.status >= 400) {
            let result = null;
            let matches = null;
            if (response.headers.get("Content-Type").includes("application/json")) {
                result = await response.json();
            } else {
                result = stripHTML(await response.text()).result;
                matches = result.match(/:(.*?)at/);
            }
            mapping.error = matches ? httpErrors(response.status, matches ? matches[1] : result) : result.error;
        }
        if (response.status < 200 || response.status >= 300) {
            if (response.status === 404) {
                window.vm.$toasted.error(window.vm.$t("notFound"), { className: "errorToaster" });
            } else if (!mapping.error.name && mapping.error.message) {
                window.vm.$toasted.error(mapping.error.message, { className: "errorToaster" });
            } else window.vm.$toasted.error(window.vm.$t(mapping.error.name), { className: "errorToaster" });
            return mapping;
        }
    }

    static handleModels(responseJson, mapping = {}) {
        if (!responseJson.data.models || !(responseJson.data.models instanceof Array)) return;
        mapping.success = true;
        mapping.data = { models: [] };
        for (const model of responseJson.data.models) {
            if (model.errors) {
                const errorMap = {};
                this.handleDatabaseError(model, errorMap);
                const errorModel = errorMap.data.models[0];
                errorModel.name = `${errorModel.name}${capitalize(errorModel.path)}${capitalize(errorModel.kind)}`;
                mapping.data.models.push(errorModel);
                continue;
            }
            if (!model.className) continue;
            mapping.data.models.push(this.store.addModel(model));
        }
    }
}
