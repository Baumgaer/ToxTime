import { RequisiteMixinClass } from "~common/models/Requisite";
import GameObject from "~server/models/GameObject";

const CommonGameObjectRequisite = RequisiteMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildServerExport(class Requisite extends CommonGameObjectRequisite { });
