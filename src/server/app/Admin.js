import DefaultApp from "~server/lib/DefaultApp";

export default class AdminApp extends DefaultApp {

    constructor(app, server) {
        super(app, server);
        this.routerNamespace = "/admin";
        this.authenticatedOnly = true;
        this.adminRightsNeeded = true;
    }
}
