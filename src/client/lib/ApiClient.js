import validator from "validator";
import httpErrors from "http-errors";
import stripHTML from "string-strip-html";

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
        if (response.status >= 400) {
            let result = null;
            let matches = null;
            if (response.headers.get("Content-Type").includes("application/json")) {
                result = await response.json();
            } else {
                result = stripHTML(await response.text()).result;
                matches = result.match(/:(.*?)at/);
            }
            defaultResponse.error = matches ? httpErrors(response.status, matches ? matches[1] : result) : result.error;
        }
        if (response.status < 200 || response.status >= 300) {
            if (response.status === 404) {
                window.vm.$toasted.error(window.vm.$t("notFound"), { className: "errorToaster" });
            } else if (!defaultResponse.error.name && defaultResponse.error.message) {
                window.vm.$toasted.error(defaultResponse.error.message, { className: "errorToaster" });
            } else window.vm.$toasted.error(window.vm.$t(defaultResponse.error.name), { className: "errorToaster" });
            return defaultResponse;
        }
        const theJson = await response.json();
        let mapped = {};
        if (theJson.success && theJson.data?.models && theJson.data.models instanceof Array) {
            this.handleModels(theJson, mapped);
        } else mapped = theJson;
        return Object.keys(mapped).length ? mapped : defaultResponse;
    }

    static handleModels(responseJson, mapping = {}) {
        mapping.success = true;
        mapping.data = { models: [] };
        for (const model of responseJson.data.models) {
            if (!model.className) continue;
            mapping.data.models.push(this.store.addModel(model));
        }
    }
}
