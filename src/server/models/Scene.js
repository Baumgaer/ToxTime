import { SceneMixinClass } from "~common/models/Scene";
import Requisite from "~server/models/Requisite";

const CommonSceneRequisite = SceneMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildServerExport(class Scene extends CommonSceneRequisite { });
