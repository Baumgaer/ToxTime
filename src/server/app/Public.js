import DefaultApp from "~server/lib/DefaultApp";

export default class PublicApp extends DefaultApp {

    constructor(app, server) {
        super(app, server);
        this.routerNamespace = "/public";
        this.authenticatedOnly = true;
    }
}
