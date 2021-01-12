import { cloneDeep } from "lodash";
export default class BaseModel {

    static className = "BaseModel";

    static collection = "unknown";

    static schema = {};

    getName(preferredField) {
        return this[preferredField] || "";
    }

    getAvatar() {
        return null;
    }

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
