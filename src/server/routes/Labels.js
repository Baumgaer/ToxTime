import ApiRoute from "~server/lib/ApiRoute";
import Label from "~server/models/Label";

export default class Labels extends ApiRoute {

    claimedExport = Label;

}
