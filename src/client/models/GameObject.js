import { GameObjectMixinClass } from "~common/models/GameObject";
import ClientModel from "~client/lib/ClientModel";

const CommonClientGameObject = GameObjectMixinClass(ClientModel);
export default ClientModel.buildClientExport(class GameObject extends CommonClientGameObject {

    _cachedResources = {};

    getResources(cacheHash) {
        if (cacheHash && this._cachedResources[cacheHash]) return this._cachedResources[cacheHash];
        const resources = [];
        this.iterateModels((model) => {
            if (!(model instanceof GameObject)) return false;
            if (resources.includes(model)) return false;
            resources.push(model, ...model.getLabels());
        });
        if (cacheHash) this._cachedResources[cacheHash] = resources;
        return resources;
    }

});
