import Vue from 'vue';

import Router from "~client/controllers/Router";
import i18n from "~client/controllers/i18n";
import App from '~client/App.vue';

import Admin from "~client/components/Admin.vue";

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

Vue.config.productionTip = false;
Vue.prototype.window = window;

Router.extendRoutes([{
    name: "admin",
    meta: {
        title: i18n.tc("adminArea")
    },
    path: "/admin",
    component: Admin
}]);

const router = Router.init();

new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');
