import Vue from 'vue';

import router from "~client/router";
import i18n from "~client/i18n";
import App from '~client/App.vue';

Vue.config.productionTip = false;

router.beforeEach((to, _from, next) => {
    let title = to.meta.title;
    const component = to.matched.find((item) => {
        if (item.name === to.name) return true;
        return false;
    });
    if (component && component.components && component.components.default && component.components.default && component.components.default.props.subTitle) {
        title = `${component.components.default.props.subTitle} - ${title}`;
    }
    document.title = title;
    next();
});

new Vue({
    i18n,
    router,
    render: h => h(App)
}).$mount('#app');
