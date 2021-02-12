import { GameObjectMixinClass } from "~common/models/GameObject";
import ClientModel from "~client/lib/ClientModel";

const CommonClientGameObject = GameObjectMixinClass(ClientModel);
export default ClientModel.buildClientExport(class GameObject extends CommonClientGameObject {

    isSelected = false;
    loadingStatus = 0;

});
