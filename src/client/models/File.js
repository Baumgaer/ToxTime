import { FileMixinClass } from "~common/models/File";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";

const CommonClientFile = FileMixinClass(ClientModel);
export default ClientModel.buildClientExport(class File extends CommonClientFile {

    /** @type {XMLHttpRequest | null} */
    _xhr = null;
    loadingStatus = 0;
    formData = new FormData();

    @CommonClientFile.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        if (this._xhr) return this._xhr.abort();
        const result = await ApiClient.delete(`/files/${this._id}`);
        if (!result.success) return result.error;
        ApiClient.store.removeModel(this);
    }

    @CommonClientFile.action("download", { type: "component", name: "file-download-icon" }, (instance) => window.activeUser.isAdmin && instance._id)
    download() {
        const element = document.createElement('a');
        element.setAttribute('href', `/files/${this._id}`);
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
        return new Promise((resolve) => {
            this.loadingStatus = -1;
            this._xhr = new XMLHttpRequest();
            this._xhr.open("POST", "/files", true);
            this._xhr.setRequestHeader("X-DUMMY-MODEL-ID", this._dummyId);
            this._xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) this.loadingStatus = Math.round((event.loaded * 100 / event.total) || 1);
            });
            this._xhr.addEventListener("readystatechange", () => {
                if (this._xhr.readyState === 4 && this._xhr.status === 200) {
                    const responseJson = JSON.parse(this._xhr.response);
                    const errorMapping = {};
                    ApiClient.handleDatabaseError(responseJson, errorMapping);
                    if (errorMapping.data?.models?.length) {
                        window.vm.$toasted.error(window.vm.$t("fileUploadError", { name: this.getName() }), { className: "errorToaster" });
                        ApiClient.store.removeModel(this);
                    } else {
                        ApiClient.handleModels(responseJson);
                        window.vm.$toasted.success(window.vm.$t("fileUploaded", { name: this.getName() }), { className: "successToaster" });
                    }
                    this.loadingStatus = 0;
                    this._xhr = null;
                    resolve(ApiClient.store.getModelById(this.collection, this._id));
                } else if (this._xhr.readyState === 4 && this._xhr.status !== 200) {
                    if (this._xhr.status === 409) {
                        window.vm.$toasted.error(window.vm.$t("fileUploadExists", { name: this.getName() }), { className: "errorToaster" });
                    } else if (this._xhr.status) {
                        window.vm.$toasted.error(window.vm.$t("fileUploadError", { name: this.getName() }), { className: "errorToaster" });
                    } else window.vm.$toasted.info(window.vm.$t("fileUploadAborted", { name: this.getName() }), { className: "infoToaster" });
                    ApiClient.store.removeModel(this);
                    this.loadingStatus = 0;
                    this._xhr = null;
                    resolve(null);
                }
            });
            this._xhr.send(this.formData);
        });
    }

});
