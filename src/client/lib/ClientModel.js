import BaseModel from "~common/lib/BaseModel";
import ApiClient from "~client/lib/ApiClient";
import { resolveProxy, isObjectLike, clone, cloneDeep, eachDeep, isFunction, isArray, get, set } from "~common/utils";
import { v4 as uuid } from "uuid";

export default class ClientModel extends BaseModel {

    static className = "ClientModel";

    static collection = "clientModels";

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        creator: {
            default: () => window.activeUser
        }
    };

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

        this.schemaObject = schema.obj;

        const modelClass = class ModelClass extends RawClass {
            constructor(params = {}) {
                super();

                // Assign defaults
                for (const pathObject in schema.paths) {
                    if (Object.hasOwnProperty.call(schema.paths, pathObject)) {
                        const element = schema.paths[pathObject];
                        if (element.options.default !== undefined) {
                            let defaultValue = element.options.default;
                            if (isFunction(defaultValue)) defaultValue = defaultValue();
                            if (isObjectLike(defaultValue) && !(defaultValue instanceof ClientModel)) {
                                defaultValue = cloneDeep(defaultValue);
                            }
                            this[pathObject] = defaultValue;
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

    getModifyHash() {
        return (new Date(this.lastModifiedDate)).getTime().toString(6);
    }

    /**
     * Returns true if the model was created but not yet saved and false else
     *
     * @returns {boolean}
     * @memberof ClientModel
     */
    isNew() {
        return Boolean(this._dummyId && !this._id);
    }

    /**
     * Collects all data which was set before the last call of save()
     *
     * @returns {Record<string, any>}
     * @memberof ClientModel
     */
    getBackup() {
        const that = resolveProxy(this);
        if (!Reflect.hasMetadata("backupStore", that)) Reflect.defineMetadata("backupStore", {}, that);
        return Reflect.getMetadata("backupStore", that);
    }

    /**
     * Sets a new value for key if key does not already exist in backup.
     * It is only possible to backup keys which are defined in the schema of
     * the model.
     *
     * @param {string[]} path
     * @param {any} value
     * @memberof ClientModel
     */
    updateBackup(path, value) {
        const backup = this.getBackup();
        const schemaObject = this.getSchemaObject();
        if (get(this, path) !== undefined && path[0] in schemaObject && !(path[0] in backup)) {
            set(backup, path, value);
        }
    }

    /**
     * Removes all key value pairs in the backup store. This implicitly changes
     * the change state of the model to false.
     *
     * @memberof ClientModel
     */
    deleteBackup() {
        const that = resolveProxy(this);
        Reflect.defineMetadata("backupStore", {}, that);
    }

    /**
     * Same as deleteBackup() but recursive
     *
     * @memberof ClientModel
     */
    deleteBackupDeep() {
        this.iterateModels((model) => {
            model.deleteBackup();
        });
        this.deleteBackup();
    }

    /**
     * Returns true if the model has keys in its backup store and false else
     *
     * @returns {boolean}
     * @memberof ClientModel
     */
    hasChanges() {
        return this.isNew() || Boolean(this.getChangedKeys().length);
    }

    /**
     * Same as hasChanges() but recursive. Stops recursion if there is some
     * change detected.
     *
     * @returns {boolean}
     * @memberof ClientModel
     */
    hasChangesDeep() {
        if (this.hasChanges()) return true;
        let result = false;
        this.iterateModels(resolveProxy(this), (model, key, parentValue, context) => {
            if (result) return false;
            if (model.hasChanges()) {
                result = true;
                context.break();
            }
        });
        return result;
    }

    /**
     * Returns all keys which are set in the backup store because keys defined
     * in backup store implicitly indicate changes of that keys.
     *
     * @returns {string[]}
     * @memberof ClientModel
     */
    getChangedKeys() {
        if (this.isNew()) return Object.keys(this.getSchemaObject());
        return Object.keys(this.getBackup());
    }

    /**
     * looks into the backup store for changed keys and returns their current value
     *
     * @returns {Record<string, any>}
     * @memberof ClientModel
     */
    getChanges() {
        const changedKeys = this.getChangedKeys();
        const changes = {};
        for (const key of changedKeys) changes[key] = clone(resolveProxy(this[key]));
        return changes;
    }

    /**
     * Same as getChanges but recursive
     *
     * @returns {Record<string, any>}
     * @memberof ClientModel
     */
    getChangesDeep() {
        const recursiveChanges = this.getChanges();
        this.iterateModels((model, key, parentValue, context) => {
            let isSchemaProperty = true;
            if (parentValue instanceof ClientModel) isSchemaProperty = key in parentValue.getSchemaObject();
            if (isSchemaProperty && model.hasChanges()) set(recursiveChanges, context.path, model.getChanges());
        });
        return recursiveChanges;
    }

    /**
     * Reverts all changes and removes the backup of the model. If the model
     * itself is new, it will be removed from store.
     *
     * @memberof ClientModel
     */
    discard() {
        Object.assign(resolveProxy(this), this.getBackup());
        this.deleteBackup();
        if (this.isNew()) ApiClient.store.removeModel(this);
    }

    /**
     * Same as discard but recursive. Models which are not new will not be
     * removed from store.
     *
     * @memberof ClientModel
     */
    discardDeep() {
        if (!this.hasChangesDeep()) return;
        this.iterateModels(resolveProxy(this), (model) => {
            if (!model.hasChangesDeep()) return false;
            model.discard();
        });
        this.discard();
    }

    /**
     * Removes all models recursive which are still new including the current model
     *
     * @memberof ClientModel
     */
    destroy() {
        this.iterateModels((model) => {
            ApiClient.store.removeModel(model);
        });
        ApiClient.store.removeModel(this);
    }

    /**
     * Transforms all changes recursive to an object which can be processed by the server.
     * Changes which have a model as value will be transformed to the id of the model,
     * if the model is not new. Otherwise the whole model will be sent to the server.
     * If a modelFilter is given, all models which match the condition will
     * stored as "unchanged", means that all changes are ignored.
     *
     * @param { (model: ClientModel) => boolean } [modelFilter]
     * @returns {Record<string, any>}
     * @memberof ClientModel
     */
    toRequestObject(modelFilter) {
        const changes = this.getChangesDeep();
        const requestObject = cloneDeep(this.getChanges());
        this.iterateModels(changes, (model, key, parentValue, context) => {
            if (!model.hasChanges() || model === this || (modelFilter && modelFilter(model))) {
                set(requestObject, context.path, model._id);
                return false;
            }

            const value = get(changes, context.path);
            set(requestObject, context.path, value);
            const pathToExtend = [].concat(context.path);

            let idProperty = "_id";
            if (model.isNew()) idProperty = "_dummyId";
            pathToExtend.push(idProperty);

            set(requestObject, pathToExtend, model[idProperty]);
        });

        // Fill arrays
        eachDeep(requestObject, (model, key, parentValue, context) => {
            const requestObjectArray = get(requestObject, context.path);
            if (isArray(parentValue) || !isArray(requestObjectArray) || !this.isSchemaReference(context.path)) return;
            const referenceArray = get(this, context.path);
            if (!referenceArray) return;
            for (let index = 0; index < referenceArray.length; index++) {
                const element = referenceArray[index];
                if (!requestObjectArray[index]) requestObjectArray[index] = element._id;
            }
        }, { pathFormat: "array" });

        if (this.isNew()) {
            requestObject._dummyId = this._dummyId;
        } else requestObject._id = this._id;

        return requestObject;
    }

    /**
     * Converts all changes into an object which can be handled by the server
     * and sends this object to the server. If the server responds with a success
     * status, all backups will be removed to finalize the changes.
     *
     * Returns the final object respecting the server response or an error if a
     * none success response status was received.
     *
     * @returns {Promise<Record<string, any> | Error>}
     * @memberof ClientModel
     */
    async save() {
        if (!this.hasChangesDeep()) return;
        const data = this.toRequestObject();

        let method;
        if (this._id) {
            method = ApiClient.patch.bind(ApiClient);
        } else method = ApiClient.post.bind(ApiClient);

        const result = await method(`/${this.collection}${this._id ? "/" + this._id : ''}`, data);
        if (!(result instanceof Error)) this.deleteBackupDeep();
        return result;
    }
}
