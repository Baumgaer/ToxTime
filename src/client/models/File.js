import { FileMixinClass } from "~common/models/File";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";

const CommonClientFile = FileMixinClass(ClientModel);
export default ClientModel.buildClientExport(class File extends CommonClientFile {

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


    async save() {
        if (!this._id) {
            this.loadingStatus = -1;
            this._xhr = new XMLHttpRequest();
            this._xhr.open("POST", "/files", true);
            this._xhr.setRequestHeader("X-DUMMY-MODEL-ID", this._dummyId);
            this._xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) this.loadingStatus = Math.round((event.loaded * 100 / event.total) || 1);
            });
            this._xhr.addEventListener("readystatechange", () => {
                if (this._xhr.readyState === 4 && this._xhr.status === 200) {
                    window.vm.$toasted.success(window.vm.$t("fileUploaded", { name: this.getName() }), { className: "successToaster" });
                    const responseJson = JSON.parse(this._xhr.response);
                    ApiClient.handleModels(responseJson);
                    this.loadingStatus = 0;
                    this._xhr = null;
                } else if (this._xhr.readyState === 4 && this._xhr.status !== 200) {
                    if (this._xhr.status === 409) {
                        window.vm.$toasted.error(window.vm.$t("fileUploadExists", { name: this.getName() }), { className: "errorToaster" });
                    } else if (this._xhr.status) {
                        window.vm.$toasted.error(window.vm.$t("fileUploadError", { name: this.getName() }), { className: "errorToaster" });
                    } else window.vm.$toasted.info(window.vm.$t("fileUploadAborted", { name: this.getName() }), { className: "infoToaster" });
                    ApiClient.store.removeModel(this);
                    this.loadingStatus = 0;
                    this._xhr = null;
                }
            });
            this._xhr.send(this.formData);
        } else super.save();
    }

});
