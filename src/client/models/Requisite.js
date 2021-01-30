import { RequisiteMixinClass } from "~common/models/Requisite";
import GameObject from "~client/models/GameObject";

const CommonGameObjectRequisite = RequisiteMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class Requisite extends CommonGameObjectRequisite { });
