import onChange from "on-change";
import { isProxy, resolveProxy, isEqual, mergeWith, isArray, difference } from "~common/utils";

/** @type {Record<string, ReturnType<import("~client/lib/ClientModel")["default"]["buildClientExport"]>>} */
export const modelMap = { Error };

/**
 * @typedef {import("~common/lib/BaseModel").default} Model
 * @typedef {Partial<Model>} ModelLike
 */
export class Store {

    /** @type {Store} */
    static instance = null;

    /** @type {Record<string, Record<string, import("~client/lib/ClientModel")>>} */
    collections = {};

    localStorage = {};

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
        const modelContext = require.context("~client/models", true, /[A-Za-z0-9-_,\s]+\.js$/i, "sync");
        modelContext.keys().forEach((key) => {
            const staticModel = modelContext(key).default;
            modelMap[staticModel.Model.className] = staticModel;
        });
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

    get trash() {
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
     * @param {string} collectionName
     * @param {string} id
     * @returns {Model | null}
     * @memberof Store
     */
    getModelById(collectionName, id) {
        const collection = this.collection(collectionName);
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
        return Boolean(this.getModelById(modelLike.collection, modelLike._dummyId || modelLike._id));
    }

    /**
     * Checks if a model like data object could be a real model
     *
     * @param {ModelLike} modelLike
     * @returns {boolean}
     * @memberof Store
     */
    isModel(modelLike) {
        return modelLike.collection && modelLike.className && (modelLike._dummyId || modelLike._id);
    }

    /**
     * Adds a given model like object as initialized model to the store.
     * The object musst contain at least _id or _dummyId and a collection
     *
     * @param {ModelLike} modelLike
     * @returns {Model}
     * @memberof Store
     */
    addModel(modelLike) {
        const collectionName = modelLike.collection;
        const id = modelLike._id || modelLike._dummyId;
        let model = modelLike;
        if (!this.hasModel(model)) {
            if (modelMap[modelLike.className] !== Error) {
                if (!(modelLike instanceof modelMap[modelLike.className].Model)) {
                    model = this._installChangeObserver(new modelMap[modelLike.className].Model(modelLike));
                } else if (modelLike instanceof modelMap[modelLike.className].Model && !isProxy(modelLike)) {
                    model = this._installChangeObserver(modelLike);
                }
                this.collection(collectionName)[id] = model;
            } else {
                model = new Error();
                Object.assign(model, modelLike);
            }
            if (this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
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
        if (modelLike instanceof modelMap[modelLike.className].Model) throw new Error("You should not pass an instance here");
        const dummyModel = this.getModelById(modelLike.collection, modelLike._dummyId);
        let realModel = this.getModelById(modelLike.collection, modelLike._id);

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
        const collectionName = realModel.collection;
        if (notify && this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
        mergeWith(resolveProxy(realModel), resolveProxy(modelLike), (targetValue, srcValue) => {
            const theTarget = resolveProxy(targetValue);
            if (isArray(theTarget)) {
                for (const model of srcValue) {
                    const srcValueAlreadyInTarget = theTarget.find((value) => isEqual(resolveProxy(value), resolveProxy(model)));
                    if (!srcValueAlreadyInTarget) theTarget.push(model);
                }
                return targetValue;
            } else return srcValue;
        });
        return realModel;
    }

    /**
     * Removes a model from the collections by its collection and id.
     * Also all components will be informed.
     *
     * @param {ModelLike} modelLike
     * @returns {void}
     * @memberof Store
     */
    removeModel(modelLike) {
        delete this.collection(modelLike.collection)[modelLike._id || modelLike._dummyId];
        const collectionName = modelLike.collection;
        if (this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
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
        if ((value === undefined && prev === undefined && name === undefined) || !model.staging) return;

        // Notify all vue components about a change
        const id = model._dummyId || model._id;
        const vueObserver = this.getModelById(model.collection, id)?.__ob__;
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
        if (!isArray(array)) return array;
        const schemaObject = model.getSchemaObject();

        // Clone options and if the array is not an array with references, watch deep
        const arrayOptions = Object.assign({}, this.observerOptions);
        if (!schemaObject[key].type[0].ref) arrayOptions.isShallow = false;

        return onChange(array, (path, value, prev) => {
            this._backupChanges(model, [key].concat(path), value, prev, "arrayWatch");
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
        const options = Object.assign({}, this.observerOptions, { ignoreKeys });
        model.staging = false;

        // Install main observer first to be able to get previous values of arrays when they are changed
        const mainObserver = onChange(model, (path, value, prev, name) => {
            this._backupChanges(model, path, value, prev, name);
        }, options);

        // Watch changes of arrays
        for (const schemaObjectKey of schemaObjectKeys) {
            if (!isArray(schemaObject[schemaObjectKey].type)) continue;
            model[schemaObjectKey] = this._createArrayChangeObserver(model, schemaObjectKey, model[schemaObjectKey]);
        }

        model.staging = true;
        return mainObserver;
    }
}
