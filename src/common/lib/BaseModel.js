import { Schema } from "mongoose";
import { dataTransformer, getPrototypeNamesRecursive, merge } from "~common/utils";

const globalActions = {};
global.globalActions = globalActions;
/** @type {Record<string, import("mongoose").Model>} */
export const mongooseBaseModels = {};
export default class BaseModel {

    _id = "";

    _dummyId = "";

    /** @type {string} the name of the current class. Schuld not differ */
    static className = "BaseModel";

    /** @type {string} The name of the collection where the model will be stored in */
    static collection = "unknown";

    /** @type {import("mongoose").SchemaDefinition} Contains a part of the model schema. Do NOT mix. This will be happen automatically*/
    static schema = {
        name: {
            type: String,
            required: true,
            default: ""
        },
        creator: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            autopopulate: true
        },
        creationDate: {
            type: Date,
            required: true,
            default: Date
        },
        lastModifiedDate: {
            type: Date,
            required: true,
            default: Date
        }
    };

    getName(preferredField) {
        return this[preferredField] || "";
    }

    getAvatar() {
        return null;
    }

    getSubObjects() {
        return [];
    }

    /**
     * Collects and caches all registered actions while assigning the context and returns them
     *
     * @readonly
     * @memberof BaseModel
     */
    get actions() {
        if (this._cachedActions) return this._cachedActions;
        const prototypeNames = getPrototypeNamesRecursive(this).reverse().filter((name) => name in globalActions);
        const actions = {};
        for (const prototypeName of prototypeNames) merge(actions, globalActions[prototypeName]);

        for (const actionName in actions) {
            if (Object.hasOwnProperty.call(actions, actionName)) {
                const actionArgs = actions[actionName];
                actionArgs.name = actionName;
                Object.defineProperty(actionArgs, "condition", { get: () => actionArgs.conditionFunc ? actionArgs.conditionFunc(this) : true });
                Object.defineProperty(actionArgs, "func", { value: (...args) => actionArgs._handler.call(this, ...args) });
            }
        }
        this._cachedActions = actions;
        return actions;
    }

    /**
     * Registers a new action on the model
     *
     * @static
     * @decorator
     * @param {string} name
     * @param { {type: "component" | "image", name: string} } symbol
     * @param {(instance: this) => boolean} conditionFunc
     * @returns
     * @memberof BaseModel
     */
    static action(name, symbol, conditionFunc) {
        return (target, methodName) => {
            const _handler = target[methodName];
            if (!globalActions[target.constructor.name]) globalActions[target.constructor.name] = {};
            merge(globalActions[target.constructor.name], { [name]: { symbol, _handler, conditionFunc } });
        };
    }

    /**
     * Collects all schema parts of each prototype and merges them to one
     * accessible schema.
     *
     * @static
     * @template T
     * @param {T} RawClass
     * @returns {Schema<T>}
     * @memberof BaseModel
     */
    static buildSchema(RawClass) {
        let schemaDeclaration = {};
        const prototypeSchemas = [RawClass.schema || {}];
        let proto = Object.getPrototypeOf(RawClass);
        while (proto) {
            prototypeSchemas.unshift(proto.schema || {});
            proto = Object.getPrototypeOf(proto);
        }
        for (const prototypeSchema of prototypeSchemas) schemaDeclaration = merge(schemaDeclaration, prototypeSchema);
        const schema = new Schema(schemaDeclaration, {
            collection: RawClass.collection,
            discriminatorKey: "className",
            toObject: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) },
            toJSON: { transform: (doc, ret) => dataTransformer(doc, ret, RawClass) }
        });
        schema.loadClass(RawClass);
        return schema;
    }

}
