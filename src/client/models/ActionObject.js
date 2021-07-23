import { ActionObjectMixinClass } from "~common/models/ActionObject";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

const CommonGameObjectActionObject = ActionObjectMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ActionObject extends CommonGameObjectActionObject {

    /** @type {import("mongoose").SchemaDefinition} */
    static schemaDefinition = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('actionObject')}`;
            }
        }
    };

    getIcon() {
        return "movie-open-icon";
    }

    getAvatar() {
        return {
            type: "component",
            name: this.getIcon(),
            title: window.$t('actionObject')
        };
    }

    getParent() {
        const sceneObjectParent = ApiClient.store.indexValuesOf("sceneObjects", this)?.[0];
        const sceneParent = ApiClient.store.indexValuesOf("scenes", this)?.[0];
        return sceneObjectParent || sceneParent;
    }

    getOverwritableFields(lesson) {
        const value = (lesson && lesson.getOverwrite(this, "activated")) ?? true;
        return [
            { name: "activated", type: 'checkbox', value, disabled: false }
        ];
    }

    @CommonGameObjectActionObject.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => {
        const store = ApiClient.store;
        const mayContainingScene = store.indexValuesOf("scenes", instance)[0];
        const mayContainingSceneObject = store.indexValuesOf("sceneObjects", instance)[0];
        return window.activeUser.isAdmin && instance.deleted && !(mayContainingScene?.deleted || mayContainingSceneObject?.deleted);
    })
    restore() {
        return super.restore();
    }

    @CommonGameObjectActionObject.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonGameObjectActionObject.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
