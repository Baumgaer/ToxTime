import ApiRoute from "~server/lib/ApiRoute";
import RecipeItem from "~server/models/RecipeItem";

export default class RecipeItems extends ApiRoute {

    claimedExport = RecipeItem;

}
