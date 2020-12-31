import DefaultApp from "~server/lib/DefaultApp";

export default class AdminApp extends DefaultApp {

    constructor(app, server, renderEngine) {
        super(app, server, renderEngine);
        this.routerNamespace = "/admin";
    }
}
