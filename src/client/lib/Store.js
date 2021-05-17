import onChange from "on-change";
import { isProxy, resolveProxy, isEqual, mergeWith, isArray, difference, isValue, isPlainObject, clone, set } from "~common/utils";
import ClientModel from "~client/lib/ClientModel";
import { Schema, Document } from "mongoose";

/**
 * @typedef {import("~client/lib/ClientModel").default} Model
 * @typedef {Partial<Model>} ModelLike
 */
export class Store {

    /** @type {Store} */
    static instance = null;

    /** @type {Record<string, Record<string, Model>>} */
    collections = {};

    /** @type {Record<string, Map<Model, Map<Model, Model>>>} */
    indexes = {};

    /** @type {Record<string, any>} */
    localStorage = {};

    /** @type {Record<string, Model>} */
    _trash = {};

    /** @type {import("on-change").Options} */
    observerOptions = {
        pathAsArray: true,
        ignoreUnderscores: true,
        ignoreSymbols: true,
        isShallow: true,
        equals: isEqual
    };

    constructor() {
        if (!Store.usedInstanceGetter) throw new Error("This is a singleton, use Store.getInstance()!");
    }

    /**
     * Creates an instance of the store if not yet created and returns it.
     *
     * @static
     * @returns {Store}
     * @memberof Store
     */
    static getInstance() {
        Store.usedInstanceGetter = true;
        if (!Store.instance) Store.instance = new Store();
        Store.usedInstanceGetter = false;
        return Store.instance;
    }

    /**
     * Creates a collection if not exists and returns it
     *
     * @param {string} name
     * @returns {Record<string, Model>}
     * @memberof Store
     */
    collection(name) {
        if (name === "trash") return this.trash;
        if (name === "localStorage") return this.localStorage;
        if (!this.collections[name]) this.collections[name] = {};
        return this.collections[name];
    }

    index(name) {
        if (!this.indexes[name]) this.indexes[name] = new Map();
        return this.indexes[name];
    }

    indexValuesOf(index, item) {
        return Array.from(this.index(index).get(item)?.values() || []);
    }

    get trash() {
        for (const key in this._trash) {
            if (key !== "__ob__") delete this._trash[key];
        }
        const collections = Object.values(this.collections);
        for (const collection of collections) {
            for (const modelId in collection) {
                if (Object.hasOwnProperty.call(collection, modelId)) {
                    const model = collection[modelId];
                    if (model.deleted) this._trash[modelId] = model;
                }
            }
        }
        this._trash.__ob__?.dep.notify();
        return this._trash;
    }

    /**
     * Returns a model from collection name with given id if exists and null else
     *
     * @param {string} dataCollectionName
     * @param {string} id
     * @returns {Model | null}
     * @memberof Store
     */
    getModelById(dataCollectionName, id) {
        const collection = this.collection(dataCollectionName);
        const model = collection[id];
        if (!model) return null;
        return model;
    }

    /**
     * Checks if the model like object is already stored as a model in the
     * corresponding collection.
     *
     * @param {ModelLike} modelLike
     * @returns {boolean}
     * @memberof Store
     */
    hasModel(modelLike) {
        return Boolean(this.getModelById(modelLike.dataCollectionName, modelLike._dummyId || modelLike._id));
    }

    /**
     * Checks if a model like data object could be a real model
     *
     * @param {ModelLike} modelLike
     * @returns {boolean}
     * @memberof Store
     */
    isModel(modelLike) {
        return modelLike.dataCollectionName && modelLike.className && (modelLike._dummyId || modelLike._id);
    }

    /**
     * Adds a given model like object as initialized model to the store.
     * The object musst contain at least _id or _dummyId and a dataCollectionName
     *
     * @param {ModelLike} modelLike
     * @returns {Model}
     * @memberof Store
     */
    addModel(modelLike) {
        const dataCollectionName = modelLike.dataCollectionName;
        const id = modelLike._id || modelLike._dummyId;
        let model = modelLike;
        if (!this.hasModel(model)) {
            if (window._modelMap[modelLike.className] !== Error) {

                if (!(modelLike instanceof window._modelMap[modelLike.className].Model)) {
                    // If there comes a plain object from the ApiClient or something similar,
                    // create an instance and put it into a proxy
                    model = this._installChangeObserver(new window._modelMap[modelLike.className].Model(modelLike));
                } else if (modelLike instanceof window._modelMap[modelLike.className].Model && !isProxy(modelLike)) {
                    // If there is already an instance available but it is not a proxy,
                    // put it into a proxy
                    model = this._installChangeObserver(modelLike);
                }

                // Assign the proxy model to the store
                this.collection(dataCollectionName)[id] = model;

                // Build index
                for (const key of Object.keys(model)) this._updateIndex(model, model[key], null, [key]);
            } else {
                model = new Error();
                Object.assign(model, modelLike);
            }

            // Notify components
            if (this.collection(dataCollectionName).__ob__) this.collection(dataCollectionName).__ob__.dep.notify();
            return model;
        } else return this.updateModel(model);
    }

