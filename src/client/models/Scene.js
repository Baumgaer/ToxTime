import { SceneMixinClass } from "~common/models/Scene";
import Requisite from "~client/models/Requisite";

const CommonSceneRequisite = SceneMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class Scene extends CommonSceneRequisite {

    getAvatar(forceIcon) {
        if (!forceIcon && this._id && !this.isCreatingAvatar) return super.getAvatar();
        return {
            type: "component",
            name: "theater-icon"
        };
    }

    @CommonSceneRequisite.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.activeEditor = "scene";
        window.activeUser.editingModel = this;
    }
});
