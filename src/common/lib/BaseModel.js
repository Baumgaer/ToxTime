import { cloneDeep } from "lodash";
export default class BaseModel {

    _id = "";

    _dummyId = "";

    /** @type {string} the name of the current class. Schuld not differ */
    static className = "BaseModel";

    /** @type {string} The name of the collection where the model will be stored in */
    static collection = "unknown";

    /** @type {import("mongoose").SchemaDefinition} Contains a part of the model schema. Do NOT mix. This will be happen automatically*/
    static schema = {};

    getName(preferredField) {
        return this[preferredField] || "";
    }

    getAvatar() {
        return null;
    }

    /**
     * Collects and caches all registered actions while assigning the context and returns them
     *
     * @readonly
     * @memberof BaseModel
     */
    get actions() {
        if (this._cachedActions) return this._cachedActions;
        const actions = cloneDeep(Reflect.getMetadata("actions", this) || []);
        for (const action of actions) {
            Object.defineProperty(action, "condition", { get: () => action.conditionFunc ? action.conditionFunc(this) : true });
            Object.defineProperty(action, "func", { value: (...args) => action._handler.call(this, ...args) });
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
            if (!Reflect.hasMetadata("actions", target)) Reflect.defineMetadata("actions", [], target);
            const actions = Reflect.getMetadata("actions", target);
            const action = { name, symbol, _handler, conditionFunc };
            actions.push(action);
        };
    }

}
