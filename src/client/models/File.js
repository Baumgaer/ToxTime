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
        const value = { title: window.vm.$t("file") };
        if (this.mime && this.mime.startsWith("image")) {
            return Object.assign(value, { type: "image", name: `/files/${this._id}/avatar` });
        } else return Object.assign(value, { type: "component", name: "file-document-icon" });
    }

    @CommonClientFile.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        if (this._xhr) return this._xhr.abort();
        const result = await ApiClient.delete(`/files/${this._id}`);
        if (result instanceof Error) return result;
        ApiClient.store.removeModel(this);
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
                    window.vm.$toasted.success(window.vm.$t("fileUploaded", { name: this.getName() }), { className: "successToaster" });
                    resolve(model);
                },
                onAbort: () => {
                    reset(true);
                    window.vm.$toasted.info(window.vm.$t("fileUploadAborted", { name: this.getName() }), { className: "infoToaster" });
                    resolve(null);
                },
                onError: () => {
                    reset(true);
                    window.vm.$toasted.error(window.vm.$t("fileUploadError", { name: this.getName() }), { className: "errorToaster" });
                    resolve(null);
                }
            }, { "X-DUMMY-MODEL-ID": this._dummyId });
        });
    }

});
