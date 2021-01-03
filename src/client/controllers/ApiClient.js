import validator from "validator";
import User from "~client/models/User";

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
        console.log(command);
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

        if (response.status < 200 || response.status >= 300) return defaultResponse;
        const theJson = await response.json();
        const mapped = {};
        if (theJson.success && theJson.data?.models && theJson.data.models instanceof Array) {
            mapped.success = true;
            mapped.data = { models: [] };
            for (const model of theJson.data.models) {
                if (!model.className) continue;
                const newModel = new ApiClient.modelMap[model.className]();
                Object.assign(newModel, model);
                mapped.data.models.push(newModel);
            }
        }

        return Object.keys(mapped).length ? mapped : defaultResponse;
    }
}
ApiClient._store = {};
