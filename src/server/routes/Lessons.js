import ApiRoute from "~server/lib/ApiRoute";
import Lesson from "~server/models/Lesson";

export default class Lessons extends ApiRoute {

    claimedExport = Lesson;

}
