import Vue from 'vue';

import Router from "~client/router";
import i18n from "~client/controllers/i18n";
import App from '~client/App.vue';

import HelloWorld from "~client/components/HelloWorld.vue";

Vue.config.productionTip = false;

Router.extendRoutes([{
    name: "admin",
    meta: {
        title: i18n.tc("helloAdmin")
    },
    path: "/admin",
    component: HelloWorld
}]);

const router = Router.init();

new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');
