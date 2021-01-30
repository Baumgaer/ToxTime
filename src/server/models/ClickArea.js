import { ClickAreaMixinClass } from "~common/models/ClickArea";
import GameObject from "~server/models/GameObject";

const CommonGameObjectClickArea = ClickAreaMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildServerExport(class ClickArea extends CommonGameObjectClickArea { });
