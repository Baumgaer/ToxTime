import { LessonMixinClass } from "~common/models/Lesson";
import ClientModel from "~client/lib/ClientModel";
import GameSession from "~client/models/GameSession";
import GameObject from "~client/models/GameObject";

const CommonClientLesson = LessonMixinClass(ClientModel);
export default ClientModel.buildClientExport(class Lesson extends CommonClientLesson {

    /** @type {import("mongoose").SchemaDefinition} */
    static schema = {
        name: {
            default: () => {
                return `${window.$t("newFeminin")} ${window.$t('lesson')}`;
            }
        }
    };

    getAvatar() {
        const value = { title: window.$t("lesson") };
        if (this._id && this.scenes[0]) return Object.assign(this.scenes[0].getAvatar(), value);
        return Object.assign({
            type: "component",
            name: "school-icon"
        }, value);
    }

    @CommonClientLesson.action("edit", { type: "component", name: "lead-pencil-icon" }, () => window.activeUser.isAdmin)
    edit() {
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "addLessons";
    }

    @CommonClientLesson.action("play", { type: "component", name: "play-icon" }, () => true)
    async play() {
        let session = window.activeUser.getGameSessionByLesson(this);

        if (!session) {
            session = new GameSession.Model({ lesson: this, currentScene: this.scenes[0] });
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

    getResources() {
        const resources = [];
        for (const model of [...this.scenes, ...this.inventory]) {
            model.iterateModels((model) => {
                if (!(model instanceof GameObject.RawClass)) return false;
                if (resources.includes(model)) return false;
                resources.push(model);
            });
        }
        for (const sceneObject of this.inventory) {
            if (resources.includes(sceneObject)) continue;
            resources.push(sceneObject);
            sceneObject.iterateModels((model) => {
                if (!(model instanceof GameObject.RawClass)) return false;
                if (resources.includes(model)) return false;
                resources.push(model);
            });
        }
        return resources;
    }

});
