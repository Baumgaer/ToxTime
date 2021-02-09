import { SceneObjectMixinClass } from "~common/models/SceneObject";
import Requisite from "~client/models/Requisite";

const CommonSceneObjectRequisite = SceneObjectMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class SceneObject extends CommonSceneObjectRequisite {

    getAvatar(forceIcon) {
        if (!forceIcon && this._id && !this.isCreatingAvatar) return super.getAvatar();
        return {
            type: "component",
            name: "ufo-icon"
        };
    }

    @CommonSceneObjectRequisite.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.activeEditor = "sceneObject";
        window.activeUser.editingModel = this;
    }
});
