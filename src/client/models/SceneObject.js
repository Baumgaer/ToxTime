import { SceneObjectMixinClass } from "~common/models/SceneObject";
import Requisite from "~client/models/Requisite";

const CommonSceneObjectRequisite = SceneObjectMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class SceneObject extends CommonSceneObjectRequisite { });
