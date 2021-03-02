import { GameSessionMixinClass } from "~common/models/GameSession";
import ServerModel from "~server/lib/ServerModel";

const CommonServerGameSession = GameSessionMixinClass(ServerModel);
export default ServerModel.buildServerExport(class GameSession extends CommonServerGameSession { });
