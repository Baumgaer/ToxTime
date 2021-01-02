import Vue from 'vue';

import Router from "~client/controllers/Router";
import i18n from "~client/controllers/i18n";
import App from '~client/App.vue';

import Admin from "~client/components/Admin.vue";

Vue.config.productionTip = false;

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
