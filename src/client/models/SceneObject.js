import { SceneObjectMixinClass } from "~common/models/SceneObject";
import Requisite from "~client/models/Requisite";

const CommonSceneObjectRequisite = SceneObjectMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class SceneObject extends CommonSceneObjectRequisite {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('sceneObject')}`;
            }
        }
    };

    getIcon() {
        return "ufo-icon";
    }

    getAvatar(forceIcon) {
        const value = { title: window.$t('sceneObject') };
        if (!forceIcon && this._id && !this.isCreatingAvatar) return Object.assign(super.getAvatar(), value);
        return Object.assign({
            type: "component",
            name: this.getIcon()
        }, value);
    }

    @CommonSceneObjectRequisite.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.activeEditor = "sceneObject";
        window.activeUser.editingModel = this;
    }
});
