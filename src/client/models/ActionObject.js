import { ActionObjectMixinClass } from "~common/models/ActionObject";
import GameObject from "~client/models/GameObject";
import ApiClient from "~client/lib/ApiClient";

const CommonGameObjectActionObject = ActionObjectMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ActionObject extends CommonGameObjectActionObject {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newNeutral")} ${window.$t('actionObject')}`;
            }
        }
    };

    getAvatar() {
        return {
            type: "component",
            name: "movie-open-icon",
            title: window.$t('actionObject')
        };
    }

    @CommonGameObjectActionObject.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => {
        const indexes = ApiClient.store.indexes;
        const mayContainingScene = Array.from(indexes.scenes?.get(instance).values() || [])?.[0];
        const mayContainingSceneObject = Array.from(indexes.sceneObjects?.get(instance).values() || [])?.[0];
        return window.activeUser.isAdmin && instance.deleted && !(mayContainingScene?.deleted || mayContainingSceneObject?.deleted);
    })
    restore() {
        return super.restore();
    }

    @CommonGameObjectActionObject.action("delete", { type: "component", name: "delete-icon" }, () => false)
    @CommonGameObjectActionObject.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    fakeAction() { }

});
