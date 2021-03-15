import { SceneMixinClass } from "~common/models/Scene";
import Requisite from "~client/models/Requisite";

const CommonSceneRequisite = SceneMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class Scene extends CommonSceneRequisite {

    getAvatar(forceIcon) {
        const value = { title: window.vm.$t('scene') };
        if (!forceIcon && this._id && !this.isCreatingAvatar) return Object.assign(super.getAvatar(), value);
        return Object.assign({
            type: "component",
            name: "theater-icon"
        }, value);
    }

    @CommonSceneRequisite.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.activeEditor = "scene";
        window.activeUser.editingModel = this;
    }
});
