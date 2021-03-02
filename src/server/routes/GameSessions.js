import ApiRoute from "~server/lib/ApiRoute";
import GameSession from "~server/models/GameSession";

export default class GameSessions extends ApiRoute {

    claimedExport = GameSession;

}
