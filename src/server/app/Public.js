import DefaultApp from "~server/lib/DefaultApp";

export default class PublicApp extends DefaultApp {

    constructor(app, server, renderEngine) {
        super(app, server, renderEngine);
        this.routerNamespace = "/public";
        this.adminRightsNeeded = false;
    }
}
