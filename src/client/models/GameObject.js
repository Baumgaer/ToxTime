import { GameObjectMixinClass } from "~common/models/GameObject";
import ClientModel from "~client/lib/ClientModel";

const CommonClientGameObject = GameObjectMixinClass(ClientModel);
export default ClientModel.buildClientExport(class GameObject extends CommonClientGameObject {

    isSelected = false;

    getResources() {
        const resources = [];
        this.iterateModels((model) => {
            if (!(model instanceof GameObject)) return false;
            if (resources.includes(model)) return false;
            resources.push(model, ...model.getLabels());
        });
        return resources;
    }

});
