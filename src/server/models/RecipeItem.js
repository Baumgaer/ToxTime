import { RecipeItemMixinClass } from "~common/models/RecipeItem";
import Item from "~server/models/Item";

const CommonItemRecipeItem = RecipeItemMixinClass(Item.RawClass);
export default Item.RawClass.buildServerExport(class RecipeItem extends CommonItemRecipeItem { });
