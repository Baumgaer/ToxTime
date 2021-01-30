import { SceneObjectMixinClass } from "~common/models/SceneObject";
import Requisite from "~server/models/Requisite";

const CommonSceneObjectRequisite = SceneObjectMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildServerExport(class SceneObject extends CommonSceneObjectRequisite { });
