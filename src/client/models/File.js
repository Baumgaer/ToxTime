import { FileMixinClass } from "~common/models/File";
import ApiClient from "~client/lib/ApiClient";
import ClientModel from "~client/lib/ClientModel";

const CommonClientFile = FileMixinClass(ClientModel);
export default ClientModel.buildClientExport(class File extends CommonClientFile {

    uploadProgress = 0;
    formData = new FormData();

    @CommonClientFile.action("delete", { type: "component", name: "delete-icon" }, () => window.activeUser.isAdmin)
    async delete() {
        const result = await ApiClient.delete(`/files/${this._id}`);
        if (!result.success) return result.error;
        ApiClient.store.removeModel(this);
    }

    async save() {
        if (!this._id) {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", "/files", true);
            xhr.upload.addEventListener("progress", (event) => {
                if (event.lengthComputable) this.uploadProgress = (event.loaded * 100 / event.total) || 100;
            });
            xhr.setRequestHeader("X-DUMMY-MODEL-ID", this._dummyId);
            xhr.addEventListener("readystatechange", () => {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    const responseJson = JSON.parse(xhr.response);
                    ApiClient.handleModels(responseJson);
                } else if (xhr.readyState == 4 && xhr.status != 200) {
                    console.log(xhr.responseText);
                }
            });
            xhr.upload.addEventListener("abort", () => this.delete());
            xhr.send(this.formData);
        } else super.save();
    }

});
