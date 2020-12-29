import Vue from 'vue';
import VueRouter from 'vue-router';
import i18n from "~client/controllers/i18n";

// import components
import HelloWorld from "~client/components/HelloWorld.vue";
import Login from "~client/components/Login.vue";

const routes = [
    {
        name: "admin",
        meta: {
            title: i18n.tc("helloAdmin")
        },
        path: "/admin",
        component: HelloWorld
    },
    {
        name: "public",
        meta: {
            title: i18n.tc("helloWorld")
        },
        path: "/public",
        component: HelloWorld
    },
    {
        name: "login",
        meta: {
            title: i18n.tc("helloLogin")
        },
        path: "/",
        component: Login
    },
    {
        name: "loginreset",
        meta: {
            title: i18n.tc("helloLogin")
        },
        path: "/login/reset",
        component: HelloWorld
    }
];

Vue.use(VueRouter);
export default new VueRouter({ mode: "history", routes });
