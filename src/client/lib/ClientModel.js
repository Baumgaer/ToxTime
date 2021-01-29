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
        const that = onChange.target(this);
        ApiClient.store.removeModel(that);
        for (const key in that) {
            if (Object.hasOwnProperty.call(that, key)) {
                const element = onChange.target(that[key]);
                if (element instanceof ClientModel && !element._id) element.destroy();
                if (element instanceof Array) {
                    for (const subElement of element) {
                        if (subElement instanceof ClientModel && !subElement._id) subElement.destroy();
                    }
                }
            }
        }
    }

    discard() {
        const that = onChange.target(this);
        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        let changes = Reflect.getMetadata("stagedChanges", that);
        console.log(changes);
    }

    toObject() {
        const that = onChange.target(this);
        const schema = ClientModel.buildSchema(Object.getPrototypeOf(that).constructor);

        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        let changes = Reflect.getMetadata("stagedChanges", that);
        if (!Object.keys(changes).length && that._dummyId) changes = schema.obj;

        const data = {};
        for (const key in changes) {
            if (key in schema.obj) {
                let value = that[key];
                if (value instanceof ClientModel) value = value.toObject();
                if (value instanceof Array) {
                    const arrayValue = [];
                    for (const entry of onChange.target(value)) {
                        if (entry instanceof ClientModel) {
                            arrayValue.push(entry.toObject());
                        } else arrayValue.push(entry);
                    }
                    value = arrayValue;
                }
                data[key] = value;
            }
        }
        if (that._dummyId) data._dummyId = that._dummyId;
        return Object.keys(data).length ? Object.assign(data, { _id: that._id }) : that._id;
    }

    toJson() {
        return JSON.stringify(this.toObject());
    }

    async save() {
        const that = onChange.target(this);
        const data = that.toObject();
        let method;

        if (that._id) {
            method = ApiClient.patch.bind(ApiClient);
        } else method = ApiClient.post.bind(ApiClient);

        const result = await method(`/${this.collection}${that._id ? "/" + that._id : ''}`, data);
        if (!(result instanceof Error)) Reflect.defineMetadata("stagedChanges", {}, that);
        return result;
    }
}
