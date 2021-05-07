import { UserMixinClass } from "~common/models/User";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";
import { resolveProxy } from "~common/utils";

const CommonClientUser = UserMixinClass(ClientModel);
export default ClientModel.buildClientExport(class User extends CommonClientUser {

    /** @type {"addUsers" | "editUser" | "scene" | "sceneObject" | null} */
    activeEditor = null;

    /** @type {ClientModel | null} */
    editingModel = null;

    getAvatar() {
        return {
            type: "component",
            name: "account-icon",
            title: window.$t("user")
        };
    }

    @CommonClientUser.action("delete", { type: "component", name: "delete-icon" }, (instance) => window.activeUser.isAdmin && !instance.deleted && instance !== window.activeUser, true)
    async delete() {
        return await super.delete();
    }

    @CommonClientUser.action("resentConfirm", { type: "component", name: "email-check-icon" }, (instance) => !instance.isConfirmed)
    async resentConfirm() {
        const result = await ApiClient.patch(`/users/resentConfirm/${this._id}`);
        if ((result instanceof Error)) return result;
        return true;
    }

    @CommonClientUser.action("lock", { type: "component", name: "lock-icon" }, (instance) => instance.isActive && instance !== window.activeUser && window.activeUser.isAdmin)
    @CommonClientUser.action("unlock", { type: "component", name: "lock-open-icon" }, (instance) => !instance.isActive && instance !== window.activeUser && window.activeUser.isAdmin)
    async toggleLock() {
        const result = await ApiClient.patch(`/users/toggleLock/${this._id}`);
        if ((result instanceof Error)) return result;
        return true;
    }

    @CommonClientUser.action("logout", { type: "component", name: "logout-icon" }, (instance) => window.activeUser.isAdmin || instance === window.activeUser)
    async kick() {
        if (this === window.activeUser) {
            location.href = "/logout";
            return true;
        }
        const result = await ApiClient.get(`/logout/${this._id}`);
        if ((result instanceof Error)) return result;
        return true;
    }

    @CommonClientUser.action("edit", { type: "component", name: "lead-pencil-icon" }, (instance) => window.activeUser.isAdmin || instance === window.activeUser)
    async edit() {
        const shouldProceed = await super.edit();
        if (!shouldProceed) return;
        window.activeUser.editingModel = this;
        window.activeUser.activeEditor = "editUser";
    }

    @CommonClientUser.action("copy", { type: "component", name: "content-copy-icon" }, () => false)
    copy() { }

    getGameSessionByLesson(lesson) {
        const filter = (gameSession) => resolveProxy(gameSession.lesson) === resolveProxy(lesson);

        for (const category of ["currentGameSessions", "solvedGameSessions"]) {
            const gameSession = this[category].find(filter);
            if (gameSession) return gameSession;
        }

        return null;
    }

    deleteGameSessionByLesson(lesson) {
        const filter = (gameSession) => resolveProxy(gameSession.lesson) === resolveProxy(lesson);

        for (const category of ["currentGameSessions", "solvedGameSessions"]) {
            const gameSession = this[category].find(filter);
            if (gameSession) {
                this[category].splice(this[category].indexOf(gameSession), 1);
                ApiClient.store.removeModel(gameSession);
            }
        }

        this.save();
    }
});
