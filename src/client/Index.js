import "~client/Common";
import Vue from 'vue';
import Router from "~client/controllers/Router";
import i18n from "~client/controllers/i18n";
import App from '~client/App.vue';

Vue.config.productionTip = false;
Vue.prototype.window = window;

const router = Router.init();

new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');
