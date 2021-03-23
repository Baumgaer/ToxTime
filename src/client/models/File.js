import { FileMixinClass } from "~common/models/File";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";

const CommonClientFile = FileMixinClass(ClientModel);
export default ClientModel.buildClientExport(class File extends CommonClientFile {

    /** @type {XMLHttpRequest | null} */
    _xhr = null;
    loadingStatus = 0;
    formData = new FormData();

    getAvatar() {
        const value = { title: window.$t("file") };
        if (this.mime && this.mime.startsWith("image")) {
            return Object.assign(value, { type: "image", name: `/files/${this._id}/avatar` });
        } else return Object.assign(value, { type: "component", name: "file-document-icon" });
    }

    @CommonClientFile.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        if (this._xhr) return this._xhr.abort();
        const result = await ApiClient.delete(`/files/${this._id}`);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        if (result.deleted) return result;

        ApiClient.store.removeModel(this);
    }

    @CommonClientFile.action("restore", { type: "component", name: "delete-restore-icon" }, (instance) => window.activeUser.isAdmin && instance.deleted)
    async restore() {
        const result = await ApiClient.patch(`/files/restore/${this._id}`);

        // We do not want to delete sub objects in case of an error or object
        // was just marked as deleted because it's sticky
        if (result instanceof Error) return result;
        ApiClient.store._trash?.__ob__?.dep.notify();
    }

    @CommonClientFile.action("download", { type: "component", name: "file-download-icon" }, (instance) => window.activeUser.isAdmin && instance._id)
    download() {
        const element = document.createElement('a');
        element.setAttribute('href', `/files/${this._id}/avatar`);
        element.setAttribute('download', this.getName());
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    /**
     * Uploads the file and creates a corresponding model. A proxyfied model
     * is returned.
     *
     * @returns {Promise<File | null>}
     */
    async save() {
        if (this._id) return super.save();

        const reset = (remove) => {
            if (remove) ApiClient.store.removeModel(this);
            this.loadingStatus = 0;
            this._xhr = null;
        };

        return new Promise((resolve) => {
            this.loadingStatus = -1;
            this._xhr = ApiClient.upload("POST", "/files", {
                formData: this.formData,
                onProgress: (progress) => this.loadingStatus = progress,
                onSuccess: (model) => {
                    reset();
                    window.$toasted.success(window.$t("fileUploaded", { name: this.getName() }), { className: "successToaster" });
                    resolve(model);
                },
                onAbort: () => {
                    reset(true);
                    window.$toasted.info(window.$t("fileUploadAborted", { name: this.getName() }), { className: "infoToaster" });
                    resolve(null);
                },
                onError: () => {
                    reset(true);
                    window.$toasted.error(window.$t("fileUploadError", { name: this.getName() }), { className: "errorToaster" });
                    resolve(null);
                }
            }, { "X-DUMMY-MODEL-ID": this._dummyId });
        });
    }

});
