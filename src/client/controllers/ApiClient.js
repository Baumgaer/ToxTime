import validator from "validator";
import User from "~client/models/User";
import httpErrors from "http-errors";
import stripHTML from "string-strip-html";

export default class ApiClient {

    static get modelMap() {
        return {
            User: User
        };
    }

    static get store() {
        return ApiClient._store;
    }

    static set store(command) {
        if (command.name === "add") {
            if (!ApiClient._store[command.collection]) ApiClient._store[command.collection] = {};
            ApiClient._store[command.collection][command.key] = command.value;
        }
        if (command.name === "remove") {
            if (!ApiClient._store[command.collection] || !ApiClient._store[command.collection][command.key]) return;
            delete ApiClient._store[command.collection][command.key];
        }

        if (command.name === "update") {
            if (!ApiClient._store[command.collection] || !ApiClient._store[command.collection][command.key]) return;
            Object.assign(ApiClient._store[command.collection][command.key], command.value);
        }
    }

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
        if (!["GET", "HEAD"].includes(method)) Object.assign(fetchObject, { body: JSON.stringify(data) });
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
        if (response.status < 200 || response.status >= 300) return defaultResponse;
        const theJson = await response.json();
        let mapped = {};
        if (theJson.success && theJson.data?.models && theJson.data.models instanceof Array) {
            mapped.success = true;
            mapped.data = { models: [] };
            for (const model of theJson.data.models) {
                if (!model.className) continue;
                const newModel = new ApiClient.modelMap[model.className]();
                Object.assign(newModel, model);
                mapped.data.models.push(newModel);
                this.store = {
                    name: "add",
                    collection: model.collection,
                    key: model._id,
                    value: newModel
                };
            }
        } else mapped = theJson;

        return Object.keys(mapped).length ? mapped : defaultResponse;
    }
}
ApiClient._store = {};
