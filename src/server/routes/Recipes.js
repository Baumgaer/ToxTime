import ApiRoute from "~server/lib/ApiRoute";
import Recipe from "~server/models/Recipe";

export default class Recipes extends ApiRoute {

    claimedExport = Recipe;

}