    /**
     * Updates the model with modelLike data. If modelLike has an id and a
     * dummyModel is stored in collection, this dummy model will be replaced
     * with a real model. Does not update values when they are unchanged.
     *
     * @param {ModelLike} modelLike
     * @returns {Model}
     * @memberof Store
     */
    updateModel(modelLike) {
        if (modelLike instanceof window._modelMap[modelLike.className].Model) throw new Error("You should not pass an instance here");
        const dummyModel = this.getModelById(modelLike.dataCollectionName, modelLike._dummyId);
        let realModel = this.getModelById(modelLike.dataCollectionName, modelLike._id);

        let notify = true;
        if (dummyModel && modelLike._id) {
            this.removeModel(dummyModel);
            delete dummyModel._dummyId;
            delete modelLike._dummyId;
            dummyModel._id = modelLike._id;
            realModel = this.addModel(dummyModel);
            notify = false;
        }
        if (!realModel) realModel = dummyModel;
        const dataCollectionName = realModel.dataCollectionName;
        if (notify && this.collection(dataCollectionName).__ob__) this.collection(dataCollectionName).__ob__.dep.notify();
        const changedKeys = realModel.getChangedKeys();
        mergeWith(resolveProxy(realModel), resolveProxy(modelLike), (targetValue, srcValue, key) => {
            this._updateIndex(realModel, srcValue, targetValue, [key]);
            if (isArray(targetValue)) {
                let theTarget = resolveProxy(targetValue);
                if (changedKeys.includes(key)) theTarget = resolveProxy(realModel.getBackup()[key]);

                if (isValue(theTarget)) {
                    for (const model of srcValue) {
                        const srcValueAlreadyInTarget = theTarget.find((value) => isEqual(value, model));
                        if (!srcValueAlreadyInTarget) theTarget.push(model);
                    }
                }

                return targetValue; // This is now the modified value
            }

            if (changedKeys.includes(key)) {
                realModel.updateBackup([key], srcValue);
                return targetValue;
            }

            return srcValue;
        });
        return realModel;
    }

    /**
     * Removes a model from the collections by its dataCollectionName and id.
     * Also all components will be informed.
     *
     * @param {ModelLike} modelLike
     * @returns {void}
     * @memberof Store
     */
    removeModel(modelLike) {
        const dataCollectionName = modelLike.dataCollectionName;
        const id = modelLike._id || modelLike._dummyId;
        const model = this.getModelById(dataCollectionName, id);
        if (!model) return;

        for (const key in this.indexes) {
            if (Object.hasOwnProperty.call(this.indexes, key)) {
                const index = this.indexes[key];
                if (!index.has(model)) continue;
                index.delete(model);
            }
        }

        delete this.collection(dataCollectionName)[id];
        if (this.collection(dataCollectionName).__ob__) this.collection(dataCollectionName).__ob__.dep.notify();
    }

    _validate(model, path, value) {
        const propDesc = Object.getOwnPropertyDescriptor(model, path[0]);
        if (propDesc && ("value" in propDesc ? propDesc.value : propDesc.get?.()) !== value) return true;

        const schema = model.getSchemaObject();
        if (!(path[0] in schema)) return true;

        const tempSchema = new Schema({ [path[0]]: schema[path[0]] });
        const tempDocument = new Document({ [path[0]]: value }, tempSchema);
        const result = tempDocument.validateSync();
        if (result instanceof Error) return false;

        return true;
    }

    /**
     * Handles the changes inside a model or inside an array of a model.
     * When a value is changed its previous value will be stored in the backup
     * store of the model
     *
     * @param {Model} model
     * @param {string[]} path
     * @param {any} value
     * @param {any} prev
     * @param {string} name
     * @returns {void}
     * @memberof Store
     */
    _backupChanges(model, path, value, prev, name) {
        // Workaround for bug of on-change package see: https://github.com/sindresorhus/on-change/issues/79
        const propDesc = Object.getOwnPropertyDescriptor(model, path[0]);
        if (propDesc && !isEqual(("value" in propDesc ? propDesc.value : propDesc.get?.()), value)) return;
        if ((value === undefined && prev === undefined && name === undefined) || !model.staging) return;

        // Notify all vue components about a change
        const id = model._dummyId || model._id;
        const vueObserver = this.getModelById(model.dataCollectionName, id)?.__ob__;
        if (this.hasModel(model) && vueObserver) vueObserver.dep.notify();

        // Previous values are not wrapped into a proxy, so we need to store a
        // proxy in the backup store to have observation on discarded values
        if (name === "arrayWatch") prev = this._createArrayChangeObserver(model, path[0], prev);

        // Backup changes
        model.updateBackup(path, prev);
    }

