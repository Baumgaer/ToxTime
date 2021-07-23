import { ClickAreaMixinClass } from "~common/models/ClickArea";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

const CommonGameObjectClickArea = ClickAreaMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ClickArea extends CommonGameObjectClickArea {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newMaskulin")} ${window.$t('clickArea')}`;
            }
        }
    };

    getIcon() {
        return "cursor-default-click-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: window.$t('clickArea')
        };
    }

    getParent() {
        const sceneObjectParent = ApiClient.store.indexValuesOf("sceneObjects", this)?.[0];
        const sceneParent = ApiClient.store.indexValuesOf("scenes", this)?.[0];
        return sceneObjectParent || sceneParent;
    }

    getOverwritableFields(lesson) {
        const value = (lesson && lesson.getOverwrite(this, "amount")) ?? 1;
        return [
            { name: "amount", type: 'number', value, min: 0, max: Infinity, disabled: false }
        ];
    }

    @CommonGameObjectClickArea.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => {
        const store = ApiClient.store;
        const mayContainingScene = store.indexValuesOf("scenes", instance)[0];
        const mayContainingSceneObject = store.indexValuesOf("sceneObjects", instance)[0];
        return window.activeUser.isAdmin && instance.deleted && !(mayContainingScene?.deleted || mayContainingSceneObject?.deleted);
    })
    restore() {
        return super.restore();
    }

    @CommonGameObjectClickArea.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonGameObjectClickArea.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
