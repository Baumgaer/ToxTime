import validator from "validator";
export default class ApiClient {

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

        const response = await fetch(theTarget, {
            method: method,
            headers: Object.assign(additionalHeaders, {
                redirect: 'follow',
                mode: 'cors',
                Accept: "application/json",
                "Content-Type": "application/json"
            }),
            body: JSON.stringify(data)
        });

        if (response.status < 200 || response.status >= 300) return Promise.resolve({ success: false, error: { name: "unknownError" } });
        return response.json();
    }
}
ApiClient.store = {};
