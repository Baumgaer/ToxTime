import { RecipeItemMixinClass } from "~common/models/RecipeItem";
import Item from "~client/models/Item";

const CommonItemRecipeItem = RecipeItemMixinClass(Item.RawClass);
export default Item.RawClass.buildClientExport(class RecipeItem extends CommonItemRecipeItem {

    getAvatar() {
        const object = this.object;
        if (!object) return {};
        if (object === this.label) return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
        if (object === this.sceneObject) return object.getAvatar();
        if (object === this.actionObject) return object.sceneObject.getAvatar();
        if (object === this.file) return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
        return Object.assign({}, object.getAvatar(), { type: "text", name: object.name });
    }

    getOverlayIcons() {
        const object = this.object;
        if (!object) return "";
        if (object === this.label) return "label-icon";
        if (object === this.sceneObject) return "ufo-icon";
        if (object === this.actionObject) return "movie-open-icon";
        if (object === this.file) return "file-document-icon";
        return "cursor-default-click-icon";
    }

});