    /**
     * Wraps arrays of models in a proxy to handle changes inside this arrays
     *
     * @template T
     * @param {Model} model
     * @param {string} key
     * @param {T extends Array} array
     * @returns {T}
     * @memberof Store
     */
    _createArrayChangeObserver(model, key, array) {
        if (!isArray(array) && !isPlainObject(array)) return array;
        const schemaObject = model.getSchemaObject();

        // Clone options and if the array is not an array with references, watch deep
        const arrayOptions = Object.assign({
            onValidate: (path, value) => {
                return this._validate(model, path, value);
            }
        }, this.observerOptions);
        const type = schemaObject[key].type;
        if (isArray(type) && !type[0].ref) arrayOptions.isShallow = false;

        return onChange(array, (path, value, prev) => {
            let fullPath = [key];
            if (isPlainObject(array)) {
                value = clone(resolveProxy(array));
                prev = set(value, path, prev);
            } else fullPath = [key].concat(path);

            this._updateIndex(model, value, prev, fullPath);
            this._backupChanges(model, fullPath, value, prev, "arrayWatch");

            model.__ob__?.dep.notify();
            array.__ob__?.dep.notify();
        }, arrayOptions);
    }

    /**
     * Wraps a given model into a proxy which later will handle change detection.
     * If there are arrays as values, this arrays will be watched deep when they
     * are not reference arrays. Otherwise those arrays will be watched shallow.
     *
     * @template T
     * @param {T extends Model} model
     * @returns {T}
     * @memberof Store
     */
    _installChangeObserver(model) {
        const schemaObject = model.getSchemaObject();
        const schemaObjectKeys = Object.keys(schemaObject);
        const modelKeys = Object.keys(model);
        const ignoreKeys = difference(modelKeys, schemaObjectKeys);
        const options = Object.assign({
            onValidate: (path, value) => {
                return this._validate(model, path, value);
            }
        }, this.observerOptions, { ignoreKeys });
        model.staging = false;

        // Install main observer first to be able to get previous values of arrays when they are changed
        const mainObserver = onChange(model, (path, value, prev, name) => {
            if ((isArray(value) || isPlainObject(value)) && !isProxy(value)) {
                value = this._createArrayChangeObserver(model, path[0], value);
            }
            this._updateIndex(model, value, prev, path);
            this._backupChanges(model, path, value, prev, name);
        }, options);

        // Watch changes of arrays
        for (const schemaObjectKey of schemaObjectKeys) {
            const type = schemaObject[schemaObjectKey].type;
            if (!isArray(type) && !isPlainObject(type)) continue;
            model[schemaObjectKey] = this._createArrayChangeObserver(mainObserver, schemaObjectKey, model[schemaObjectKey]);
        }

        model.staging = true;
        return mainObserver;
    }

    /**
     * Creates an index which maps objects to their parents.
     * Example: A file model can be used by several scene or sceneObject models.
     * File => [Scene, SceneObject]
     *
     * @param {Model} model
     * @param {any} newValue
     * @param {any} oldValue
     * @param {string[]} path
     * @returns {void}
     * @memberof Store
     */
    _updateIndex(model, newValue, oldValue, path) {
        if (!model.isSchemaReference(path)) return;

        if (isArray(newValue) || isArray(oldValue)) {
            const addedItems = difference(newValue || [], oldValue);
            const removedItems = difference(oldValue || [], newValue);
            for (const addedItem of addedItems) this._updateIndex(model, addedItem, null, path);
            for (const removedItem of removedItems) this._updateIndex(model, null, removedItem, path);
            return;
        }

        if (newValue && !(newValue instanceof ClientModel) && oldValue && !(oldValue instanceof ClientModel)) return;

        // Build index collection if not available
        const index = this.index(model.dataCollectionName);

        // Determine object to get associations from
        let reference = newValue;
        if (!newValue) reference = oldValue;

        // If this is true it means that the value switched from a falsy value
        // to another falsy value
        if (!reference) return;

        // Initialize index collection if not initialized
        let associatedObjects = index.get(reference);
        if (!associatedObjects) associatedObjects = index.set(reference, new Map()).get(reference);

        // Add model to index if not available and was not available before
        if (!oldValue && !associatedObjects.has(model)) associatedObjects.set(model, model);
        if (!newValue && associatedObjects.has(model)) associatedObjects.delete(model);
        if (newValue && oldValue) {
            if (associatedObjects.has(oldValue)) associatedObjects.delete(model);
            associatedObjects.set(model, model);
        }
        if (!associatedObjects.size) index.delete(reference);
    }
}
