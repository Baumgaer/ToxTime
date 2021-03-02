import { GameSessionMixinClass } from "~common/models/GameSession";
import ClientModel from "~client/lib/ClientModel";

const CommonClientGameSession = GameSessionMixinClass(ClientModel);
export default ClientModel.buildClientExport(class GameSession extends CommonClientGameSession { });
