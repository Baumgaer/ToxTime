import Vue from 'vue';

import Router from "~client/controllers/Router";
import i18n from "~client/controllers/i18n";
import App from '~client/App.vue';

import HelloWorld from "~client/components/HelloWorld.vue";

Vue.config.productionTip = false;

Router.extendRoutes([{
    name: "public",
    meta: {
        title: i18n.tc("helloWorld")
    },
    path: "/public",
    component: HelloWorld
}]);

const router = Router.init();

new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');
