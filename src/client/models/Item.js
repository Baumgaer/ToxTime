import { ItemMixinClass } from "~common/models/Item";
import ClientModel from "~client/lib/ClientModel";

const CommonClientItem = ItemMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Item extends CommonClientItem {

    getAvatar() {
        if (!this.object) return { type: "image", name: "" };
        return this.object.file.getAvatar();
    }

    getName() {
        if (!this.object) return "";
        return this.object.getName();
    }

});
