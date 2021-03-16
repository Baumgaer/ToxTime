import "reflect-metadata";
import Vue from 'vue';
import ApiClient from "~client/lib/ApiClient";
import "~client/less/common.less";
import Toasted from 'vue-toasted';
import TextareaAutosize from "vue-textarea-autosize";

window._store = ApiClient.store;

Vue.use(TextareaAutosize);
Vue.use(Toasted, { duration: 5000 });


// Import Icons
import AccountIcon from "vue-material-design-icons/Account";
import SchoolIcon from "vue-material-design-icons/School";
import TheaterIcon from "vue-material-design-icons/Theater";
import UfoIcon from "vue-material-design-icons/Ufo";
import GraphIcon from "vue-material-design-icons/Graph";
import CogIcon from "vue-material-design-icons/Cog";
import PlusIcon from "vue-material-design-icons/Plus";
import ArrowCollapseLeftIcon from "vue-material-design-icons/ArrowCollapseLeft";
import ArrowCollapseRightIcon from "vue-material-design-icons/ArrowCollapseRight";
import SendIcon from "vue-material-design-icons/Send";
import CloseThickIcon from "vue-material-design-icons/CloseThick";
import CheckBoldIcon from "vue-material-design-icons/CheckBold";
import EmailCheckIcon from "vue-material-design-icons/EmailCheck";
import LeadPencilIcon from "vue-material-design-icons/LeadPencil";
import LockIcon from "vue-material-design-icons/Lock";
import LockOpenIcon from "vue-material-design-icons/LockOpen";
import DeleteIcon from "vue-material-design-icons/Delete";
import LogoutIcon from "vue-material-design-icons/Logout";
import FileUploadIcon from "vue-material-design-icons/FileUpload";
import FileDownloadIcon from "vue-material-design-icons/FileDownload";
import FileMultipleIcon from "vue-material-design-icons/FileMultiple";
import FileDocumentIcon from "vue-material-design-icons/FileDocument";
import CheckIcon from "vue-material-design-icons/Check";
import CrownIcon from "vue-material-design-icons/Crown";
import ContentSaveIcon from "vue-material-design-icons/ContentSave";
import CloseIcon from "vue-material-design-icons/Close";
import HandLeftIcon from "vue-material-design-icons/HandLeft";
import VectorPolygonIcon from "vue-material-design-icons/VectorPolygon";
import CursorDefaultClickIcon from "vue-material-design-icons/CursorDefaultClick";
import ArrangeBringForwardIcon from "vue-material-design-icons/ArrangeBringForward";
import ContentCopyIcon from "vue-material-design-icons/ContentCopy";
import PlayIcon from "vue-material-design-icons/Play";
import MenuRightIcon from "vue-material-design-icons/MenuRight";
import MenuDownIcon from "vue-material-design-icons/MenuDown";
import MovieOpenIcon from "vue-material-design-icons/MovieOpen";
import PinIcon from "vue-material-design-icons/Pin";

if (Object.keys(window.userInformation).length) {
    ApiClient.handleModels(window.userInformation);
    window.activeUser = ApiClient.store.getModelById(window.userInformation.collection, window.userInformation._id);
}

Vue.config.productionTip = false;
Vue.prototype.window = window;
Vue.prototype.global = window;

// Attach Icons
Vue.component('account-icon', AccountIcon);
Vue.component('school-icon', SchoolIcon);
Vue.component('theater-icon', TheaterIcon);
Vue.component('ufo-icon', UfoIcon);
Vue.component('graph-icon', GraphIcon);
Vue.component('cog-icon', CogIcon);
Vue.component('plus-icon', PlusIcon);
Vue.component('arrow-collapse-left-icon', ArrowCollapseLeftIcon);
Vue.component('arrow-collapse-right-icon', ArrowCollapseRightIcon);
Vue.component('send-icon', SendIcon);
Vue.component('close-thick-icon', CloseThickIcon);
Vue.component('check-bold-icon', CheckBoldIcon);
Vue.component('email-check-icon', EmailCheckIcon);
Vue.component('lead-pencil-icon', LeadPencilIcon);
Vue.component('lock-icon', LockIcon);
Vue.component('lock-open-icon', LockOpenIcon);
Vue.component('delete-icon', DeleteIcon);
Vue.component('logout-icon', LogoutIcon);
Vue.component('file-upload-icon', FileUploadIcon);
Vue.component('file-download-icon', FileDownloadIcon);
Vue.component('file-multiple-icon', FileMultipleIcon);
Vue.component('file-document-icon', FileDocumentIcon);
Vue.component('check-icon', CheckIcon);
Vue.component('crown-icon', CrownIcon);
Vue.component('content-save-icon', ContentSaveIcon);
Vue.component('close-icon', CloseIcon);
Vue.component('hand-left-icon', HandLeftIcon);
Vue.component('vector-polygon-icon', VectorPolygonIcon);
Vue.component('cursor-default-click-icon', CursorDefaultClickIcon);
Vue.component('arrange-bring-forward-icon', ArrangeBringForwardIcon);
Vue.component('content-copy-icon', ContentCopyIcon);
Vue.component('play-icon', PlayIcon);
Vue.component('menu-right-icon', MenuRightIcon);
Vue.component('menu-down-icon', MenuDownIcon);
Vue.component('movie-open-icon', MovieOpenIcon);
Vue.component('pin-icon', PinIcon);
