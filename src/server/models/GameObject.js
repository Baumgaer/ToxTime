import { GameObjectMixinClass } from "~common/models/GameObject";
import ServerModel from "~server/lib/ServerModel";

const CommonServerGameObject = GameObjectMixinClass(ServerModel);
export default ServerModel.buildServerExport(class GameObject extends CommonServerGameObject { });
