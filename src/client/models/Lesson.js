import { LessonMixinClass } from "~common/models/Lesson";
import ClientModel from "~client/lib/ClientModel";
import GameSession from "~client/models/GameSession";
import ApiClient from "~client/lib/ApiClient";

const CommonClientLesson = LessonMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Lesson extends CommonClientLesson {

    getAvatar() {
        const value = { title: window.vm.$t("lesson") };
        if (this._id && this.scenes[0]) return Object.assign(this.scenes[0].getAvatar(), value);
        return Object.assign({
            type: "component",
            name: "school-icon"
        }, value);
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

    @CommonClientLesson.action("play", { type: "component", name: "play-icon" }, () => true)
    async play() {
        let session = window.activeUser.getGameSessionByLesson(this);

        if (!session) {
            session = ApiClient.store.addModel(new GameSession.Model({ lesson: this, currentScene: this.scenes[0] }));
            window.activeUser.currentGameSessions.push(session);
        } else {
            const indexInSolved = window.activeUser.solvedGameSessions.indexOf(session);
            if (indexInSolved >= 0) {
                window.activeUser.solvedGameSessions.splice(indexInSolved, 1);
                window.activeUser.currentGameSessions.push(session);
            }
        }

        await window.activeUser.save();
        window.activeUser.editingModel = session;
        window.activeUser.activeEditor = "playGame";
    }

});
