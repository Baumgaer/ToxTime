import "~client/Common";
import Vue from 'vue';
import Router from "~client/lib/Router";
import i18n from "~client/lib/i18n";
import App from '~client/App.vue';

import Public from "~client/components/Public.vue";

Router.extendRoutes([{
    name: "public",
    meta: {
        title: i18n.tc("helloWorld")
    },
    path: "/public",
    component: Public
}]);

const router = Router.init();

window.vm = new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');
