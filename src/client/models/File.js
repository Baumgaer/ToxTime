import { FileMixinClass } from "~common/models/File";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";

const CommonClientFile = FileMixinClass(ClientModel);
export default ClientModel.buildClientExport(class File extends CommonClientFile {

    loadingStatus = 0;
    formData = new FormData();

    @CommonClientFile.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
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
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/files", true);
            xhr.setRequestHeader("X-DUMMY-MODEL-ID", this._dummyId);
            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) this.loadingStatus = Math.round((event.loaded * 100 / event.total) || 1);
            });
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const responseJson = JSON.parse(xhr.response);
                    ApiClient.handleModels(responseJson);
                    this.loadingStatus = 0;
                } else if (xhr.readyState == 4 && xhr.status != 200) {
                    console.log(xhr.responseText);
                    ApiClient.store.removeModel(this);
                    this.loadingStatus = 0;
                }
            });
            xhr.upload.addEventListener("abort", () => this.delete());
            xhr.send(this.formData);
        } else super.save();
    }

});
