import { SceneObjectMixinClass } from "~common/models/SceneObject";
import ClientModel from "~client/lib/ClientModel";

const CommonClientSceneObject = SceneObjectMixinClass(ClientModel);
export default ClientModel.buildClientExport(class SceneObject extends CommonClientSceneObject { });
