import { SceneObjectMixinClass } from "~common/models/SceneObject";
import Requisite from "~client/models/Requisite";

const CommonSceneObjectRequisite = SceneObjectMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class SceneObject extends CommonSceneObjectRequisite {

    getAvatar() {
        if (this._id) return super.getAvatar();
        return {
            type: "component",
            name: "ufo-icon"
        };
    }
});
