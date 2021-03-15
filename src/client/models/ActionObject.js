import { ActionObjectMixinClass } from "~common/models/ActionObject";
import GameObject from "~client/models/GameObject";

const CommonGameObjectActionObject = ActionObjectMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ActionObject extends CommonGameObjectActionObject {

    getAvatar() {
        return {
            type: "component",
            name: "ufo-icon",
            title: window.vm.$t('actionObject')
        };
    }

});
