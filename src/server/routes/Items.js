import ApiRoute from "~server/lib/ApiRoute";
import Item from "~server/models/Item";

export default class Items extends ApiRoute {

    claimedExport = Item;

}
