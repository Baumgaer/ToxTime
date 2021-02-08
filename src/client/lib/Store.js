import onChange from "on-change";
import lodash from "lodash";
import { isProxy, resolveProxy } from "~common/utils";

/** @type {Record<string, ReturnType<import("~client/lib/ClientModel")["default"]["buildClientExport"]>>} */
export const modelMap = { Error };

/**
 * @typedef {import("~common/lib/BaseModel").default} Model
 * @typedef {Partial<Model>} ModelLike
 */
export class Store {

    static instance = null;

    collections = {};

    constructor() {
        if (!Store.usedInstanceGetter) throw new Error("This is a singleton, use Store.getInstance()!");
        const modelContext = require.context("~client/models", true, /[A-Za-z0-9-_,\s]+\.js$/i, "sync");
        modelContext.keys().forEach((key) => {
            const staticModel = modelContext(key).default;
            modelMap[staticModel.Model.className] = staticModel;
        });
        this.collection("localStorage");
    }

    /**
     *
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
        if (!this.collections[name]) this.collections[name] = {};
        return this.collections[name];
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
     *
     *
     * @param {ModelLike} modelLike
     * @returns {boolean}
     * @memberof Store
     */
    hasModel(modelLike) {
        return Boolean(this.getModelById(modelLike.collection, modelLike._dummyId || modelLike._id));
    }

    /**
     *
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
        const id = modelLike._dummyId || modelLike._id;
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
     *
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
        //return Object.assign(realModel, modelLike);
        return lodash.mergeWith(realModel, modelLike, (targetValue, srcValue) => {
            if (lodash.isArray(targetValue)) {
                for (const model of srcValue) {
                    const srcValueAlreadyInTarget = targetValue.find((value) => lodash.isEqual(resolveProxy(value), resolveProxy(model)));
                    if (!srcValueAlreadyInTarget) targetValue.push(model);
                }
                return targetValue;
            } else return srcValue;
        });
    }

    /**
     *
     *
     * @param {ModelLike} modelLike
     * @returns {void}
     * @memberof Store
     */
    removeModel(modelLike) {
        delete this.collection(modelLike.collection)[modelLike._dummyId || modelLike._id];
        const collectionName = modelLike.collection;
        if (this.collection(collectionName).__ob__) this.collection(collectionName).__ob__.dep.notify();
    }

    _installChangeObserver(model) {
        const that = this;
        return onChange(model, function (path, value, prev, name) {
            if ((value === undefined && prev === undefined && name === undefined) || !this.staging) return;
            const fieldName = path[0];

            // Notify all vue components about a change
            const id = model._dummyId || model._id;
            if (that.hasModel(model) && that.getModelById(model.collection, id).__ob__) {
                that.getModelById(model.collection, id).__ob__.dep.notify();
            }

            if (!(fieldName in modelMap[this.className].Schema.obj)) return;
            const stagedChanges = model.getChanges();
            if (!stagedChanges[fieldName]) stagedChanges[fieldName] = prev;

        }, { pathAsArray: true, ignoreUnderscores: true, ignoreSymbols: true, isShallow: false, equals: lodash.isEqual });
    }
}
