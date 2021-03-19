import { ClickAreaMixinClass } from "~common/models/ClickArea";
import GameObject from "~client/models/GameObject";

const CommonGameObjectClickArea = ClickAreaMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class ClickArea extends CommonGameObjectClickArea {

    getAvatar() {
        return {
            type: "component",
            name: "cursor-default-click-icon",
            title: window.$t('clickArea')
        };
    }

});
