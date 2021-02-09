import { LessonMixinClass } from "~common/models/Lesson";
import ClientModel from "~client/lib/ClientModel";

const CommonClientLesson = LessonMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Lesson extends CommonClientLesson { });
