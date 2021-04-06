import { RecipeItemMixinClass } from "~common/models/RecipeItem";
import Item from "~client/models/Item";

const CommonItemRecipeItem = RecipeItemMixinClass(Item.RawClass);
export default Item.RawClass.buildClientExport(class RecipeItem extends CommonItemRecipeItem { });
