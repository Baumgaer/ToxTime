import { SceneObjectMixinClass } from "~common/models/SceneObject";
import ServerModel from "~server/lib/ServerModel";

const CommonServerSceneObject = SceneObjectMixinClass(ServerModel);
export default ServerModel.buildServerExport(class SceneObject extends CommonServerSceneObject { });
