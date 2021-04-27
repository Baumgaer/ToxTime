import { RequisiteMixinClass } from "~common/models/Requisite";
import GameObject from "~client/models/GameObject";

const CommonGameObjectRequisite = RequisiteMixinClass(GameObject.RawClass);
export default GameObject.RawClass.buildClientExport(class Requisite extends CommonGameObjectRequisite {

    getAvatar() {
        return {
            type: "image",
            name: `/requisites/${this._id}/avatar?v=${this.getModifyHash()}`,
            title: window.$t("requisite")
        };
    }

    async save() {
        this.isCreatingAvatar = true;
        const result = await super.save();

        const start = Date.now();
        const timeoutInterval = setInterval(() => {
            if (!this.isCreatingAvatar) clearInterval(timeoutInterval);
            if ((Date.now() - start) >= 8000) {
                this.isCreatingAvatar = false;
                clearInterval(timeoutInterval);
            }
        });

        return result;
    }

});
