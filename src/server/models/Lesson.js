import { LessonMixinClass } from "~common/models/Lesson";
import ServerModel from "~server/lib/ServerModel";

const CommonServerLesson = LessonMixinClass(ServerModel);
export default ServerModel.buildServerExport(class Lesson extends CommonServerLesson { });
