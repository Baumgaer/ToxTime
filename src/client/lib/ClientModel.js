import BaseModel from "~common/lib/BaseModel";
import ApiClient from "~client/lib/ApiClient";
import onChange from "on-change";
import { v4 as uuid } from "uuid";

export default class ClientModel extends BaseModel {

    static className = "ClientModel";

    static collection = "clientModels";

    staging = false;

    /**
     * Builds the essential export for client side with a RawClass, a Schema and the Model
     *
     * @static
     * @template T
     * @param {T} RawClass "The Class" which describes the Model
     * @memberof ClientModel
     * @returns { {RawClass: T, Schema: import("mongoose").Schema<T>, Model: T} }
     */
    static buildClientExport(RawClass) {
        const schema = this.buildSchema(RawClass);
        const modelClass = class ModelClass extends RawClass {
            constructor(params = {}) {
                super();

                // Assign defaults
                for (const pathObject in schema.paths) {
                    if (Object.hasOwnProperty.call(schema.paths, pathObject)) {
                        const element = schema.paths[pathObject];
                        if (element.options.default !== undefined) {
                            this[pathObject] = element.options.default;
                        }
                    }
                }

                // Assign given values
                Object.assign(this, params, { collection: RawClass.collection, className: RawClass.className });
                if (!params._id) this._dummyId = uuid();
                this.staging = true;
            }
        };
        return { RawClass, Schema: schema, Model: modelClass, isClientModel: true };
    }

    getName(preferredField) {
        return this[preferredField] || this.name;
    }

    hasChanges() {
        const that = onChange.target(this);
        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        const stagedChanges = Reflect.getMetadata("stagedChanges", that);
        return Boolean(Object.keys(stagedChanges).length);
    }

    destroy() {
        ApiClient.store.removeModel(this);
    }

    async save() {
        const that = onChange.target(this);
        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        const stagedChanges = Reflect.getMetadata("stagedChanges", that);
        let additionalHeaders, data, method;
        if (that._id) {
            additionalHeaders = {};
            data = {};
            method = ApiClient.patch.bind(ApiClient);
            for (const key in stagedChanges) {
                if (Object.hasOwnProperty.call(that, key)) {
                    const value = that[key];
                    data[key] = value;
                }
            }
        } else {
            data = {};
            const schema = Object.getPrototypeOf(this).constructor.schema;
            for (const key in schema) if (Object.hasOwnProperty.call(schema, key)) data[key] = that[key];
            additionalHeaders = { "X-DUMMY-MODEL-ID": this._dummyId };
            method = ApiClient.post.bind(ApiClient);
        }

        const result = await method(`/${this.collection}${that._id ? "/" + that._id : ''}`, data, additionalHeaders);

        if (!result.data.models.some((model) => model instanceof Error)) {
            Reflect.defineMetadata("stagedChanges", {}, that);
        }

        return result;
    }
}
