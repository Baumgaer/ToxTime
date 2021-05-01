import { SceneObjectMixinClass } from "~common/models/SceneObject";
import Requisite from "~client/models/Requisite";

const CommonSceneObjectRequisite = SceneObjectMixinClass(Requisite.RawClass);
export default Requisite.RawClass.buildClientExport(class SceneObject extends CommonSceneObjectRequisite {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('sceneObject')}`;
            }
        }
    };

    getAvatar(forceIcon) {
        const value = { title: window.$t('sceneObject') };
        if (!forceIcon && this._id && !this.isCreatingAvatar) return Object.assign(super.getAvatar(), value);
        return Object.assign({
            type: "component",
            name: "ufo-icon"
        }, value);
    }

    @CommonSceneObjectRequisite.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted)
    async edit() {
        await super.edit();
        window.activeUser.activeEditor = "sceneObject";
        window.activeUser.editingModel = this;
    }
});
