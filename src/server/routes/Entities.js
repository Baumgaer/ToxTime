import ApiRoute from "~server/lib/ApiRoute";
import Entity from "~server/models/Entity";

export default class Entities extends ApiRoute {

    claimedExport = Entity;

}
