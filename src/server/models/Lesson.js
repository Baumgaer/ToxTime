import { LessonMixinClass } from "~common/models/Lesson";
import MultiLingualDescribed from "~server/models/MultiLingualDescribed";

const CommonMultiLingualDescribedLesson = LessonMixinClass(MultiLingualDescribed.RawClass);
export default MultiLingualDescribed.RawClass.buildServerExport(class Lesson extends CommonMultiLingualDescribedLesson { });
