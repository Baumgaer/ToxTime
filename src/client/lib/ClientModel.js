import BaseModel from "~common/lib/BaseModel";
import onChange from "on-change";
import { v4 as uuid } from "uuid";
import ApiClient from "~client/lib/ApiClient";

export default class ClientModel extends BaseModel {

    static className = "ClientModel";

    static collection = "clientModels";

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
                Object.assign(this, params, {
                    collection: RawClass.collection,
                    className: RawClass.className
                });
                if (!params._id) this._dummyId = uuid();
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
            additionalHeaders = { "X-DUMMY-MODEL-ID": this._dummyId };
            data = JSON.parse(JSON.stringify(that));
            method = ApiClient.post.bind(ApiClient);
        }
        return method(`/${this.collection}/${that._id ? that._id : ''}`, data, additionalHeaders);
    }
}
