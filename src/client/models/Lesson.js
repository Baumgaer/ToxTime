import { LessonMixinClass } from "~common/models/Lesson";
import ClientModel from "~client/lib/ClientModel";
import ApiClient from "~client/lib/ApiClient";

const CommonClientLesson = LessonMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Lesson extends CommonClientLesson {

    getAvatar() {
        if (this._id && this.scenes[0]) return this.scenes[0].getAvatar();
        return {
            type: "component",
            name: "school-icon"
        };
    }

    @CommonClientLesson.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        if (!this._id) {
            this.destroy();
            window.activeUser.activeEditor = null;
            window.activeUser.editingModel = null;
            return;
        }

        const result = await ApiClient.delete(`/lessons/${this._id}`);
        if ((result instanceof Error)) return result;
        ApiClient.store.removeModel(this);
    }

    @CommonClientLesson.action("copy", { type: "component", name: "content-copy-icon" }, () => window.activeUser.isAdmin)
    copy() {
        ApiClient.post(`/${this.collection}/copy/${this._id}`, {
            name: `${window.vm.$t("copyOf")} ${this.getName()}`
        });
    }

    @CommonClientLesson.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.activeEditor = "addLessons";
        window.activeUser.editingModel = this;
    }

});
