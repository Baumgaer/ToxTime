import ApiRoute from "~server/lib/ApiRoute";
import KnowledgeModel from "~server/models/Knowledge";

export default class Knowledge extends ApiRoute {

    claimedExport = KnowledgeModel;

}
