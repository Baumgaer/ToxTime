import Vue from 'vue';
import VueRouter from 'vue-router';
import i18n from "~client/i18n";

// import components
import HelloWorld from "~client/components/HelloWorld.vue";

const routes = [
    {
        name: "helloWorld",
        meta: {
            title: i18n.tc("helloWorld")
        },
        path: "/",
        component: HelloWorld
    }
];

Vue.use(VueRouter);
export default new VueRouter({ routes });
