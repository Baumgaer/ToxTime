import { SceneMixinClass } from "~common/models/Scene";
import Requisite from "~client/models/Requisite";

const CommonSceneRequisite = SceneMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class Scene extends CommonSceneRequisite {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newFeminin")} ${window.$t('scene')}`;
            }
        }
    };

    getAvatar(forceIcon) {
        const value = { title: window.$t('scene') };
        if (!forceIcon && this._id && !this.isCreatingAvatar) return Object.assign(super.getAvatar(), value);
        return Object.assign({
            type: "component",
            name: "theater-icon"
        }, value);
    }

    @CommonSceneRequisite.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.activeEditor = "scene";
        window.activeUser.editingModel = this;
    }
});
