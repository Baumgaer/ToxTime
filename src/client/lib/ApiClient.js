import { stripHtml } from "string-strip-html";
import { isObjectLike, isArray, isPlainObject, isMongoId } from "~common/utils";
import { Store } from "~client/lib/Store";

import CustomError from "~common/lib/CustomError";

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

        if (response.headers.get("Content-Type").includes("application/json")) {
            return this.handleModels(await response.json());
        }
        return {};
    }

    static upload(method, target, options = {}, additionalHeaders = {}) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, target, true);

        for (const headername in additionalHeaders) {
            if (Object.hasOwnProperty.call(additionalHeaders, headername)) {
                const value = additionalHeaders[headername];
                xhr.setRequestHeader(headername, value);
            }
        }

        xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable && options.onProgress) options.onProgress(Math.round((event.loaded * 100 / event.total) || 1));
        });

        xhr.addEventListener("readystatechange", () => {
            if (xhr.readyState === 4) {
                const customResponse = {
                    status: xhr.status,
                    statusText: xhr.statusText,
                    headers: {
                        get: (name) => {
                            return new Promise((resolve) => {
                                const responseInterval = setInterval(() => {
                                    if (!xhr.HEADERS_RECEIVED) return;
                                    resolve(xhr.getResponseHeader(name));
                                    clearInterval(responseInterval);
                                });
                            });
                        }
                    },
                    text: () => xhr.responseText,
                    json: () => JSON.parse(xhr.response)
                };

                if (xhr.status >= 400) {
                    const errors = this.handleHttpError(customResponse);
                    if (options.onError) options.onError(errors);
                    return;
                }

                if (xhr.response) {
                    const models = this.handleModels(JSON.parse(xhr.response));
                    if (options.onSuccess) options.onSuccess(models);
                }
            }
        });

        xhr.upload.addEventListener("abort", () => {
            if (options.onAbort) options.onAbort();
        });

        xhr.send(options.formData);
        return xhr;
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
        if (!(await response.headers.get("Content-Type")).includes("application/json")) {
            const result = stripHtml(await response.text()).result;
            const matches = result.match(/:(.*?)at/);
            error = new Error(matches ? matches[1] : result);
            error.status = response.status;
        } else {
            error = new Error();
            Object.assign(error, await response.json());
        }

        if (response.status === 404) {
            window.$toasted.error(window.$t("notFound"), { className: "errorToaster" });
        } else if (!error.name && error.message) {
            window.$toasted.error(error.message, { className: "errorToaster" });
        } else if (!error.name && !error.message) {
            window.$toasted.error("unknownError", { className: "errorToaster" });
        } else window.$toasted.error(window.$t(error.name), { className: "errorToaster" });

        return error;
    }

    static handleOtherErrors(responseJson) {
        if (!isPlainObject(responseJson)) return null;
        let error = null;
        if ("errors" in responseJson && isPlainObject(responseJson.errors) && Object.keys(responseJson.errors).every((key) => responseJson.errors[key].name === "ValidatorError")) {
            error = new CustomError("ValidatorError", "", {
                bulk: Object.keys(responseJson.errors).map((key) => {
                    const subError = responseJson.errors[key];
                    return new CustomError(subError.properties.name, subError.properties.message, subError.properties);
                })
            });
        } else if (responseJson.className === "Error") {
            if (responseJson.name === "MongoError" && responseJson.code === 11000) {
                error = new CustomError("DuplicateError", "", responseJson.keyValue);
            } else error = new CustomError(responseJson.name, responseJson.message);
        }
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
    static handleModels(responseJson, className, keyName) {

        if (isArray(responseJson)) {
            // We maybe have an array of models
            const processedModels = [];
            for (const model of responseJson) processedModels.push(this.handleModels(model, className, keyName));
            return processedModels;
        } else if (this.store.isModel(responseJson)) {
            // Seems to be a model, watch into every key to get submodels
            for (const key in responseJson) {
                if (Object.hasOwnProperty.call(responseJson, key) && (isObjectLike(responseJson[key]) || isMongoId(responseJson[key]))) {
                    if (responseJson[key].wasted) {
                        this.handleModels(responseJson[key], className, key);
                    } else responseJson[key] = this.handleModels(responseJson[key], responseJson.className, key);
                }
            }
            if (responseJson.wasted) return this.store.removeModel(responseJson);
            return this.store.addModel(responseJson);
        } else if (isMongoId(responseJson)) {
            const rawClass = window._modelMap[className]?.RawClass;
            let field = rawClass?.getSchemaObject()[keyName];
            if (field) {
                let ref = field.ref;
                if (!ref) ref = field.type?.ref;
                if (!ref) ref = field?.type[0].ref;
                const dataCollectionName = window._modelMap[ref].RawClass.dataCollectionName;
                let model = this.store.getModelById(dataCollectionName, responseJson);
                if (!model) model = this.store.addModel({ dataCollectionName, className: ref, _id: responseJson });
                return model;
            }
        }

        const mayError = this.handleOtherErrors(responseJson);
        if (mayError) return mayError;

        // We have something different...
        return responseJson;
    }
}
