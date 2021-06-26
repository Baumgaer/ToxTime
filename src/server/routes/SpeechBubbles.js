import ApiRoute from "~server/lib/ApiRoute";
import SpeechBubble from "~server/models/SpeechBubble";

export default class SpeechBubbles extends ApiRoute {

    claimedExport = SpeechBubble;

}
