import { SceneMixinClass } from "~common/models/Scene";
import Requisite from "~client/models/Requisite";

const CommonSceneRequisite = SceneMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class Scene extends CommonSceneRequisite {

    getAvatar() {
        if (this._id) return super.getAvatar();
        return {
            type: "component",
            name: "theater-icon"
        };
    }
});
