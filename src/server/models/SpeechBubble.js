import { SpeechBubbleMixinClass } from "~common/models/SpeechBubble";
import MultiLingualDescribed from "~server/models/MultiLingualDescribed";

const CommonMultiLingualDescribedSpeechBubble = SpeechBubbleMixinClass(MultiLingualDescribed.RawClass);
export default MultiLingualDescribed.RawClass.buildServerExport(class SpeechBubble extends CommonMultiLingualDescribedSpeechBubble { });
