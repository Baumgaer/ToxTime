import BaseModel from "~common/lib/BaseModel";
import ApiClient from "~client/lib/ApiClient";
import { resolveProxy } from "~common/utils";
import { v4 as uuid } from "uuid";
import { isObjectLike, cloneDeep } from "lodash";

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
                            let defaultValue = element.options.default;
                            if (isObjectLike(defaultValue)) defaultValue = cloneDeep(defaultValue);
                            this[pathObject] = defaultValue;
                        }
                    }
                }

                // Assign given values
                Object.assign(this, params, { collection: RawClass.collection, className: RawClass.className });
                if (!params._id) {
                    this._dummyId = uuid();
                    Reflect.defineMetadata("stagedChanges", params, this);
                }
                this.staging = true;

            }
        };
        return { RawClass, Schema: schema, Model: modelClass, isClientModel: true };
    }

    getName(preferredField) {
        return this[preferredField] || this.name;
    }

    getChanges() {
        const that = resolveProxy(this);
        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        return Reflect.getMetadata("stagedChanges", that);
    }

    hasChanges() {
        return Boolean(Object.keys(this.getChanges()).length);
    }

    destroy() {
        const that = resolveProxy(this);
        ApiClient.store.removeModel(that);
        for (const key in that) {
            if (Object.hasOwnProperty.call(that, key)) {
                const element = resolveProxy(that[key]);
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
        const that = resolveProxy(this);
        if (!Reflect.hasMetadata("stagedChanges", that)) Reflect.defineMetadata("stagedChanges", {}, that);
        let changes = Reflect.getMetadata("stagedChanges", that);
        if (Object.keys(changes).length) Reflect.defineMetadata("stagedChanges", {}, that);
    }

    toObject() {
        const that = resolveProxy(this);
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
                    for (const entry of resolveProxy(value)) {
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
        if (!this.hasChanges()) return;

        const that = resolveProxy(this);
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
