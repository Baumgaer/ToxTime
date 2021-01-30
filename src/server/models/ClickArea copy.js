import { ActionObjectMixinClass } from "~common/models/ActionObject";
import GameObject from "~server/models/GameObject";

const CommonGameObjectActionObject = ActionObjectMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildServerExport(class ActionObject extends CommonGameObjectActionObject { });
